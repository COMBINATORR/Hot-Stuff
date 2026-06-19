import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { telegramData, redirectTo } = req.body;

  if (!telegramData || !telegramData.hash) {
    return res.status(400).json({ error: 'Missing Telegram data or hash' });
  }

  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) {
    return res.status(500).json({ error: 'TELEGRAM_BOT_TOKEN environment variable not set on server' });
  }

  // 1. Verify Telegram hash
  const { hash, ...data } = telegramData;
  
  // Sort keys alphabetically and construct check string
  const checkString = Object.keys(data)
    .sort()
    .map(key => `${key}=${data[key]}`)
    .join('\n');

  // Compute secret key as SHA256 of bot token
  const secretKey = crypto.createHash('sha256').update(botToken).digest();

  // Compute HMAC-SHA256 of checkString using secretKey
  const hmac = crypto.createHmac('sha256', secretKey).update(checkString).digest('hex');

  // Check if hash matches
  try {
    const hmacBuffer = Buffer.from(hmac, 'hex');
    const hashBuffer = Buffer.from(hash, 'hex');
    if (hmacBuffer.length !== hashBuffer.length || !crypto.timingSafeEqual(hmacBuffer, hashBuffer)) {
      return res.status(401).json({ error: 'Data integrity check failed. Hash mismatch.' });
    }
  } catch (err) {
    return res.status(401).json({ error: 'Data integrity check failed. Hash format invalid.' });
  }

  // Check if authentication date is too old (expired in 24 hours)
  const authDate = parseInt(data.auth_date, 10);
  const now = Math.floor(Date.now() / 1000);
  if (now - authDate > 86400) {
    return res.status(401).json({ error: 'Authentication data has expired' });
  }

  // 2. Initialize Supabase Admin client
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_VITE_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return res.status(500).json({ error: 'Supabase URL or Service Role Key not configured on server' });
  }

  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  const email = `tg_${data.id}@hotstuff.kz`;
  const name = `${data.first_name || ''} ${data.last_name || ''}`.trim() || data.username || `User_${data.id}`;
  const avatarUrl = data.photo_url || null;

  try {
    // 3. Check if user profile already exists
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (profileError && profileError.code !== 'PGRST116') {
      throw profileError;
    }

    if (profile) {
      // User exists - update metadata
      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(profile.id, {
        user_metadata: {
          full_name: name,
          avatar_url: avatarUrl,
          telegram_id: data.id,
          telegram_username: data.username
        }
      });
      if (updateError) throw updateError;
    } else {
      // Create user
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email,
        email_confirm: true,
        user_metadata: {
          full_name: name,
          avatar_url: avatarUrl,
          telegram_id: data.id,
          telegram_username: data.username
        }
      });
      if (createError) throw createError;
    }

    // 4. Generate magic link for the user
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email,
      options: {
        redirectTo: redirectTo || `${supabaseUrl}/auth/v1/callback`
      }
    });

    if (linkError) throw linkError;

    return res.status(200).json({ 
      success: true, 
      action_link: linkData.properties.action_link 
    });

  } catch (error) {
    console.error('[Telegram Auth API Error]', error);
    // 🛡️ Sentinel: Do not leak internal error details or stack traces to the client
    return res.status(500).json({ error: 'Internal server error during authentication' });
  }
}

import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
    : ['http://localhost:3000', 'https://hotstuff.kz'];
  const origin = req.headers.origin;
  const allowOrigin = allowedOrigins.includes(origin) ? origin : allowedOrigins[0];
  res.setHeader('Access-Control-Allow-Origin', allowOrigin);
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

  const botToken = process.env.TELEGRAM_BOT_TOKEN ? process.env.TELEGRAM_BOT_TOKEN.trim() : '';
  if (!botToken || !/^[0-9]+:[a-zA-Z0-9_-]+$/.test(botToken)) {
    console.error('[Telegram Auth] Invalid or missing TELEGRAM_BOT_TOKEN.');
    return res.status(500).json({ error: 'Server configuration error' });
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
      return res.status(401).json({ error: 'Data integrity check failed.' });
    }
  } catch (err) {
    return res.status(401).json({ error: 'Data integrity check failed.' });
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

  const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000,https://hotstuff.kz').split(',').map(o => o.trim());
  let safeRedirectTo = `${supabaseUrl}/auth/v1/callback`;

  if (redirectTo) {
    try {
      const redirectUrl = new URL(redirectTo);
      if (allowedOrigins.includes(redirectUrl.origin)) {
        safeRedirectTo = redirectTo;
      } else {
        console.warn(`[Telegram Auth] Blocked redirect to untrusted origin: ${redirectUrl.origin}`);
      }
    } catch (e) {
      console.warn('[Telegram Auth] Invalid redirectTo URL provided');
    }
  }

    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email,
      options: {
        redirectTo: safeRedirectTo
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

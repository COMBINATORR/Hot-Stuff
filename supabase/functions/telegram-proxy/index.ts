import "@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "@supabase/supabase-js";

function getCorsHeaders(reqOrigin: string | null) {
  const envOrigins = Deno.env.get("ALLOWED_ORIGINS");
  const allowedOrigins = ["http://localhost:3000"];
  if (envOrigins) {
    allowedOrigins.push(...envOrigins.split(",").map((o) => o.trim()));
  }

  const isAllowed = reqOrigin && allowedOrigins.includes(reqOrigin);
  return {
    "Access-Control-Allow-Origin": isAllowed
      ? reqOrigin
      : "http://localhost:3000",
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS, PUT, DELETE",
    "Access-Control-Allow-Credentials": "true",
  };
}

Deno.serve(async (req) => {
  const reqOrigin = req.headers.get("Origin");
  const corsHeaders = getCorsHeaders(reqOrigin);

  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const { telegramData } = await req.json();
    if (!telegramData || !telegramData.hash) {
      return new Response(JSON.stringify({ error: "Missing Telegram data or hash" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const botToken = Deno.env.get("TELEGRAM_BOT_TOKEN");
    if (!botToken) {
      console.error("TELEGRAM_BOT_TOKEN secret is not set in Supabase Edge Functions");
      return new Response(JSON.stringify({ error: "Server configuration error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 1. Verify Telegram hash
    const { hash, ...data } = telegramData;
    
    // Sort keys alphabetically and construct check string
    const checkString = Object.keys(data)
      .sort()
      .map((key) => `${key}=${data[key]}`)
      .join("\n");

    // Compute secret key as SHA256 of bot token using Web Crypto API
    const tokenBytes = new TextEncoder().encode(botToken);
    const secretKeyBuffer = await crypto.subtle.digest("SHA-256", tokenBytes);

    // Import the secret key for HMAC
    const key = await crypto.subtle.importKey(
      "raw",
      secretKeyBuffer,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );

    // Compute HMAC-SHA256 of checkString
    const checkStringBytes = new TextEncoder().encode(checkString);
    const signatureBuffer = await crypto.subtle.sign(
      "HMAC",
      key,
      checkStringBytes
    );

    // Convert signature to hex string
    const signatureArray = new Uint8Array(signatureBuffer);
    const hmac = Array.from(signatureArray)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    if (hmac !== hash) {
      console.warn("Telegram authentication signature check failed. Hash mismatch.");
      return new Response(JSON.stringify({ error: "Data integrity check failed. Hash mismatch." }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check if authentication date is too old (expired in 24 hours)
    const authDate = parseInt(data.auth_date, 10);
    const now = Math.floor(Date.now() / 1000);
    if (now - authDate > 86400) {
      return new Response(JSON.stringify({ error: "Authentication data has expired" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 2. Initialize Supabase Admin client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const email = `tg_${data.id}@telegram.hotstuff`;
    const name = `${data.first_name || ""} ${data.last_name || ""}`.trim() || data.username || `User_${data.id}`;
    const avatarUrl = data.photo_url || null;

    // 3. Check if user already exists
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (profileError && profileError.code !== "PGRST116") {
      throw profileError;
    }

    if (profile) {
      // User exists - update metadata
      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(profile.id, {
        user_metadata: {
          name: name,
          full_name: name,
          picture: avatarUrl,
          avatar_url: avatarUrl,
          telegram_id: data.id,
          telegram_username: data.username,
          email_verified: true,
        },
      });
      if (updateError) throw updateError;
    } else {
      // Create user
      const { error: createError } = await supabaseAdmin.auth.admin.createUser({
        email,
        email_confirm: true,
        user_metadata: {
          name: name,
          full_name: name,
          picture: avatarUrl,
          avatar_url: avatarUrl,
          telegram_id: data.id,
          telegram_username: data.username,
          email_verified: true,
        },
      });
      if (createError) throw createError;
    }

    // 4. Generate magic link
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: "magiclink",
      email,
      options: {
        redirectTo: `${reqOrigin || "http://localhost:3000"}/account`,
      },
    });

    if (linkError) throw linkError;

    // 5. Verify the link immediately to get the active session
    const { data: sessionData, error: sessionError } = await supabaseAdmin.auth.verifyOtp({
      token_hash: linkData.properties.hashed_token,
      type: "magiclink",
    });

    if (sessionError) throw sessionError;

    // 6. Return session JSON
    return new Response(JSON.stringify({ session: sessionData.session }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Exception in telegram-proxy:", errorMessage);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

import "@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS, PUT, DELETE",
};

// Global in-memory logs buffer
const logs: any[] = [];

async function addLog(message: string, detail?: any) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    message,
    detail
  };
  console.log(`${message}:`, JSON.stringify(detail || ""));
  logs.unshift(logEntry);
  if (logs.length > 50) {
    logs.pop();
  }

  // Also send to RequestCatcher for robust retrieval
  try {
    await fetch("https://hotstuff-yandex.requestcatcher.com/log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(logEntry),
    });
  } catch (e) {
    // Fail silently for webhook logger
  }
}

Deno.serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const url = new URL(req.url);

  // Serve mock JWKS keys to satisfy Supabase's Custom Provider validation
  if (url.pathname.endsWith("/jwks")) {
    await addLog("JWKS Endpoint Called", { url: req.url, method: req.method });
    return new Response(JSON.stringify({ keys: [] }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Endpoint to retrieve logs for debugging
  if (url.pathname.endsWith("/logs")) {
    return new Response(JSON.stringify(logs), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const headersObj = Object.fromEntries(req.headers.entries());
    const maskedHeaders = { ...headersObj };
    if (maskedHeaders.authorization) {
      maskedHeaders.authorization = maskedHeaders.authorization.substring(0, 15) + "...";
    }

    await addLog("Incoming request to Userinfo", {
      method: req.method,
      url: req.url,
      headers: maskedHeaders,
    });

    // Extract token from Authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      await addLog("Error: Missing Authorization header");
      return new Response(
        JSON.stringify({ error: "Missing Authorization header" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Supabase passes "Bearer <token>" in the Authorization header.
    // Yandex API strictly requires "OAuth <token>" instead of "Bearer".
    const token = authHeader.replace(/^bearer\s+/i, "");
    const yandexAuthHeader = `OAuth ${token}`;

    // Call Yandex API to retrieve user profile info
    await addLog("Fetching profile from Yandex login info API...", {
      yandexAuthHeaderMasked: yandexAuthHeader.substring(0, 15) + "...",
    });

    const yandexResponse = await fetch("https://login.yandex.ru/info?format=json", {
      headers: {
        Authorization: yandexAuthHeader,
        "User-Agent": "HotStuff-Ecommerce-App/1.0",
      },
    });

    if (!yandexResponse.ok) {
      const errorText = await yandexResponse.text();
      await addLog("Yandex API responded with error", {
        status: yandexResponse.status,
        details: errorText,
      });
      return new Response(
        JSON.stringify({ error: "Failed to fetch user info from Yandex", details: errorText }),
        {
          status: yandexResponse.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const yandexData = await yandexResponse.json();
    await addLog("Original Yandex profile data received", yandexData);

    // Normalize keys for GoTrue (Supabase Auth) compatibility
    const normalizedData = { ...yandexData };

    // GoTrue (Supabase Auth) requires a 'sub' field (subject claim / unique user ID) for custom OAuth providers.
    // Yandex returns the unique user ID in the 'id' field, so we map it to 'sub'.
    if (normalizedData.id) {
      normalizedData.sub = normalizedData.id;
    }

    // 1. Map email (GoTrue requires 'email')
    if (!normalizedData.email && normalizedData.default_email) {
      normalizedData.email = normalizedData.default_email;
    }
    
    // Fallback if email is still missing but emails array is present
    if (!normalizedData.email && normalizedData.emails && normalizedData.emails.length > 0) {
      normalizedData.email = normalizedData.emails[0];
    }

    // 2. Map name (real_name -> name)
    if (!normalizedData.name && normalizedData.real_name) {
      normalizedData.name = normalizedData.real_name;
    } else if (!normalizedData.name && normalizedData.display_name) {
      normalizedData.name = normalizedData.display_name;
    }

    // 3. Map avatar (default_avatar_id -> picture)
    if (normalizedData.default_avatar_id) {
      normalizedData.picture = `https://avatars.yandex.net/get-yapic/${normalizedData.default_avatar_id}/islands-200`;
    }

    await addLog("Normalized profile response data", normalizedData);

    return new Response(JSON.stringify(normalizedData), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    await addLog("Exception in yandex-proxy edge function", { error: error.message });
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

import "@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS, PUT, DELETE",
};

Deno.serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Extract token from Authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.warn("Authorization header is missing");
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
    console.log("Fetching profile from Yandex login info API...");
    const yandexResponse = await fetch("https://login.yandex.ru/info?format=json", {
      headers: {
        Authorization: yandexAuthHeader,
      },
    });

    if (!yandexResponse.ok) {
      const errorText = await yandexResponse.text();
      console.error("Yandex API responded with error:", errorText);
      return new Response(
        JSON.stringify({ error: "Failed to fetch user info from Yandex", details: errorText }),
        {
          status: yandexResponse.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const yandexData = await yandexResponse.json();
    console.log("Original Yandex profile data received:", JSON.stringify(yandexData));

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

    console.log("Normalized profile response data:", JSON.stringify(normalizedData));

    return new Response(JSON.stringify(normalizedData), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Exception in yandex-proxy edge function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

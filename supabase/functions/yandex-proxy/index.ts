import "@supabase/functions-js/edge-runtime.d.ts";

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
  };
}

// Global in-memory logs buffer
interface LogEntry {
  timestamp: string;
  message: string;
  detail?: unknown;
}
const logs: LogEntry[] = [];

function maskSensitiveData(data: unknown): unknown {
  if (typeof data === "string") {
    let masked = data;
    const sensitiveKeys = [
      'client_secret', 'access_token', 'refresh_token', 'id_token', 'token', 'code'
    ];
    for (const key of sensitiveKeys) {
      const regex = new RegExp(`(${key}=)([^&]+)`, 'gi');
      masked = masked.replace(regex, "$1******");
    }
    return masked;
  }
  if (Array.isArray(data)) {
    return data.map(item => maskSensitiveData(item));
  }
  if (typeof data === "object" && data !== null) {
    const cloned: Record<string, unknown> = { ...(data as Record<string, unknown>) };
    const exactKeysToMask = [
      'client_secret', 'clientSecret',
      'access_token', 'accessToken',
      'refresh_token', 'refreshToken',
      'id_token', 'idToken',
      'token', 'code'
    ];
    for (const key in cloned) {
      if (exactKeysToMask.includes(key) && cloned[key]) {
        cloned[key] = "******";
      } else if (key.toLowerCase() === "authorization" && typeof cloned[key] === "string") {
        const match = (cloned[key] as string).match(/^(Bearer|OAuth|Basic)\s+(.*)$/i);
        cloned[key] = match ? `${match[1]} ******` : "******";
      } else if (typeof cloned[key] === "object" && cloned[key] !== null) {
        cloned[key] = maskSensitiveData(cloned[key]);
      }
    }
    return cloned;
  }
  return data;
}

async function addLog(message: string, detail?: unknown) {
  const logEntry: LogEntry = {
    timestamp: new Date().toISOString(),
    message,
    detail: maskSensitiveData(detail),
  };
  console.log(`${message}:`, JSON.stringify(logEntry.detail || ""));
  logs.unshift(logEntry);
  if (logs.length > 50) {
    logs.pop();
  }

  // Also send to RequestCatcher for robust retrieval (unawaited to avoid blocking)
  fetch("https://hotstuff-yandex.requestcatcher.com/log", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(logEntry),
  }).catch(() => {
    // Fail silently for webhook logger
  });
}

Deno.serve(async (req) => {
  const reqOrigin = req.headers.get("Origin");
  const corsHeaders = getCorsHeaders(reqOrigin);

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
    const authHeader = req.headers.get("Authorization");
    const expectedKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!authHeader || authHeader.replace(/^Bearer\s+/i, "") !== expectedKey) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(logs), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Proxy Token exchange request to inspect errors
  if (url.pathname.endsWith("/token")) {
    try {
      const contentType = req.headers.get("content-type") || "";
      let bodyText = "";
      if (contentType.includes("form") || contentType.includes("json")) {
        bodyText = await req.text();
      }

      await addLog("Token Endpoint Called", {
        url: req.url,
        method: req.method,
        headers: Object.fromEntries(req.headers.entries()),
        body: bodyText,
      });

      // Forward request to Yandex Token URL
      const yandexResponse = await fetch("https://oauth.yandex.ru/token", {
        method: req.method,
        headers: {
          "Content-Type": contentType,
          "User-Agent": "HotStuff-Ecommerce-App/1.0",
        },
        body: bodyText,
      });

      const responseText = await yandexResponse.text();
      await addLog("Yandex Token Response", {
        status: yandexResponse.status,
        body: responseText,
      });

      // Forward response back to Supabase
      const responseHeaders = new Headers(corsHeaders);
      responseHeaders.set(
        "Content-Type",
        yandexResponse.headers.get("Content-Type") || "application/json",
      );

      return new Response(responseText, {
        status: yandexResponse.status,
        headers: responseHeaders,
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      await addLog("Exception in token proxy", { error: errorMessage });
      return new Response(JSON.stringify({ error: errorMessage }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  }

  // Userinfo Endpoint
  try {
    const headersObj = Object.fromEntries(req.headers.entries());

    await addLog("Incoming request to Userinfo", {
      method: req.method,
      url: req.url,
      headers: headersObj,
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
        },
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

    const yandexResponse = await fetch(
      "https://login.yandex.ru/info?format=json",
      {
        headers: {
          Authorization: yandexAuthHeader,
          "User-Agent": "HotStuff-Ecommerce-App/1.0",
        },
      },
    );

    if (!yandexResponse.ok) {
      const errorText = await yandexResponse.text();
      await addLog("Yandex API responded with error", {
        status: yandexResponse.status,
        details: errorText,
      });
      return new Response(
        JSON.stringify({
          error: "Failed to fetch user info from Yandex",
          details: errorText,
        }),
        {
          status: yandexResponse.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
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

    // 1. Map email and mark as verified to prevent Supabase "Unverified email" rejection
    if (normalizedData.default_email) {
      normalizedData.email = normalizedData.default_email;
    } else if (normalizedData.emails && normalizedData.emails.length > 0) {
      normalizedData.email = normalizedData.emails[0];
    } else {
      // Fallback for phone-only Yandex accounts or missing app email permissions
      const identifier = normalizedData.id || normalizedData.login || Math.random().toString(36).substring(2);
      normalizedData.email = `yandex_${identifier}@yandex.ru`;
    }

    if (normalizedData.email) {
      normalizedData.email_verified = true;
    }

    // 2. Extract Birthday (Yandex returns 'birthday', map to OIDC standard 'birthdate')
    if (normalizedData.birthday) {
      normalizedData.birthdate = normalizedData.birthday; 
    }

    // 3. Extract Phone (Yandex returns nested object `default_phone: { id, number }`)
    if (normalizedData.default_phone && normalizedData.default_phone.number) {
      normalizedData.phone_number = normalizedData.default_phone.number; 
    }

    // 4. Map Name
    if (normalizedData.real_name || normalizedData.display_name) {
      normalizedData.name = normalizedData.real_name || normalizedData.display_name;
      normalizedData.full_name = normalizedData.name;
    }

    // 5. Map Avatar Picture
    if (normalizedData.default_avatar_id) {
      normalizedData.picture = `https://avatars.yandex.net/get-yapic/${normalizedData.default_avatar_id}/islands-200`;
      normalizedData.avatar_url = normalizedData.picture;
    }

    await addLog("Normalized profile response data", normalizedData);

    return new Response(JSON.stringify(normalizedData), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    await addLog("Exception in yandex-proxy edge function", {
      error: errorMessage,
    });
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

import "@supabase/functions-js/edge-runtime.d.ts";

function getCorsHeaders(reqOrigin: string | null) {
  return {
    "Access-Control-Allow-Origin": reqOrigin || "*",
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };
}

Deno.serve(async (req) => {
  const reqOrigin = req.headers.get("Origin");
  const corsHeaders = getCorsHeaders(reqOrigin);

  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // 1. Read Halyk credentials from environment variables
    const clientId = Deno.env.get("HALYK_CLIENT_ID");
    const clientSecret = Deno.env.get("HALYK_CLIENT_SECRET");
    const terminalId = Deno.env.get("HALYK_TERMINAL_ID") || "80812701"; // Default Halyk test terminal
    const isProd = Deno.env.get("HALYK_IS_PROD") === "true";

    // 2. Parse request body
    const body = await req.json().catch(() => ({}));
    const { action = "create", amount, invoiceId } = body;

    if (!invoiceId) {
      return new Response(
        JSON.stringify({ error: "Missing required field: invoiceId is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // 3. Check if we should use Mock/Sandbox mode
    const isMockMode = !clientId || clientId === "placeholder" || clientId.startsWith("mock") || !clientSecret;

    // Handle status check action
    if (action === "status") {
      console.log(`Checking Halyk status for Invoice: ${invoiceId}`);
      if (isMockMode) {
        return new Response(
          JSON.stringify({
            success: true,
            status: "paid",
            statusName: "CHARGE",
            provider: "mock-halyk",
            invoiceId
          }),
          {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      // Get token first (needed for API requests)
      const tokenUrl = isProd
        ? "https://epay-oauth.homebank.kz/oauth2/token"
        : "https://test-epay-oauth.epayment.kz/oauth2/token";

      const formData = new URLSearchParams();
      formData.append("grant_type", "client_credentials");
      formData.append("client_id", clientId);
      formData.append("client_secret", clientSecret);
      formData.append("scope", "payment");
      formData.append("terminal", terminalId);

      const tokenResponse = await fetch(tokenUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData.toString(),
      });

      if (!tokenResponse.ok) {
        const errorText = await tokenResponse.text();
        return new Response(
          JSON.stringify({ error: `Failed to fetch token for status check: ${errorText}` }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      const tokenData = await tokenResponse.json();
      const accessToken = tokenData.access_token;

      // Query status
      const statusUrl = isProd
        ? `https://epay-api.homebank.kz/check-status/payment/transaction/${invoiceId}`
        : `https://test-epay-api.epayment.kz/check-status/payment/transaction/${invoiceId}`;

      console.log(`Requesting Halyk status from: ${statusUrl}`);

      const statusResponse = await fetch(statusUrl, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
        },
      });

      if (statusResponse.ok) {
        const statusData = await statusResponse.json();
        const tx = statusData.transaction || {};
        const isPaid = statusData.resultCode === "100" && (tx.statusName === "CHARGE" || tx.statusName === "AUTH" || tx.statusName === "VERIFIED");
        
        return new Response(
          JSON.stringify({
            success: true,
            status: isPaid ? "paid" : "pending",
            statusName: tx.statusName || "UNKNOWN",
            details: statusData,
            provider: "halyk"
          }),
          {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      } else {
        const errorText = await statusResponse.text();
        console.error("Halyk status API returned error:", errorText);
        return new Response(
          JSON.stringify({ error: `Halyk status API error: ${errorText}` }),
          {
            status: statusResponse.status,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
    }

    // Default action: Create Token for widget
    if (!amount) {
      return new Response(
        JSON.stringify({ error: "Missing required field: amount is required for creation" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log(`Processing Halyk checkout for Invoice: ${invoiceId}, Amount: ${amount}`);

    if (isMockMode) {
      console.log("[MOCK] Running in Halyk Sandbox Mode. Generating mock token.");
      
      return new Response(
        JSON.stringify({
          success: true,
          accessToken: `mock-token-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          terminal: terminalId,
          provider: "mock-halyk",
          amount,
          invoiceId
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // 4. Request real OAuth2 Token from Halyk ePay
    const tokenUrl = isProd
      ? "https://epay-oauth.homebank.kz/oauth2/token"
      : "https://test-epay-oauth.epayment.kz/oauth2/token";

    console.log(`Requesting Halyk ePay OAuth token from: ${tokenUrl}`);

    // Halyk token request parameters (x-www-form-urlencoded or multipart/form-data)
    const formData = new URLSearchParams();
    formData.append("grant_type", "client_credentials");
    formData.append("client_id", clientId);
    formData.append("client_secret", clientSecret);
    formData.append("scope", "payment");
    formData.append("terminal", terminalId);

    const apiResponse = await fetch(tokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
    });

    if (apiResponse.ok) {
      const apiData = await apiResponse.json();
      console.log("Successfully retrieved Halyk OAuth access token.");

      return new Response(
        JSON.stringify({
          success: true,
          accessToken: apiData.access_token,
          terminal: terminalId,
          provider: "halyk",
          amount,
          invoiceId
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    } else {
      const errorText = await apiResponse.text();
      console.error("Halyk ePay OAuth API returned error:", errorText);
      return new Response(
        JSON.stringify({ error: `Halyk OAuth API error: ${errorText}` }),
        {
          status: apiResponse.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Exception in halyk-checkout Edge Function:", error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

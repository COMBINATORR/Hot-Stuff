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
    const { amount, invoiceId } = body;

    if (!amount || !invoiceId) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: amount and invoiceId are required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log(`Processing Halyk checkout for Invoice: ${invoiceId}, Amount: ${amount}`);

    // 3. Check if we should use Mock/Sandbox mode
    const isMockMode = !clientId || clientId === "placeholder" || clientId.startsWith("mock") || !clientSecret;

    if (isMockMode) {
      console.log("[MOCK] Running in Halyk Sandbox Mode. Generating mock token.");
      
      // Return details for frontend test-widget initialization
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

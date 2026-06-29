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
    // 1. Get credentials from environment variables
    const apiKey = Deno.env.get("KASPI_API_KEY");
    const merchantId = Deno.env.get("KASPI_MERCHANT_ID");

    if (!merchantId) {
      throw new Error("Configuration error: KASPI_MERCHANT_ID is not configured");
    }

    // 2. Parse request body
    const body = await req.json().catch(() => ({}));
    const { action = "create", amount, orderId, phone, invoiceId } = body;

    // Handle status check action
    if (action === "status") {
      if (!invoiceId) {
        return new Response(
          JSON.stringify({ error: "Missing required field: invoiceId is required for status checks" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      console.log(`Checking status for invoice: ${invoiceId}`);

      if (!apiKey || apiKey === "placeholder" || apiKey.startsWith("mock")) {
        return new Response(
          JSON.stringify({ error: "Payment verification unavailable" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      try {
        // Query ApiPay invoice status
        const apiResponse = await fetch(`https://bpapi.bazarbay.site/api/v1/invoices/${invoiceId}`, {
          method: "GET",
          headers: {
            "X-API-Key": apiKey,
          },
        });

        if (apiResponse.ok) {
          const apiData = await apiResponse.json();
          return new Response(
            JSON.stringify({
              success: true,
              status: apiData.status || "pending",
              details: apiData,
            }),
            {
              status: 200,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        } else {
          const errorText = await apiResponse.text();
          console.error("External payment gateway status check error:", errorText);
          return new Response(
            JSON.stringify({ error: `Gateway error: ${errorText}` }),
            {
              status: apiResponse.status,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        console.error("Failed to connect to payment gateway for status check:", err);
        return new Response(
          JSON.stringify({ error: `Connection failed: ${errorMessage}` }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
    }

    // Default action: Create Invoice
    if (!amount || !orderId) {
      return new Response(
        JSON.stringify({
          error: "Missing required fields: amount and orderId are required",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    console.log(
      `Processing checkout for Order: ${orderId}, Amount: ${amount}, Phone: ${phone || "N/A"}`
    );

    let paymentUrl = "";
    let invoiceNumber = "";
    let provider = "kaspi-direct";

    // Clean and format phone number (keep only digits)
    const cleanedPhone = phone ? phone.replace(/\D/g, "") : "";

    // If API Key is set, try to use ApiPay push-invoice
    if (apiKey && apiKey !== "placeholder" && !apiKey.startsWith("mock")) {
      try {
        console.log(`Sending API request to ApiPay for phone: ${cleanedPhone || "N/A"}`);
        const apiResponse = await fetch("https://bpapi.bazarbay.site/api/v1/invoices", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-API-Key": apiKey,
          },
          body: JSON.stringify({
            amount: Number(amount),
            phone_number: cleanedPhone || undefined,
            description: `Оплата заказа #${orderId} на сайте Hot Stuff`,
            external_order_id: String(orderId),
          }),
        });

        if (apiResponse.ok) {
          const apiData = await apiResponse.json();
          paymentUrl = apiData.payment_url || apiData.url || "";
          invoiceNumber = apiData.invoice_id || apiData.id || "";
          provider = "apipay";
          console.log(`Successfully created ApiPay invoice: ${invoiceNumber}`);
        } else {
          const errorText = await apiResponse.text();
          console.error("External payment gateway invoice creation error:", errorText);
        }
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        console.error("Failed to connect to payment gateway during creation:", errorMessage);
      }
    }

    // If ApiPay invoice creation failed or was skipped, fallback to direct deep link
    if (!paymentUrl) {
      invoiceNumber = `mock-${orderId}`;
      paymentUrl = `https://pay.kaspi.kz/pay/${merchantId}?amount=${amount}`;
      provider = "kaspi-direct";
      console.log(`Using fallback direct link: ${paymentUrl}`);
    }

    const responseBody = {
      success: true,
      orderId,
      amount,
      invoiceNumber,
      paymentUrl,
      provider,
    };

    return new Response(JSON.stringify(responseBody), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Exception in kaspi-checkout function:", error);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

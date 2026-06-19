import "@supabase/functions-js/edge-runtime.d.ts";

const allowedOrigins = [
  "http://localhost:3000",
  "https://hotstuff.kz"
];

function getCorsHeaders(req: Request) {
  const origin = req.headers.get("origin");
  const envAllowedOrigin = Deno.env.get("ALLOWED_ORIGIN");

  let allowOrigin = "http://localhost:3000"; // Safe fallback

  if (origin) {
    if (envAllowedOrigin && origin === envAllowedOrigin) {
      allowOrigin = origin;
    } else if (allowedOrigins.includes(origin)) {
      allowOrigin = origin;
    }
  }

  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };
}

Deno.serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: getCorsHeaders(req) });
  }

  try {
    // 1. Get the API Key from environment variables
    const apiKey = Deno.env.get("KASPI_API_KEY");
    if (!apiKey) {
      console.warn("KASPI_API_KEY environment variable is not set");
    }

    // 2. Parse request body
    const body = await req.json().catch(() => ({}));
    const { amount, orderId, phone } = body;

    if (!amount || !orderId) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: amount and orderId are required" }),
        {
          status: 400,
          headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
        }
      );
    }

    console.log(`Processing checkout for Order: ${orderId}, Amount: ${amount}, Phone: ${phone || "N/A"}`);

    // 3. Integrate with Kaspi API
    // In a real production setup, you would call Kaspi's Merchant API or a 3rd party gateway like ApiPay
    let paymentUrl = "";
    let invoiceNumber = "";
    
    if (apiKey && apiKey !== "placeholder" && !apiKey.startsWith("mock")) {
      try {
        // Real API Call template (e.g. to ApiPay or similar integration partner)
        const apiResponse = await fetch("https://api.apipay.kz/v1/invoices", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            amount: Number(amount),
            order_id: String(orderId),
            customer_phone: phone ? String(phone) : undefined,
          }),
        });

        if (apiResponse.ok) {
          const apiData = await apiResponse.json();
          paymentUrl = apiData.payment_url || apiData.url || "";
          invoiceNumber = apiData.invoice_id || apiData.id || "";
        } else {
          const errorText = await apiResponse.text();
          console.error("External payment gateway error:", errorText);
        }
      } catch (err) {
        console.error("Failed to connect to payment gateway:", err.message);
      }
    }

    // Generate mock link if we don't have a real one from the API
    if (!paymentUrl) {
      // Simulate invoice creation
      invoiceNumber = `INV-${orderId}-${Math.floor(1000 + Math.random() * 9000)}`;
      
      // Kaspi Pay custom deep link mock format
      // In production, this would open the Kaspi app directly
      paymentUrl = 'https://pay.kaspi.kz/pay/oqg3hrij';
    }

    const responseBody = {
      success: true,
      orderId,
      amount,
      invoiceNumber,
      paymentUrl,
    };

    return new Response(JSON.stringify(responseBody), {
      status: 200,
      headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Exception in kaspi-checkout function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
      }
    );
  }
});

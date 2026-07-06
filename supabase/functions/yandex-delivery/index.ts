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

// Haversine formula to compute distance in km
function getDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Simple deterministic hash to get same coordinates for same address string
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return hash;
}

// Generate coordinates within ~5-10km of Atyrau center based on address string
function getMockCoordinates(address: string): { lat: number; lon: number } {
  const hash = hashString(address || "center");
  // Deterministic offset between -0.05 and +0.05 degrees (~5.5km)
  const latOffset = ((Math.abs(hash) % 100) / 1000) - 0.05;
  const lonOffset = (((Math.abs(hash) >> 7) % 100) / 1000) - 0.05;
  return {
    lat: 47.0945 + latOffset,
    lon: 51.9168 + lonOffset
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
    const apiKey = Deno.env.get("YANDEX_DELIVERY_API_KEY");
    const body = await req.json().catch(() => ({}));
    const { address, city = "Атырау", items = [] } = body;

    if (!address) {
      return new Response(
        JSON.stringify({ error: "Missing required field: address is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const fullAddress = `${city}, ${address}`;
    console.log(`Calculating delivery cost for address: ${fullAddress}`);

    // If API Key is missing, placeholder, or starts with mock, use deterministic mock logic
    if (!apiKey || apiKey === "placeholder" || apiKey.startsWith("mock")) {
      const shopLat = 47.102831;
      const shopLon = 51.924708;
      const destCoords = getMockCoordinates(address);
      const distance = getDistance(shopLat, shopLon, destCoords.lat, destCoords.lon);
      
      // Calculate realistic cost: base fee 500 ₸ + 150 ₸ per km, rounded to nearest 50 ₸
      const calculatedPrice = Math.round((500 + distance * 150) / 50) * 50;
      // Clamp price between 500 ₸ and 2500 ₸
      const finalPrice = Math.max(500, Math.min(2500, calculatedPrice));
      const etaMinutes = 20 + Math.round(distance * 3);

      console.log(`[MOCK] Computed distance: ${distance.toFixed(2)} km. Calculated cost: ${finalPrice} ₸. ETA: ${etaMinutes} mins.`);

      return new Response(
        JSON.stringify({
          success: true,
          price: finalPrice,
          distance_km: parseFloat(distance.toFixed(2)),
          eta_minutes: etaMinutes,
          provider: "mock-yandex"
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Call real Yandex Logistics estimate API
    const response = await fetch("https://b2b.logistics.yandex.ru/b2b/api/v1/claims/estimate", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        route_points: [
          {
            id: 1,
            type: "source",
            address: {
              fullname: "Атырау, проспект Азаттык, 26а", // Store location
              coordinates: [51.924708, 47.102831]
            }
          },
          {
            id: 2,
            type: "destination",
            address: {
              fullname: fullAddress
            }
          }
        ],
        // Simple default box properties or derived from request items
        items: items.length > 0 ? items.map((i: any, idx: number) => ({
          id: idx + 1,
          title: i.name || "Товар",
          quantity: i.quantity || 1,
          size: { length: 0.15, width: 0.15, height: 0.1 },
          weight: 0.5
        })) : [
          {
            id: 1,
            title: "Заказ Hot Stuff",
            quantity: 1,
            size: { length: 0.2, width: 0.2, height: 0.1 },
            weight: 0.5
          }
        ]
      })
    });

    if (response.ok) {
      const data = await response.json();
      // Extract price from Yandex API response estimation (typically under offers or price)
      const price = data.offers?.[0]?.price || data.price || 1500;
      const etaMinutes = data.offers?.[0]?.eta || 30;

      return new Response(
        JSON.stringify({
          success: true,
          price: Math.round(parseFloat(price)),
          eta_minutes: etaMinutes,
          provider: "yandex",
          details: data
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    } else {
      const errorText = await response.text();
      console.error("Yandex Delivery API returned error:", errorText);
      return new Response(
        JSON.stringify({ error: `Yandex API error: ${errorText}` }),
        {
          status: response.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
  } catch (err: any) {
    console.error("Exception in yandex-delivery edge function:", err);
    return new Response(
      JSON.stringify({ error: err.message || "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

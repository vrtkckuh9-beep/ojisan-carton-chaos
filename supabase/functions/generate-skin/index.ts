// Generate Angry Ojisan skin (normal or angry variant) from an uploaded face photo.
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const STYLE = `Retro Japanese mobile arcade sticker portrait. Thick bold black comic outlines, high contrast, flat shaded sticker rendering, clean solid white background, centered face, square framing, polished game-icon look, mobile readable.`;

const PROMPTS: Record<string, string> = {
  normal: `Transform this face into an Angry Ojisan game character "normal" skin. Keep the SAME person clearly recognizable. Friendly calm slightly-smiling neutral expression, eyes open. ${STYLE}`,
  angry: `Transform this face into an Angry Ojisan game character "ANGRY" reveal skin. Keep the SAME person clearly recognizable. Furiously angry: deeply furrowed brows, clenched teeth shouting mouth, red flushed face, anime-style anger stress mark and rage wrinkles, exaggerated comic aggression. ${STYLE}`,
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { imageUrl, variant } = await req.json();
    if (!imageUrl || !PROMPTS[variant]) {
      return new Response(JSON.stringify({ error: "imageUrl and variant ('normal'|'angry') required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image",
        modalities: ["image", "text"],
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: PROMPTS[variant] },
              { type: "image_url", image_url: { url: imageUrl } },
            ],
          },
        ],
      }),
    });

    if (!resp.ok) {
      const t = await resp.text();
      const status = resp.status === 429 || resp.status === 402 ? resp.status : 500;
      const msg =
        resp.status === 429
          ? "Rate limited, please try again shortly."
          : resp.status === 402
          ? "AI credits exhausted. Add funds in Lovable workspace."
          : `AI gateway error: ${t}`;
      return new Response(JSON.stringify({ error: msg }), {
        status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await resp.json();
    const url = data?.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    if (!url) {
      return new Response(JSON.stringify({ error: "No image returned" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ dataUrl: url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-skin error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

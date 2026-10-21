
export default {
  async fetch(request, env) {
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    const json = (data, status = 200) =>
      new Response(JSON.stringify(data), {
        status,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json; charset=utf-8",
        },
      });

    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders,
      });
    }

    if (request.method !== "POST") {
      return json({
        message: "Fahhemni AI Worker is running"
      });
    }

    try {
      if (!env.GEMINI_API_KEY) {
        return json({
          error: "GEMINI_API_KEY secret is missing"
        }, 500);
      }

      const body = await request.json();
      const message = body?.message;

      if (typeof message !== "string" || !message.trim()) {
        return json({
          error: "Please send a non-empty message"
        }, 400);
      }

      if (message.length > 30000) {
        return json({
          error: "Message is too long"
        }, 400);
      }

      const response = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": env.GEMINI_API_KEY,
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: message
              }]
            }]
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return json({
          error: data?.error?.message ||
            "Gemini API request failed"
        }, response.status === 429 ? 429 : 502);
      }

      const reply = data?.candidates?.[0]?.content?.parts
        ?.map(part => part.text || "")
        .join("")
        .trim();

      if (!reply) {
        return json({
          error: "Gemini returned an empty response"
        }, 502);
      }

      return json({ reply });

    } catch (error) {
      return json({
        error: "Worker error: " + error.message
      }, 500);
    }
  }
};

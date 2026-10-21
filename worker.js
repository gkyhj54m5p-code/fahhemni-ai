/**
 * Cloudflare Worker: Fahhemni AI
 * Model: gemini-3.8-flash (via Google Interactions API)
 * File: worker.js
 */

const MODEL = "gemini-3.8-flash";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Content-Type": "application/json; charset=utf-8",
};

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: corsHeaders,
  });
}

function extractText(data) {
  // 1. فحص الحقل المباشر output_text
  if (typeof data?.output_text === "string" && data.output_text.trim()) {
    return data.output_text.trim();
  }

  const results = [];

  function scan(items) {
    if (!Array.isArray(items)) return;

    for (const item of items) {
      if (!item || typeof item !== "object") continue;

      // استخراج النص سواء كان نوعه text أو output_text أو بدون type محدد
      const isTextType = !item.type || ["text", "output_text"].includes(item.type);
      if (typeof item.text === "string" && item.text.trim() && isTextType) {
        results.push(item.text.trim());
      }

      if (Array.isArray(item.content)) {
        scan(item.content);
      }

      if (Array.isArray(item.output)) {
        scan(item.output);
      }
    }
  }

  scan(data?.outputs);
  scan(data?.output);

  return results.join("\n").trim();
}

export default {
  async fetch(request, env) {
    // التعامل مع CORS Preflight
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders,
      });
    }

    // فحص صحة عمل الـ Worker (Health Check)
    if (request.method === "GET") {
      return jsonResponse({
        message: "Fahhemni AI is running",
        status: "ok",
      });
    }

    if (request.method !== "POST") {
      return jsonResponse(
        {
          error: "Method not allowed. Use POST.",
        },
        405
      );
    }

    // التحقق من وجود مفتاح الـ API
    if (!env.GEMINI_API_KEY) {
      return jsonResponse(
        {
          error: "GEMINI_API_KEY secret is missing in Cloudflare.",
        },
        500
      );
    }

    let body;

    try {
      body = await request.json();
    } catch {
      return jsonResponse(
        {
          error: "Invalid JSON request.",
        },
        400
      );
    }

    const message =
      typeof body?.message === "string" ? body.message.trim() : "";

    if (!message) {
      return jsonResponse(
        {
          error: "Message is required.",
        },
        400
      );
    }

    const apiUrl =
      "https://generativelanguage.googleapis.com/v1beta/interactions";

    let lastError = "Gemini request failed.";

    // إعادة المحاولة تلقائياً مرتين في حال كان الضغط مرتفعاً على Gemini
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const response = await fetch(apiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": env.GEMINI_API_KEY,
          },
          body: JSON.stringify({
            model: MODEL,
            input: message,
          }),
        });

        const raw = await response.text();

        let data;

        try {
          data = JSON.parse(raw);
        } catch {
          data = { raw_response: raw.slice(0, 1000) };
        }

        if (!response.ok) {
          lastError =
            data?.error?.message ||
            data?.message ||
            `Gemini API returned HTTP ${response.status}.`;

          const temporary =
            response.status === 429 ||
            response.status === 500 ||
            response.status === 502 ||
            response.status === 503 ||
            response.status === 504;

          if (temporary && attempt === 0) {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            continue;
          }

          return jsonResponse(
            {
              error: lastError,
              status: response.status,
            },
            502
          );
        }

        const reply = extractText(data);

        if (reply) {
          return jsonResponse({ reply });
        }

        lastError =
          "Gemini returned no text. Response: " +
          JSON.stringify(data).slice(0, 1200);

        if (attempt === 0) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
          continue;
        }

        return jsonResponse(
          {
            error: lastError,
          },
          502
        );
      } catch (error) {
        lastError = error?.message || "Network request failed.";

        if (attempt === 0) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
          continue;
        }
      }
    }

    return jsonResponse(
      {
        error: lastError,
      },
      502
    );
  },
};

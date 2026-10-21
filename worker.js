/**
 * Cloudflare Worker: Fahhemni AI API
 * Model: gemini-3.8-flash (Google Interactions API)
 */

export default {
  async fetch(request, env) {
    // إعداد ترويسات الـ CORS للسماح بالاتصال من أي موقع
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    // دالة مساعدة لإرجاع رد JSON منسق
    const json = (data, status = 200) =>
      new Response(JSON.stringify(data), {
        status,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json; charset=utf-8",
        },
      });

    // الرد على طلبات الـ CORS Preflight
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    // السماح فقط بطلبات POST
    if (request.method !== "POST") {
      return json({ message: "Fahhemni AI API is running." });
    }

    try {
      // التأكد من وجود مفتاح الـ API في المتغيرات
      if (!env.GEMINI_API_KEY) {
        return json({ error: "GEMINI_API_KEY is missing from environment secrets." }, 500);
      }

      // قراءة الـ JSON مع تفادي توقف السيرفر عند إرسال نص تالف
      let body;
      try {
        body = await request.json();
      } catch {
        return json({ error: "Invalid JSON body." }, 400);
      }

      const message = body?.message;
      if (typeof message !== "string" || !message.trim()) {
        return json({ error: "Please send a valid 'message'." }, 400);
      }

      // استدعاء Gemini Interactions API بنموذج gemini-3.8-flash
      const response = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/interactions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": env.GEMINI_API_KEY,
          },
          body: JSON.stringify({
            model: "gemini-3.8-flash",
            input: message,
            generation_config: {
              thinking_level: "low", // لتقليل استهلاك التوكنز وتسريع الاستجابة
            },
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return json(
          { error: data?.error?.message || "Gemini API request failed." },
          502
        );
      }

      // استخراج النص من output_text أو من مصفوفة الخطوات إن وُجدت
      const reply =
        data?.output_text ||
        data?.interaction?.output_text ||
        data?.steps
          ?.flatMap((s) => s?.content?.parts || [])
          ?.find((p) => p.text)?.text;

      if (!reply) {
        return json({ error: "Gemini returned an empty response." }, 502);
      }

      return json({ reply });
    } catch (error) {
      return json({ error: error.message || "Internal Worker error." }, 500);
    }
  },
};

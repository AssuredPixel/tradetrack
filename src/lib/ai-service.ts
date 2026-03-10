export async function generateBusinessInsight(userPrompt: string, businessData: any) {
    try {
        const apiKey = process.env.OPENROUTER_API_KEY;
        const model = "google/gemini-2.0-flash-001"; // or "google/gemini-flash-1.5"

        const systemPrompt = `
You are an expert Business AI Assistant for "TradeTrack". 
Your goal is to provide accurate, data-driven insights to the business Owner.

CRITICAL RULES:
1. ONLY use the provided real-time business data.
2. NEVER invent numbers or statistics. If you don't have enough data to answer, state it clearly.
3. Keep your answers concise, professional, and actionable.
4. Format your responses using clean Markdown (bolding, lists, etc. where appropriate).
5. All monetary values are in Nigerian Naira (₦).

BUSINESS DATA FOR CONTEXT:
${JSON.stringify(businessData, null, 2)}
`;

        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json",
                "HTTP-Referer": "http://localhost:3000", // Optional, for OpenRouter rankings
                "X-Title": "TradeTrack", // Optional, for OpenRouter rankings
            },
            body: JSON.stringify({
                "model": model,
                "messages": [
                    { "role": "system", "content": systemPrompt },
                    { "role": "user", "content": userPrompt }
                ],
            })
        });

        const data = await response.json();

        if (data.error) {
            console.error("OpenRouter Error:", data.error);
            throw new Error(data.error.message || "Failed to generate business insight.");
        }

        return data.choices[0].message.content;
    } catch (error: any) {
        console.error("AI Error:", error);
        throw new Error(error.message || "Failed to generate business insight.");
    }
}

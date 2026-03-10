import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function generateBusinessInsight(userPrompt: string, businessData: any) {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

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

        const result = await model.generateContent([systemPrompt, userPrompt]);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("Gemini AI Error:", error);
        throw new Error("Failed to generate business insight.");
    }
}

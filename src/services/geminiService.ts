import { GoogleGenAI, Type } from "@google/genai";
import { MCQ, Category } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function generateMCQs(category: Category, count: number): Promise<MCQ[]> {
  try {
    const categoryPrompt = category === "Random" 
      ? "a mix of all BCS topics (Bangladesh Affairs, ICT, English, Math, Science, etc.)" 
      : `the category: ${category}`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate ${count} completely unique and random multiple choice questions for BCS (Bangladesh Civil Service) exam preparation in Bangla language (বাংলা ভাষা). 
      The questions should be from ${categoryPrompt}. 
      Ensure a diverse selection of topics within the category, including BCS suggestions, previous years' BCS exam questions, and relevant current affairs. 
      Each question must have exactly 4 options and include the correct answer. 
      Keep difficulty medium to advanced. 
      All text (question, options, correct_answer) MUST be in Bangla.`,
      config: {
        responseMimeType: "application/json",
        seed: Math.floor(Math.random() * 1000000),
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              question: { type: Type.STRING, description: "The text of the question" },
              options: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING },
                description: "Array of 4 possible answers"
              },
              correct_answer: { type: Type.STRING, description: "The text of the correct answer (must match one of the options exactly)" }
            },
            required: ["question", "options", "correct_answer"]
          }
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");
    
    // Clean JSON string in case AI adds markdown backticks
    const cleanJson = text.replace(/```json/g, "").replace(/```/g, "").trim();
    const mcqs: MCQ[] = JSON.parse(cleanJson);
    return mcqs;
  } catch (error) {
    console.error("Error generating MCQs:", error);
    throw error;
  }
}

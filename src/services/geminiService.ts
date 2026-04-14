import { GoogleGenAI, Type } from "@google/genai";
import { MCQ, Category } from "../types";

const API_KEY = process.env.GEMINI_API_KEY || "AIzaSyDv48H8C-7pJL1xzm9PlBbixy7vMGDgyMA";
const ai = new GoogleGenAI({ apiKey: API_KEY });

export async function generateMCQs(category: Category, count: number): Promise<MCQ[]> {
  if (!API_KEY) {
    throw new Error("Gemini API Key is missing. Please check your environment variables.");
  }

  try {
    const categoryPrompt = category === "Random" 
      ? "a mix of all BCS topics (Bangladesh Affairs, ICT, English, Math, Science, etc.)" 
      : `the category: ${category}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: `Generate ${count} unique multiple choice questions for BCS (Bangladesh Civil Service) exam preparation in Bangla. 
      Topic: ${categoryPrompt}. 
      Include BCS suggestions and previous years' questions. 
      Each question must have exactly 4 options and a correct answer. 
      All text MUST be in Bangla.`,
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
    let mcqs: MCQ[] = JSON.parse(cleanJson);

    // Validation: Ensure it's an array and has valid questions
    if (!Array.isArray(mcqs)) {
      throw new Error("AI returned invalid data format (not an array)");
    }

    // Filter out any malformed questions
    mcqs = mcqs.filter(q => 
      q.question && 
      Array.isArray(q.options) && 
      q.options.length >= 2 && 
      q.correct_answer
    );

    if (mcqs.length === 0) {
      throw new Error("AI failed to generate any valid questions. Please try again.");
    }

    return mcqs;
  } catch (error) {
    console.error("Error generating MCQs:", error);
    throw error;
  }
}

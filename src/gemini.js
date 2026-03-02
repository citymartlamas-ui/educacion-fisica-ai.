import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

console.log("Gemini API Key loaded:", apiKey ? "Yes (" + apiKey.substring(0, 10) + "...)" : "NO - MISSING!");

let genAI = null;
let model = null;

try {
    if (apiKey) {
        genAI = new GoogleGenerativeAI(apiKey);
        model = genAI.getGenerativeModel({
            model: "gemini-2.0-flash",
        });
    }
} catch (err) {
    console.error("Gemini Initialization Failed:", err);
}

export { model };

export const generateLessonPlan = async (prompt) => {
    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("GEMINI ERROR DETAILS:", error.message);
        console.error("FULL ERROR:", JSON.stringify(error, null, 2));
        return "Error: " + error.message;
    }
};

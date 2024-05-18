import { GenerativeModel, GoogleGenerativeAI } from "@google/generative-ai";

export class AiService {
    private static geminiFlash: GenerativeModel;
    public static getGeminiFlash(apiKey: string) {
        if (!this.geminiFlash) {
            const genAI = new GoogleGenerativeAI(apiKey);
            this.geminiFlash = genAI.getGenerativeModel({
                model: 'gemini-1.5-pro-latest'
            });
        }
        return this.geminiFlash;
    }
}
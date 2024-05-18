import { GenerativeModel, GoogleGenerativeAI } from "@google/generative-ai";

export class AiService {
    /**
     * A static instance of the Gemini Pro model.
     * @private
     */
    private static geminiFlash: GenerativeModel;

    /**
     * Retrieves an instance of the Gemini Pro model.
     * 
     * This method utilizes the GoogleGenerativeAI class to initialize and retrieve 
     * the Gemini Pro model. It ensures that only one instance of the model is created,
     * improving efficiency.
     *
     * @param apiKey The API key for accessing Google's Generative AI services.
     * @returns An instance of the Gemini Pro model.
     */
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

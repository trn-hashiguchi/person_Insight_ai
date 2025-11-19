import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult } from "../types";

export const analyzeImage = async (base64Image: string, mimeType: string, apiKey: string): Promise<AnalysisResult> => {
  try {
    // Use provided key, or fallback to process.env.API_KEY if available (handled by build tool or env)
    // When deployed on GH Pages without manual input, this might fail if not handled in UI
    const key = apiKey;
    
    if (!key) {
      throw new Error("API Key is missing. Please provide a valid Gemini API Key.");
    }

    const ai = new GoogleGenAI({ apiKey: key });

    // Remove the data URL prefix if present (e.g., "data:image/jpeg;base64,")
    const cleanBase64 = base64Image.replace(/^data:image\/\w+;base64,/, "");

    const model = "gemini-2.5-flash";

    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [
          {
            inlineData: {
              data: cleanBase64,
              mimeType: mimeType,
            },
          },
          {
            text: `この画像に写っているすべての人物を検出し、分析してください。
            各人物について、バウンディングボックス(0-1000の正規化座標)、短いラベル、詳細な説明（表情、行動など）、推定年齢、性別、服装の特徴を特定してください。
            
            【重要】もしその人物が有名人（芸能人、政治家、アスリート、歴史上の人物など）であると識別できる場合は、
            isCelebrityフィールドをtrueにし、celebrityNameフィールドにその名前（日本語）を入力してください。
            有名人でない場合はisCelebrityをfalseにしてください。

            画像内の人物の位置を正確に特定するために box2d フィールドを使用してください。
            
            結果はJSON形式で返してください。`,
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            people: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.INTEGER },
                  label: { type: Type.STRING, description: "短い識別ラベル（例：'青い帽子の少年'）" },
                  description: { type: Type.STRING, description: "行動、表情、全体的な雰囲気の詳細な説明" },
                  estimatedAge: { type: Type.STRING, description: "推定年齢層" },
                  gender: { type: Type.STRING, description: "推定性別" },
                  fashion: { type: Type.STRING, description: "服装の詳細な説明" },
                  isCelebrity: { type: Type.BOOLEAN, description: "その人物が有名人かどうか" },
                  celebrityName: { type: Type.STRING, description: "有名人の場合の名前。そうでない場合は空文字またはnull" },
                  box2d: {
                    type: Type.OBJECT,
                    description: "人物を囲むバウンディングボックス。座標は0から1000の範囲。",
                    properties: {
                      ymin: { type: Type.NUMBER },
                      xmin: { type: Type.NUMBER },
                      ymax: { type: Type.NUMBER },
                      xmax: { type: Type.NUMBER },
                    },
                    required: ["ymin", "xmin", "ymax", "xmax"],
                  },
                },
                required: ["id", "label", "description", "estimatedAge", "gender", "fashion", "box2d", "isCelebrity"],
              },
            },
          },
          required: ["people"],
        },
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response text from Gemini");
    }

    return JSON.parse(text) as AnalysisResult;
  } catch (error) {
    console.error("Error analyzing image:", error);
    throw error;
  }
};
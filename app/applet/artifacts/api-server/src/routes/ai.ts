import { Router, type Request, type Response } from "express";
import { GoogleGenAI } from "@google/genai";

const router = Router();
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

router.post("/ask", async (req: Request, res: Response) => {
  try {
    const { codeSnippet, chatHistory, userPrompt } = req.body;

    if (!userPrompt) {
      return res.status(400).json({ error: "Missing user prompt" });
    }

    const contextMessages = Array.isArray(chatHistory) 
      ? chatHistory.map((m: any) => `${m.userName}: ${m.text}`).join('\n')
      : '';

    const prompt = `
You are an expert AI programming tutor assisting students in a collaborative study room.

Current Code Snippet in Editor:
\`\`\`
${codeSnippet || '// No code provided'}
\`\`\`

Recent Chat History:
${contextMessages || 'No recent messages'}

Student's Question/Request:
${userPrompt}

Please provide a helpful, encouraging, and clear explanation. If suggesting code, use markdown. Keep your response concise as it will be posted in a chat interface.
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
    });

    res.json({ text: response.text });
  } catch (error) {
    req.log.error(error);
    res.status(500).json({ error: "Failed to generate AI response" });
  }
});

router.post("/analyze-complexity", async (req: Request, res: Response) => {
  try {
    const { codeSnippet, algorithmName } = req.body;
    if (!codeSnippet) {
      return res.status(400).json({ error: "Missing code snippet" });
    }

    const prompt = `You are a Big O complexity analyzer. Analyze the following student-written code snippet for an algorithm (potentially \${algorithmName || 'an unknown algorithm'}).

Provide your analysis in the following strict JSON format without markdown code blocks (just the raw JSON):
{
  "timeComplexity": "O(N)",
  "spaceComplexity": "O(1)",
  "explanation": "A concise explanation of why (2-3 sentences max)."
}

Code snippet to analyze:
\`\`\`
\${codeSnippet}
\`\`\``;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
    });

    let rawText = response.text || "";
    rawText = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
    
    try {
      const parsed = JSON.parse(rawText);
      res.json(parsed);
    } catch (parseError) {
      res.json({
        timeComplexity: "Unknown",
        spaceComplexity: "Unknown",
        explanation: "Failed to parse complexity analysis. AI response: " + rawText
      });
    }
  } catch (error) {
    req.log.error(error);
    res.status(500).json({ error: "Failed to generate complexity analysis" });
  }
});

export default router;

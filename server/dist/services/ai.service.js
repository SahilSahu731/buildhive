import { GoogleGenerativeAI } from "@google/generative-ai";
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
export const reviewCode = async (code, language) => {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const prompt = `You are an expert code reviewer specializing in ${language}. 

Analyze this code and provide a comprehensive review:

\`\`\`${language}
${code}
\`\`\`

Provide your review in the following JSON format (output ONLY valid JSON, no markdown):
{
  "score": <number 0-100 based on code quality>,
  "issues": [
    {
      "severity": "critical|warning|info",
      "title": "Brief issue title",
      "description": "Detailed explanation",
      "line": <line number if applicable>,
      "suggestion": "How to fix it"
    }
  ],
  "suggestions": [
    {
      "title": "Improvement suggestion",
      "description": "Why this would help",
      "code": "Example improved code (optional)"
    }
  ],
  "resources": [
    {
      "title": "Resource name",
      "url": "https://..."
    }
  ]
}

Focus on:
- Bugs and potential errors
- Security vulnerabilities
- Performance issues
- Code readability and maintainability
- Best practices for ${language}
- Modern alternatives and patterns

Provide 2-5 issues, 2-4 suggestions, and 1-2 learning resources.`;
    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        // Clean up potential markdown formatting like \`\`\`json ... \`\`\`
        const jsonString = text.replace(/```json/g, '').replace(/```/g, '').trim();
        // Parse the JSON response
        const parsedResult = JSON.parse(jsonString);
        return parsedResult;
    }
    catch (error) {
        console.error('Gemini API error:', error);
        throw new Error('Failed to review code with AI');
    }
};

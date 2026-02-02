import dotenv from "dotenv";
dotenv.config();
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    console.error("No API Key found");
    process.exit(1);
}
console.log("Using API Key:", apiKey.substring(0, 5) + "...");
async function listModels() {
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        const data = await response.json();
        if (data.error) {
            console.error("API Error:", data.error);
            return;
        }
        console.log("Available Models:");
        data.models?.forEach((m) => {
            if (m.supportedGenerationMethods?.includes("generateContent")) {
                console.log(`- ${m.name} (${m.displayName})`);
            }
        });
    }
    catch (error) {
        console.error("Fetch error:", error);
    }
}
listModels();

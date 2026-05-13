import { generateText } from "ai";
import { createMistral } from "@ai-sdk/mistral";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { provider, model, prompt, systemPrompt, temperature } = await request.json();

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    // Map provider to model string for AI Gateway
    const modelMap: Record<string, string> = {
      openai: `openai/${model || "gpt-4o"}`,
      google: `google/${model || "gemini-2.0-flash"}`,
      xai: `xai/${model || "grok-3"}`,
    };

    if (provider === "mistral") {
      const keys = [process.env.MISTRAL_API_KEY, process.env.MISTRAL_API_KEY_BACKUP].filter(Boolean) as string[];
      if (keys.length === 0) {
        return NextResponse.json({ error: "Mistral API key is not configured" }, { status: 500 });
      }

      let lastError: unknown = null;
      for (const apiKey of keys) {
        try {
          const mistral = createMistral({ apiKey });
          const { text } = await generateText({
            model: mistral(model || "mistral-small"),
            prompt,
            system: systemPrompt || undefined,
            temperature: temperature ?? 0.7,
          });
          return NextResponse.json({ text });
        } catch (error) {
          lastError = error;
        }
      }

      throw lastError ?? new Error("Mistral request failed");
    }

    const { text } = await generateText({
      model: modelMap[provider] || "openai/gpt-4o",
      prompt,
      system: systemPrompt || undefined,
      temperature: temperature ?? 0.7,
    });

    return NextResponse.json({ text });
  } catch (error) {
    console.error("AI generation error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Generation failed" },
      { status: 500 }
    );
  }
}

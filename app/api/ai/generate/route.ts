import { generateText } from "ai";
import { createMistral } from "@ai-sdk/mistral";
import { NextResponse } from "next/server";
import { LE_STUDIO_LAUNCH_ARCHITECT_SYSTEM_PROMPT } from "@/lib/launch-studio/launch-architect-prompt";

export async function POST(request: Request) {
  try {
    const { provider, model, prompt, systemPrompt, temperature, purpose } = await request.json();
    const resolvedSystemPrompt =
      purpose === "launch-architect" ? LE_STUDIO_LAUNCH_ARCHITECT_SYSTEM_PROMPT : systemPrompt || undefined;

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
        if (purpose === "launch-architect") {
          return NextResponse.json({ text: "", unavailable: true, error: "Mistral API key is not configured" });
        }
        return NextResponse.json({ error: "Mistral API key is not configured" }, { status: 500 });
      }

      let lastError: unknown = null;
      for (const apiKey of keys) {
        try {
          const mistral = createMistral({ apiKey });
          const { text } = await generateText({
            model: mistral(model || "mistral-small"),
            prompt,
            system: resolvedSystemPrompt,
            temperature: temperature ?? 0.7,
          });
          return NextResponse.json({ text });
        } catch (error) {
          lastError = error;
        }
      }

      if (purpose === "launch-architect") {
        return NextResponse.json({
          text: "",
          unavailable: true,
          error: lastError instanceof Error ? lastError.message : "Mistral request failed",
        });
      }

      throw lastError ?? new Error("Mistral request failed");
    }

    const { text } = await generateText({
      model: modelMap[provider] || "openai/gpt-4o",
      prompt,
      system: resolvedSystemPrompt,
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

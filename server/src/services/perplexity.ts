import type { Citation } from "../types/index.js";
import { logPerplexityResponse } from "./logger.js";
import { SYSTEM_PROMPT, DOMAIN_FILTERS } from "./config.js";

interface PerplexityStreamChunk {
  choices: {
    index: number;
    delta: {
      role?: string;
      content?: string;
    };
    finish_reason: string | null;
  }[];
  citations?: string[];
}

interface PerplexityNonStreamResponse {
  choices: {
    message: {
      content: string;
    };
  }[];
  citations?: string[];
}

export interface StreamCallbacks {
  onToken: (token: string) => void;
  onDone: (fullContent: string, citations: Citation[]) => void;
  onError: (error: Error) => void;
}

function extractTitleFromUrl(url: string): string {
  try {
    const parsed = new URL(url);
    const pathParts = parsed.pathname.split("/").filter(Boolean);
    if (pathParts.length > 0) {
      const last = decodeURIComponent(pathParts[pathParts.length - 1]);
      return last.replace(/[-_]/g, " ");
    }
    return parsed.hostname;
  } catch {
    return url;
  }
}

function buildCitations(urls: string[]): Citation[] {
  return urls.map((url, i) => ({
    index: i + 1,
    url,
    title: extractTitleFromUrl(url),
    snippet: "",
  }));
}

export async function streamPerplexityResponse(
  userContent: string,
  callbacks: StreamCallbacks
): Promise<void> {
  const apiKey = process.env.PERPLEXITY_API_KEY;
  if (!apiKey) {
    throw new Error("PERPLEXITY_API_KEY is not configured");
  }

  const payload = {
    model: "sonar-pro",
    stream: true,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userContent },
    ],
    return_citations: true,
    return_images: false,
    search_domain_filter: DOMAIN_FILTERS,
  };

  const response = await fetch("https://api.perplexity.ai/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Perplexity API error ${response.status}: ${errorBody}`);
  }

  const reader = response.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let fullContent = "";
  let citationUrls: string[] = [];

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith("data: ")) continue;

        const data = trimmed.slice(6);
        if (data === "[DONE]") continue;

        try {
          const chunk = JSON.parse(data) as PerplexityStreamChunk;
          const delta = chunk.choices[0]?.delta?.content;
          if (delta) {
            fullContent += delta;
            callbacks.onToken(delta);
          }
          if (chunk.citations) {
            citationUrls = chunk.citations;
          }
        } catch {
          // Skip malformed chunks
        }
      }
    }

    const citations = buildCitations(citationUrls);
    logPerplexityResponse(userContent, fullContent, citationUrls);
    callbacks.onDone(fullContent, citations);
  } catch (err) {
    callbacks.onError(err instanceof Error ? err : new Error(String(err)));
  }
}

/**
 * Non-streaming fallback for cases where streaming fails.
 */
export async function askPerplexity(
  userContent: string
): Promise<{ content: string; citations: Citation[] }> {
  const apiKey = process.env.PERPLEXITY_API_KEY;
  if (!apiKey) {
    throw new Error("PERPLEXITY_API_KEY is not configured");
  }

  const payload = {
    model: "sonar-pro",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userContent },
    ],
    return_citations: true,
    return_images: false,
    search_domain_filter: DOMAIN_FILTERS,
  };

  const response = await fetch("https://api.perplexity.ai/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Perplexity API error ${response.status}: ${errorBody}`);
  }

  const data = (await response.json()) as PerplexityNonStreamResponse;
  const content = data.choices[0].message.content;
  const citationUrls = data.citations ?? [];
  const citations = buildCitations(citationUrls);
  logPerplexityResponse(userContent, content, citationUrls);

  return { content, citations };
}

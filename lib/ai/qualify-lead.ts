import type Anthropic from "@anthropic-ai/sdk";
import { getAnthropicClient } from "@/lib/ai/client";
import type { Lead } from "@/lib/leads";
import {
  QUALIFY_LEAD_SYSTEM_PROMPT,
  buildQualifyLeadUserPrompt,
  formatOutboundMessage,
} from "@/lib/prompts/qualify-lead";

export async function generateQualifyingMessage(lead: Lead): Promise<string> {
  const client = getAnthropicClient();

  const response = await client.messages.create({
    model: "claude-opus-5",
    max_tokens: 300,
    output_config: { effort: "low" },
    system: QUALIFY_LEAD_SYSTEM_PROMPT,
    messages: [
      { role: "user", content: buildQualifyLeadUserPrompt(lead) },
    ],
  });

  const textBlock = response.content.find(
    (block): block is Anthropic.TextBlock => block.type === "text"
  );

  if (!textBlock) {
    throw new Error("Claude response did not include a text block.");
  }

  return formatOutboundMessage(textBlock.text.trim());
}

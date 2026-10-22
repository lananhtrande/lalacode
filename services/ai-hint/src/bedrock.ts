import {
  BedrockRuntimeClient,
  ConverseCommand,
  type ConverseCommandOutput,
} from '@aws-sdk/client-bedrock-runtime';
import { SYSTEM_PROMPT } from './prompt';

/**
 * Gọi Claude qua Amazon Bedrock bằng **IAM role của Lambda** — không có API key
 * ở bất kỳ đâu (ADR 0006).
 *
 * Singapore chỉ hỗ trợ inference profile `global.*` cho Haiku 5.5, nghĩa là
 * request có thể được xử lý ngoài châu Á. Đó chính là lý do dữ liệu gửi đi
 * phải sạch thông tin cá nhân (docs/privacy.md).
 */

export const MODEL_ID = 'global.anthropic.claude-haiku-5-5';
/** Gợi ý chỉ 2–3 câu; chặn trần để không ai trả về cả bài giải dài. */
export const MAX_TOKENS = 400;

let client: BedrockRuntimeClient | null = null;

function getClient(): BedrockRuntimeClient {
  client ??= new BedrockRuntimeClient({});
  return client;
}

/** Chỉ dùng trong test. */
export function resetBedrockClient(): void {
  client = null;
}

export interface AiUsage {
  inputTokens: number;
  outputTokens: number;
}

export interface AiReply {
  text: string;
  usage: AiUsage;
}

function extractText(output: ConverseCommandOutput): string {
  const blocks = output.output?.message?.content ?? [];
  return blocks
    .map((block) => block.text ?? '')
    .join(' ')
    .trim();
}

export async function askForHint(userMessage: string): Promise<AiReply> {
  const output = await getClient().send(
    new ConverseCommand({
      modelId: MODEL_ID,
      system: [{ text: SYSTEM_PROMPT }],
      messages: [{ role: 'user', content: [{ text: userMessage }] }],
      inferenceConfig: { maxTokens: MAX_TOKENS, temperature: 0.3 },
    }),
  );

  return {
    text: extractText(output),
    usage: {
      inputTokens: output.usage?.inputTokens ?? 0,
      outputTokens: output.usage?.outputTokens ?? 0,
    },
  };
}

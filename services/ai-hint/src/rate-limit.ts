import { createHash } from 'node:crypto';
import {
  DynamoDBClient,
  UpdateItemCommand,
  ConditionalCheckFailedException,
} from '@aws-sdk/client-dynamodb';

/**
 * Giới hạn lượt gợi ý AI — vừa để trẻ không ỷ lại vào AI, vừa để chặn hoá đơn.
 *
 * Luật (docs/privacy.md): **không lưu token thô**. Chỉ lưu `sha256(token)` kèm
 * ngày, TTL 48 giờ. Bảng này không nói lên trẻ nào, ở đâu, học gì — chỉ là bộ
 * đếm ẩn danh.
 */

export const PER_TOKEN_PER_DAY = 5;
/** Trần toàn hệ thống mỗi ngày: nếu có gì đó chạy loạn thì vẫn không vỡ ngân sách. */
export const GLOBAL_PER_DAY = 2000;
const TTL_SECONDS = 48 * 60 * 60;

export type RateDecision = 'ok' | 'qua-nhieu-luot' | 'het-han-muc-ngay';

let client: DynamoDBClient | null = null;

function getClient(): DynamoDBClient {
  client ??= new DynamoDBClient({});
  return client;
}

/** Chỉ dùng trong test. */
export function resetRateLimitClient(): void {
  client = null;
}

/** Không bao giờ lưu token thô: bảng chỉ thấy bản băm. */
export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export function dayKeyUtc(now: Date): string {
  return now.toISOString().slice(0, 10);
}

/**
 * Cộng một lượt nếu còn hạn mức. Dùng `ADD` + `ConditionExpression` nên hai
 * request cùng lúc không thể lách qua nhau.
 */
async function countOne(
  tableName: string,
  key: string,
  limit: number,
  expiresAt: number,
): Promise<boolean> {
  try {
    await getClient().send(
      new UpdateItemCommand({
        TableName: tableName,
        Key: { pk: { S: key } },
        UpdateExpression: 'ADD #count :one SET #ttl = :ttl',
        ConditionExpression: 'attribute_not_exists(#count) OR #count < :limit',
        ExpressionAttributeNames: { '#count': 'count', '#ttl': 'expiresAt' },
        ExpressionAttributeValues: {
          ':one': { N: '1' },
          ':limit': { N: String(limit) },
          ':ttl': { N: String(expiresAt) },
        },
      }),
    );
    return true;
  } catch (error) {
    if (error instanceof ConditionalCheckFailedException) return false;
    throw error;
  }
}

export interface RateLimitInput {
  tableName: string;
  token: string;
  now: Date;
  perTokenLimit?: number;
  globalLimit?: number;
}

export async function takeHintSlot({
  tableName,
  token,
  now,
  perTokenLimit = PER_TOKEN_PER_DAY,
  globalLimit = GLOBAL_PER_DAY,
}: RateLimitInput): Promise<RateDecision> {
  const day = dayKeyUtc(now);
  const expiresAt = Math.floor(now.getTime() / 1000) + TTL_SECONDS;

  const forChild = await countOne(
    tableName,
    `tok#${hashToken(token)}#${day}`,
    perTokenLimit,
    expiresAt,
  );
  if (!forChild) return 'qua-nhieu-luot';

  const forEveryone = await countOne(tableName, `all#${day}`, globalLimit, expiresAt);
  return forEveryone ? 'ok' : 'het-han-muc-ngay';
}

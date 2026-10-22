import { beforeEach, describe, expect, it } from 'vitest';
import { mockClient } from 'aws-sdk-client-mock';
import {
  ConditionalCheckFailedException,
  DynamoDBClient,
  UpdateItemCommand,
} from '@aws-sdk/client-dynamodb';
import {
  dayKeyUtc,
  hashToken,
  resetRateLimitClient,
  takeHintSlot,
  GLOBAL_PER_DAY,
  PER_TOKEN_PER_DAY,
} from './rate-limit';

const dynamo = mockClient(DynamoDBClient);
const TOKEN = '6f1c2f4a-9b55-4c21-9f0f-2b6c0a1d3e44';
const NOW = new Date('2026-03-05T08:00:00.000Z');

const overLimit = () => new ConditionalCheckFailedException({ message: 'hết lượt', $metadata: {} });

beforeEach(() => {
  dynamo.reset();
  resetRateLimitClient();
});

describe('đếm lượt gợi ý', () => {
  it('còn lượt thì cho đi tiếp', async () => {
    dynamo.on(UpdateItemCommand).resolves({});
    await expect(takeHintSlot({ tableName: 'bang', token: TOKEN, now: NOW })).resolves.toBe('ok');
  });

  it('KHÔNG bao giờ lưu token thô, chỉ lưu bản băm', async () => {
    dynamo.on(UpdateItemCommand).resolves({});
    await takeHintSlot({ tableName: 'bang', token: TOKEN, now: NOW });

    const everythingSent = JSON.stringify(
      dynamo.commandCalls(UpdateItemCommand).map((c) => c.args[0].input),
    );
    expect(everythingSent).not.toContain(TOKEN);
    expect(everythingSent).toContain(hashToken(TOKEN));
  });

  it('khoá theo ngày, có TTL để tự dọn', async () => {
    dynamo.on(UpdateItemCommand).resolves({});
    await takeHintSlot({ tableName: 'bang', token: TOKEN, now: NOW });

    const input = dynamo.commandCalls(UpdateItemCommand)[0]?.args[0].input;
    expect(input?.Key?.['pk']?.S).toBe(`tok#${hashToken(TOKEN)}#2026-03-05`);
    const ttl = Number(input?.ExpressionAttributeValues?.[':ttl']?.N);
    const hours = (ttl - NOW.getTime() / 1000) / 3600;
    expect(hours).toBeCloseTo(48, 1);
  });

  it('trẻ hết lượt trong ngày thì trả qua-nhieu-luot, không đụng tới bộ đếm chung', async () => {
    dynamo.on(UpdateItemCommand).rejects(overLimit());
    await expect(takeHintSlot({ tableName: 'bang', token: TOKEN, now: NOW })).resolves.toBe(
      'qua-nhieu-luot',
    );
    expect(dynamo.commandCalls(UpdateItemCommand)).toHaveLength(1);
  });

  it('cả hệ thống hết hạn mức ngày thì báo riêng, không đổ lỗi cho trẻ', async () => {
    dynamo
      .on(UpdateItemCommand)
      .resolvesOnce({}) // bộ đếm của trẻ: còn lượt
      .rejectsOnce(overLimit()); // bộ đếm chung: hết
    await expect(takeHintSlot({ tableName: 'bang', token: TOKEN, now: NOW })).resolves.toBe(
      'het-han-muc-ngay',
    );
  });

  it('dùng đúng hai ngưỡng mặc định', async () => {
    dynamo.on(UpdateItemCommand).resolves({});
    await takeHintSlot({ tableName: 'bang', token: TOKEN, now: NOW });
    const calls = dynamo.commandCalls(UpdateItemCommand);
    expect(calls[0]?.args[0].input.ExpressionAttributeValues?.[':limit']?.N).toBe(
      String(PER_TOKEN_PER_DAY),
    );
    expect(calls[1]?.args[0].input.ExpressionAttributeValues?.[':limit']?.N).toBe(
      String(GLOBAL_PER_DAY),
    );
  });

  it('cộng dồn bằng điều kiện trên DynamoDB, không đọc-rồi-ghi', async () => {
    // Hai request cùng lúc không được phép cùng lách qua, nên phải là
    // UpdateItem có ConditionExpression chứ không phải GetItem rồi PutItem.
    dynamo.on(UpdateItemCommand).resolves({});
    await takeHintSlot({ tableName: 'bang', token: TOKEN, now: NOW });
    const input = dynamo.commandCalls(UpdateItemCommand)[0]?.args[0].input;
    expect(input?.UpdateExpression).toContain('ADD');
    expect(input?.ConditionExpression).toContain('#count < :limit');
  });

  it('lỗi DynamoDB khác thì ném ra để handler trả 500, không âm thầm cho qua', async () => {
    dynamo.on(UpdateItemCommand).rejects(new Error('mạng hỏng'));
    await expect(takeHintSlot({ tableName: 'bang', token: TOKEN, now: NOW })).rejects.toThrow();
  });

  it('sang ngày mới là khoá mới, lượt được làm lại', () => {
    expect(dayKeyUtc(new Date('2026-03-05T23:59:00Z'))).toBe('2026-03-05');
    expect(dayKeyUtc(new Date('2026-03-06T00:01:00Z'))).toBe('2026-03-06');
  });
});

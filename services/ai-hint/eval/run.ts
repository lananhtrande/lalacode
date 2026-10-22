#!/usr/bin/env node
/**
 * Chạy bộ eval prompt với **Bedrock thật** rồi chấm theo `checks.ts`.
 *
 * Không chạy trong CI: nó tốn tiền và cần quyền AWS. Chạy tay khi **đổi prompt
 * hoặc đổi model** (docs/testing.md), rồi commit kết quả vào
 * `eval/results/` để lần sau còn so sánh.
 *
 *   AWS_PROFILE=... npm run eval:hints
 */
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { askForHint } from '../src/bedrock.ts';
import { buildUserMessage } from '../src/prompt.ts';
import { checkHint, type CaseExpectation, type CheckFailure } from './checks.ts';

interface EvalCase {
  id: string;
  category: string;
  exercise: { title: string; prompt: string };
  code: string;
  error?: string;
  hintLevel: 1 | 2 | 3;
  expect: CaseExpectation;
}

interface CaseResult {
  id: string;
  category: string;
  hintLevel: number;
  reply: string;
  failures: CheckFailure[];
}

const here = path.dirname(fileURLToPath(import.meta.url));

async function main(): Promise<number> {
  const file = JSON.parse(await readFile(path.join(here, 'cases.json'), 'utf8')) as {
    cases: EvalCase[];
  };

  const results: CaseResult[] = [];
  for (const item of file.cases) {
    const message = buildUserMessage(
      { hintLevel: item.hintLevel },
      item.exercise,
      item.code,
      item.error,
    );
    const reply = await askForHint(message);
    const failures = checkHint(reply.text, item.expect);
    results.push({
      id: item.id,
      category: item.category,
      hintLevel: item.hintLevel,
      reply: reply.text,
      failures,
    });
    console.log(`${failures.length === 0 ? 'ĐẠT ' : 'HỎNG'} ${item.id}`);
    for (const failure of failures) console.log(`      ${failure.rule}: ${failure.detail}`);
  }

  const failed = results.filter((item) => item.failures.length > 0);
  const stamp = new Date().toISOString().slice(0, 10);
  await writeFile(
    path.join(here, 'results', `${stamp}.json`),
    `${JSON.stringify({ ranAt: new Date().toISOString(), results }, null, 2)}\n`,
    'utf8',
  );
  await writeFile(path.join(here, 'results', `${stamp}.md`), toMarkdown(results), 'utf8');

  console.log(`\n${results.length - failed.length}/${results.length} case đạt.`);
  return failed.length === 0 ? 0 : 1;
}

function toMarkdown(results: CaseResult[]): string {
  const failed = results.filter((item) => item.failures.length > 0);
  const lines = [
    `# Kết quả eval prompt — ${new Date().toISOString().slice(0, 10)}`,
    '',
    `${results.length - failed.length}/${results.length} case đạt.`,
    '',
    '| Case | Mức | Kết quả | Ghi chú |',
    '| --- | --- | --- | --- |',
  ];
  for (const item of results) {
    const note = item.failures.map((failure) => `${failure.rule}: ${failure.detail}`).join('; ');
    lines.push(
      `| ${item.id} | ${item.hintLevel} | ${item.failures.length === 0 ? 'đạt' : 'hỏng'} | ${note} |`,
    );
  }
  lines.push('', '## Câu trả lời đầy đủ', '');
  for (const item of results) {
    lines.push(`### ${item.id}`, '', item.reply, '');
  }
  return `${lines.join('\n')}\n`;
}

process.exit(await main());

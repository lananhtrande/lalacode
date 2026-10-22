#!/usr/bin/env node
// Phục vụ bản build kèm **đúng** header mà CloudFront sẽ trả (infra/csp.txt).
// Dùng để chạy e2e trước khi deploy: CSP sai thì trẻ thấy màn hình trắng.
import { createServer } from 'node:http';
import { createReadStream } from 'node:fs';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { projectDir } from './lib/read-content.mjs';

const root = path.join(projectDir, 'apps', 'web', 'dist');
const port = Number(process.argv[2] ?? 4174);
const csp = (await readFile(path.join(projectDir, 'infra', 'csp.txt'), 'utf8')).trim();

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.wasm': 'application/wasm',
  '.zip': 'application/zip',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.map': 'application/json; charset=utf-8',
};

async function resolveFile(urlPath) {
  const clean = decodeURIComponent(urlPath.split('?')[0] ?? '/');
  const candidate = path.join(root, clean);
  // Chặn đi ra ngoài thư mục dist.
  if (!candidate.startsWith(root)) return null;
  try {
    const info = await stat(candidate);
    if (info.isFile()) return candidate;
  } catch {
    /* không có file → SPA fallback */
  }
  return path.join(root, 'index.html');
}

createServer(async (request, response) => {
  const file = await resolveFile(request.url ?? '/');
  if (!file) {
    response.writeHead(403).end();
    return;
  }
  response.writeHead(200, {
    'content-type': TYPES[path.extname(file)] ?? 'application/octet-stream',
    // Giống aws_cloudfront_response_headers_policy.web trong infra/cloudfront.tf.
    'content-security-policy': csp,
    'x-content-type-options': 'nosniff',
    'referrer-policy': 'strict-origin-when-cross-origin',
    'strict-transport-security': 'max-age=31536000; includeSubDomains',
    'x-frame-options': 'DENY',
  });
  createReadStream(file).pipe(response);
}).listen(port, () => {
  console.log(`Bản build + header CloudFront: http://localhost:${port}`);
});

// PreToolUse(Edit|Write|MultiEdit|NotebookEdit): block secret files, secret values, and stage-0 privacy violations.
import { readInput, rel, block, incomingText } from './lib.mjs';

const input = readInput();
const tool = input.tool_name;
const file = rel(input.tool_input?.file_path || input.tool_input?.notebook_path);
const text = incomingText(tool, input.tool_input);

// 1. Files that must never be written by Claude.
const forbiddenFiles = [
  { re: /(^|\/)\.env(\.(?!example$)[^/]*)?$/, why: 'file .env chứa bí mật — chỉ sửa .env.example' },
  { re: /\.(pem|key|p12|pfx)$/, why: 'file khoá/chứng chỉ' },
  { re: /\.tfstate(\.|$)/, why: 'Terraform state' },
  { re: /\.tfvars$/, why: 'Terraform tfvars có thể chứa bí mật (dùng example.tfvars)' },
  { re: /^node_modules\//, why: 'node_modules do npm quản lý' },
  { re: /^dist\//, why: 'dist/ là output build' },
];
for (const f of forbiddenFiles) {
  if (f.re.test(file) && !/example\.tfvars$/.test(file)) {
    block(`Chặn ghi ${file}: ${f.why}. Xem CLAUDE.md luật số 9.`);
  }
}

// 2. Secret values inside any text.
const secretPatterns = [
  { re: /sk-ant-[A-Za-z0-9_-]{20,}/, what: 'Anthropic API key' },
  { re: /AKIA[0-9A-Z]{16}/, what: 'AWS access key' },
  { re: /aws_secret_access_key\s*=\s*\S{20,}/i, what: 'AWS secret key' },
  { re: /-----BEGIN [A-Z ]*PRIVATE KEY-----/, what: 'private key' },
  { re: /gh[pousr]_[A-Za-z0-9]{30,}/, what: 'GitHub token' },
];
for (const s of secretPatterns) {
  if (s.re.test(text)) block(`Chặn: nội dung ghi vào ${file} chứa ${s.what}. Bí mật để trong Secrets Manager / .env (không commit).`);
}

// 3. Stage-0 privacy rules for application code (docs/privacy.md).
const isAppCode = /^(apps|services|packages)\/.*\.(ts|tsx|js|jsx|mjs|html)$/.test(file) && !/\.(test|spec)\./.test(file);
if (isAppCode) {
  const privacy = [
    { re: /googletagmanager|google-analytics|gtag\(|fbq\(|connect\.facebook\.net|hotjar|clarity\.ms/i, why: 'tracker/analytics bên thứ ba' },
    { re: /document\.cookie\s*=/, why: 'ghi cookie' },
    { re: /cdn\.jsdelivr\.net\/pyodide|unpkg\.com|cdnjs\.cloudflare\.com/, why: 'tải script từ CDN bên ngoài (Pyodide phải tự host)' },
    { re: /console\.(log|info|debug)\(\s*(event|req|request)(\.body)?\s*\)/, why: 'log toàn bộ request/event (có thể chứa code học sinh)' },
    { re: /type=["'](email|tel)["']|name=["'](email|phone|fullName|birth(day|date)|school)["']/i, why: 'form thu thông tin cá nhân' },
  ];
  for (const p of privacy) {
    if (p.re.test(text)) {
      block(`Chặn ghi ${file}: phát hiện ${p.why} — vi phạm docs/privacy.md (giai đoạn 0). Nếu thật sự cần, hỏi người duy trì và cập nhật privacy.md + ADR trước.`);
    }
  }
}

process.exit(0);

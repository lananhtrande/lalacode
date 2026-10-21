// PreToolUse(Bash): second line of defence behind settings.json permissions.
import { readInput, block } from './lib.mjs';

const input = readInput();
const cmd = String(input.tool_input?.command || '');

const rules = [
  { re: /\bterraform\s+(apply|destroy|import|state\s+(rm|mv|push))\b/, why: 'Chỉ được chạy terraform plan/validate/fmt. Người duy trì tự apply.' },
  { re: /\bgit\s+push\b.*(--force|-f\b|--force-with-lease)/, why: 'Không force-push.' },
  { re: /\bgit\s+push\b.*\bmain\b/, why: 'Không push thẳng lên main — mở PR.' },
  { re: /\brm\s+-[a-z]*r[a-z]*f?\s+(\/|~|\$HOME|\.\s*$|\.\.)/, why: 'Lệnh xoá nguy hiểm.' },
  { re: /\b(cat|less|more|head|tail|grep|cp|scp)\b[^|;&]*\.env(?!\.example)\b/, why: 'Không đọc/sao chép file .env.' },
  { re: /\b(curl|wget)\b[^|]*\|\s*(sh|bash|zsh)\b/, why: 'Không chạy script tải từ mạng.' },
  { re: /\baws\s+(s3\s+(rm|rb)|cloudfront\s+delete|lambda\s+delete|dynamodb\s+delete-table|secretsmanager\s+(get-secret-value|delete))/, why: 'Thao tác AWS phá huỷ hoặc đọc bí mật — người duy trì tự làm.' },
  { re: /\bnpm\s+publish\b/, why: 'Dự án không publish package.' },
];

for (const r of rules) {
  if (r.re.test(cmd)) block(`Chặn lệnh: ${r.why}\nLệnh: ${cmd}`);
}
process.exit(0);

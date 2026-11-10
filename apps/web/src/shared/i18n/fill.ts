/** Điền chỗ trống trong chuỗi của `vi.ts`: `fill('Tiếp tục bài {n}', { n: 3 })`. */
export function fill(template: string, values: Readonly<Record<string, string | number>>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in values ? String(values[key]) : match,
  );
}

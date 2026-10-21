# Quy ước code

## Chung
- TypeScript `strict`, không `any` (dùng `unknown` + thu hẹp kiểu). Không `@ts-ignore`; nếu bắt buộc dùng `@ts-expect-error` kèm lý do.
- Tên file: `kebab-case.ts`; component React: `PascalCase.tsx`; hook: `useThing.ts`.
- Một component một file; file > 300 dòng là dấu hiệu cần tách.
- Hàm thuần cho logic (chấm bài, mã hoá tiến độ, tính streak) → dễ unit test; component chỉ ghép.
- Không import chéo giữa `features/*`; dùng `shared/` hoặc package.
- Lỗi: ném `Error` có `code` rõ ràng; UI hiển thị thông báo tiếng Việt từ bảng thông điệp, không hiển thị stack trace cho trẻ.

## Cấu trúc `apps/web/src`

```
app/            # router, layout, providers
features/
  lesson/       # xem bài học
  exercise/     # editor + chạy + chấm + gợi ý
  map/          # bản đồ nhiệm vụ
  badges/
  report/       # báo cáo cho bố mẹ (đọc #fragment)
runner/         # worker.ts, protocol.ts, grader.py, turtle.py, errors-vi.ts
progress/       # db.ts, schema.ts, migrate.ts, share-code.ts
content/        # loader đọc bundle nội dung đã build
shared/         # ui/, lib/, i18n/vi.ts
```

## UI & văn bản
- Mọi chuỗi hiển thị nằm trong `shared/i18n/vi.ts` (dù chỉ có tiếng Việt) — dễ sửa giọng văn, dễ thêm ngôn ngữ sau.
- Nút tối thiểu 44×44 px; cỡ chữ thân ≥ 16 px; tương phản AA.
- Không dùng màu là tín hiệu duy nhất (đúng/sai luôn kèm icon + chữ).
- Hoạt ảnh tôn trọng `prefers-reduced-motion`.

## Runner protocol
- Message có kiểu `{ type: 'run' | 'grade' | 'cancel', id, payload }` → `{ type: 'stdout' | 'result' | 'error', id, payload }`.
- Không truyền hàm/đối tượng phức tạp qua `postMessage`; chỉ JSON thuần.
- Thay đổi protocol → tăng `PROTOCOL_VERSION` và cập nhật test.

## Lambda `ai-hint`
- Handler mỏng; logic trong hàm thuần (`buildPrompt`, `checkRateLimit`, `sanitizeInput`).
- Validate input bằng zod; từ chối sớm với mã lỗi rõ.
- Không `console.log(event)`; dùng logger chỉ in trường cho phép (xem `privacy.md`).

## Phụ thuộc
- Ưu tiên API nền tảng (fetch, CompressionStream, crypto.randomUUID) trước thư viện.
- Ghim phiên bản Pyodide chính xác; cập nhật có ADR hoặc ghi chú trong PR kèm kết quả `content:verify` trên Pyodide.

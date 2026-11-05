# Nhận diện thương hiệu lalakode

**Khẩu hiệu:** Nền tảng học lập trình cho người Việt

**Biểu tượng:** chữ “ơ” — nét móc chỉ tiếng Việt mới có — cạnh con trỏ nhấp nháy: người Việt + viết code.

![logo](lalakode-logo-tagline@2x.png)

## Màu
| Vai trò | Hex | Ghi chú |
| --- | --- | --- |
| San hô (màu thương hiệu) | `#E8553A` | Nền biểu tượng, con trỏ của logo chữ. **Không dùng làm màu chữ nhỏ** trên nền trắng (tương phản 3,6:1) |
| Mực | `#18181B` | Logo chữ, con trỏ trong biểu tượng |
| Chữ phụ | `#4A4A52` | Khẩu hiệu |

Chữ trên nền san hô: dùng Mực `#18181B` (≈5,8:1). Chữ trắng chỉ dùng cho hình (nét chữ ơ của biểu tượng), không dùng cho chữ đọc.

## Font
Logo chữ: **Inter ExtraBold (800)**, giãn chữ −3,5 %; khẩu hiệu: Inter Medium (500). Chữ trong các file SVG đã chuyển thành nét (không phụ thuộc font trên máy).

## File (trong `apps/web/public/`)
| File | Dùng cho |
| --- | --- |
| `brand/lalakode-logo.svg` | Logo ngang trên nền sáng (thanh trên cùng, sidebar) |
| `brand/lalakode-logo-dark.svg` | Logo ngang trên nền tối |
| `brand/lalakode-logo-tagline.svg` / `-dark.svg` | Logo kèm khẩu hiệu (trang giới thiệu, bài đăng, slide) |
| `brand/lalakode-mark.svg` | Biểu tượng riêng (≥ 48 px) |
| `favicon.svg`, `favicon-32.png` | Favicon — bản nét dày, bỏ con trỏ, cho cỡ nhỏ |
| `apple-touch-icon.png` (180), `brand/icon-192.png`, `brand/icon-512.png` | Icon khi thêm vào màn hình chính |

## Quy tắc dùng
- Khoảng trống quanh logo ≥ ¼ chiều cao biểu tượng. Logo ngang không nhỏ hơn 24 px chiều cao; dưới mức đó chỉ dùng biểu tượng.
- Không đổi màu, kéo giãn, xoay, thêm bóng/viền, hay đặt logo lên ảnh rối.
- Logo chữ luôn viết thường: **lalakode**.

## Dựng lại
`build-logo.mjs` sinh toàn bộ file từ đầu (Inter từ `@fontsource/inter`, `opentype.js`, `@resvg/resvg-js`). Chạy trong một thư mục tạm, không thêm dependency vào repo:
`npm i opentype.js@1.3.4 @fontsource/inter@5.1.0 @resvg/resvg-js@2.6.2 && PALETTE=coral node build-logo.mjs ./out`

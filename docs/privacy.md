# Quyền riêng tư & dữ liệu — giai đoạn 0

Người dùng là trẻ em Việt Nam. Áp dụng Luật Bảo vệ dữ liệu cá nhân 2025 (Luật 91/2025/QH15, hiệu lực 01/01/2026), Nghị định 356/2025/NĐ-CP, Nghị định 53/2022/NĐ-CP. Thiết kế giai đoạn 0 nhằm **không thu thập dữ liệu cá nhân trên server**. Tài liệu này không thay thế tư vấn pháp lý.

## Luồng dữ liệu được phép

| Dữ liệu | Ở đâu | Gửi lên server? |
| --- | --- | --- |
| Tiến độ, code nháp, streak, huy hiệu, biệt danh (tuỳ chọn) | IndexedDB trên máy (DB `lalacode`, store `exercises`/`lessons`/`profile`) | **Không** |
| Mã tiến độ / link báo cáo | Do người dùng tự sao chép; dữ liệu nằm sau `#` | **Không** |
| Token ẩn danh (UUID ngẫu nhiên) | Máy; server lưu `sha256(token)` + bộ đếm, TTL 48 h | Có — chỉ để giới hạn lượt AI |
| Yêu cầu gợi ý AI | `exerciseId`, `code`, `error`, `hintLevel` | Có — không log body; chuyển tới Claude trên Amazon Bedrock (profile global, có thể xử lý ngoài châu Á) |
| Sự kiện analytics gộp | Tên sự kiện + bài học + ngày | Có — không ID, không IP lưu trữ |
| Log truy cập CloudFront | Mặc định **tắt**; nếu bật để debug thì tối đa 7 ngày | — |

## Cấm ở giai đoạn 0
- Form thu tên thật, ngày sinh, trường, lớp, email, SĐT, ảnh, giọng nói của trẻ.
- Cookie hoặc localStorage dùng để theo dõi; SDK quảng cáo/analytics bên thứ ba (Google Analytics, Facebook Pixel, Hotjar…).
- Ghi log `event.body`, code học sinh, hoặc header nhận dạng (IP, User-Agent đầy đủ) trong Lambda.
- Gửi dữ liệu tiến độ lên server dưới bất kỳ hình thức nào (kể cả "tạm thời").
- Bảng xếp hạng hiển thị danh tính; trang công khai liệt kê người tham gia.
- Ô nhập tự do có thể khiến trẻ gõ thông tin cá nhân gửi lên AI — code học sinh gửi lên AI phải qua bộ lọc (`sanitizeInput`): cắt độ dài, loại chuỗi giống email/SĐT, cảnh báo nếu phát hiện.

## Yêu cầu với AI
- Gọi qua Amazon Bedrock bằng profile global: dữ liệu gửi cho AI có thể được xử lý ở nước ngoài. Đây là lý do **tuyệt đối không** gửi dữ liệu cá nhân tới AI. Khi có pháp nhân, hỏi luật sư về thủ tục chuyển dữ liệu xuyên biên giới.
- Không gửi gì ngoài mã bài, code (đã lọc), lỗi, mức gợi ý.
- Prompt hệ thống buộc trả lời ngắn, tiếng Việt, đúng chủ đề bài, không hỏi thông tin cá nhân của trẻ.
- Có công tắc tắt AI; có gợi ý tĩnh dự phòng.

## Đã cài đặt tới đâu (giai đoạn 0)

- **S0-12**: tiến độ nằm trong IndexedDB trên máy. Hồ sơ chỉ có: ngày tạo, ngày học gần nhất, số ngày liên tiếp, danh sách huy hiệu, và **biệt danh tuỳ chọn — hiện chưa có ô nhập trong UI**, chỉ có chỗ trong schema. Không có ô nào hỏi tên thật, tuổi, trường lớp.
- Code nháp của trẻ lưu trên máy để mở lại bài là thấy nguyên bài đang làm dở. Có test e2e khẳng định **không request nào mang code của trẻ rời khỏi máy**.
- Nút xoá toàn bộ dữ liệu (S0-16) gọi `clearAllProgress()` — đã có sẵn và có test.

## Minh bạch
- Trang "Quyền riêng tư" viết cho phụ huynh, ngôn ngữ dễ hiểu: dữ liệu nằm trên máy, gửi gì cho AI, cách xoá (nút "Xoá toàn bộ dữ liệu trên máy này").
- Nhúng YouTube: dùng `youtube-nocookie.com`, ghi rõ trên trang quyền riêng tư.

## Liên hệ ngoài web
Danh sách phụ huynh quan tâm thu qua nhóm Zalo/Facebook là dữ liệu cá nhân: thu tối thiểu, có câu đồng ý, xoá khi kết thúc giai đoạn 0 hoặc khi chuyển sang hệ thống chính thức.

## Checklist cho mỗi thay đổi
1. Có dữ liệu nào mới rời khỏi máy người dùng không? Nếu có → cập nhật bảng trên và hỏi người duy trì.
2. Có log mới không? In những trường nào?
3. Có bên thứ ba mới nhận request từ trình duyệt không (CDN, font, script)? Mặc định tự host.

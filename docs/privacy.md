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
- Ô nhập tự do có thể khiến trẻ gõ thông tin cá nhân gửi lên AI — code học sinh gửi lên AI phải qua bộ lọc (`sanitizeForAi`): cắt độ dài, che email, số điện thoại, dãy số dài, đường link, và phần đứng sau các cụm tự giới thiệu ("em tên là…", "nhà ở…", "học lớp…").
- **Giới hạn thật của bộ lọc, phải nói thẳng:** nó đoán theo mẫu. Một cái tên viết trơ trọi — `print("Nguyễn Lan Anh")` — **vẫn lọt qua** và sẽ tới Bedrock. Có test ghi lại đúng trường hợp này để không ai tưởng bộ lọc là tuyệt đối. Vì vậy panel gợi ý (S0-19) **phải** nhắc trẻ đừng gõ tên thật vào code trước khi bấm xin gợi ý.

## Yêu cầu với AI
- Gọi qua Amazon Bedrock bằng profile global: dữ liệu gửi cho AI có thể được xử lý ở nước ngoài. Đây là lý do **tuyệt đối không** gửi dữ liệu cá nhân tới AI. Khi có pháp nhân, hỏi luật sư về thủ tục chuyển dữ liệu xuyên biên giới.
- Không gửi gì ngoài mã bài, code (đã lọc), lỗi, mức gợi ý.
- Prompt hệ thống buộc trả lời ngắn, tiếng Việt, đúng chủ đề bài, không hỏi thông tin cá nhân của trẻ.
- Có công tắc tắt AI; có gợi ý tĩnh dự phòng.

## Đã cài đặt tới đâu (giai đoạn 0)

- **S0-12**: tiến độ nằm trong IndexedDB trên máy. Hồ sơ chỉ có: ngày tạo, ngày học gần nhất, số ngày liên tiếp, danh sách huy hiệu, và **biệt danh tuỳ chọn — hiện chưa có ô nhập trong UI**, chỉ có chỗ trong schema. Không có ô nào hỏi tên thật, tuổi, trường lớp.
- Code nháp của trẻ lưu trên máy để mở lại bài là thấy nguyên bài đang làm dở. Có test e2e khẳng định **không request nào mang code của trẻ rời khỏi máy**.
- **S0-16 nút xoá toàn bộ dữ liệu** nằm ở trang `/tien-do`: hỏi lại một lần ngay trong giao diện (không dùng hộp thoại `confirm()` của trình duyệt), nhắc trẻ sao chép mã tiến độ trước nếu muốn giữ, rồi `deleteAllData()` dọn sạch từng store **và xoá hẳn database**. Màn hình tự dọn theo. Có test e2e: xoá → bản đồ về 0/2, huy hiệu về 0/6, **tải lại trang vẫn sạch**.
- **S0-15 link báo cáo**: dùng lại mã tiến độ, đặt sau dấu `#` nên **trình duyệt không gửi lên máy chủ** (có test e2e khẳng định). Trang chỉ hiện số liệu; không có họ tên, không có code của trẻ. Hai giới hạn phải nói thật:
  - Phần sau `#` không đi theo request nào, **nhưng extension trình duyệt hoặc tính năng đồng bộ lịch sử vẫn đọc được địa chỉ đang mở**. Đây là giới hạn chung của mọi thiết kế giấu dữ liệu sau `#`, không riêng lalacode. Vì vậy link chỉ nên chứa thứ không nhạy cảm — và nó đúng là vậy.
  - **Mã không có chữ ký**, nên ai biết cấu trúc đều tự ghép được một báo cáo đẹp. Link này để bố mẹ theo dõi cho vui, **không dùng làm bằng chứng chấm điểm**.
- **S0-14 mã tiến độ**: chuỗi do trẻ tự sao chép, **không có request nào gửi nó đi** (có test e2e chặn). Mã chứa: mã bài tập/bài học, trạng thái (xong **hoặc đang làm**), số lần thử, mốc thời gian, streak, huy hiệu, và `nickname` nếu sau này có. **Không chứa code trẻ viết** — vì mã hay bị dán vào chỗ công khai.
  - ⚠️ **Khi nào thêm ô nhập biệt danh thì phải review lại chỗ này**: biệt danh sẽ đi theo mã tiến độ tới bất kỳ ai nhận được mã. Nếu giữ ô đó, hoặc loại biệt danh khỏi mã, hoặc nói rõ cho trẻ biết.
  - Mã nhập vào được kiểm **từng trường** trước khi ghi, và chặn mã quá dài hoặc nén phình bất thường — một mã "đùa" không được phép làm hỏng tiến độ hay treo máy trẻ.

## Minh bạch
- Trang "Quyền riêng tư" viết cho phụ huynh, ngôn ngữ dễ hiểu: dữ liệu nằm trên máy, gửi gì cho AI, cách xoá (nút "Xoá toàn bộ dữ liệu trên máy này").
- Nhúng YouTube: dùng `youtube-nocookie.com`, ghi rõ trên trang quyền riêng tư.

## Liên hệ ngoài web
Danh sách phụ huynh quan tâm thu qua nhóm Zalo/Facebook là dữ liệu cá nhân: thu tối thiểu, có câu đồng ý, xoá khi kết thúc giai đoạn 0 hoặc khi chuyển sang hệ thống chính thức.

## Checklist cho mỗi thay đổi
1. Có dữ liệu nào mới rời khỏi máy người dùng không? Nếu có → cập nhật bảng trên và hỏi người duy trì.
2. Có log mới không? In những trường nào?
3. Có bên thứ ba mới nhận request từ trình duyệt không (CDN, font, script)? Mặc định tự host.

# 0011 — Cấu trúc học mới: catalog, trình học bài, bài thực hành chia đôi, kho luyện tập
Trạng thái: Chấp nhận
Ngày: 2026-11-10
Theo: `docs/prompts/2026-11-10-ui-rebuild.md` (S0-37 → S0-40). Giữ nguyên ADR 0008–0010 (token, font, "San hô chỉ ở logo"), trừ một ngoại lệ "chỉ giao diện sáng" ghi ở dưới.

## Bối cảnh
Đến S0-36, cả khoá 20 bài nằm trên **một trang "Bản đồ nhiệm vụ"** dạng lưới thẻ. Khi học, trẻ đi bài học → bài tập → bài tiếp bằng nút, nhưng không lúc nào thấy mình đang ở đâu trong khoá. Khung trang chung (sidebar menu) chiếm chỗ của editor ở màn bài tập. Người duy trì đã khảo sát một nền tảng học code chạy trong trình duyệt cho người lớn và muốn LaLaKode học theo **cách tổ chức**: catalog khoá học, trình học bài có mục lục bên trái, bài thực hành chia đôi, kho luyện tập. Không chép giao diện, chữ, hình hay nội dung của trang nào; hình minh hoạ tự vẽ (SVG phẳng) trong repo.

## Quyết định

**Bốn tầng, bốn PR theo thứ tự:**

| Việc | Đường dẫn | Ghi chú |
| --- | --- | --- |
| S0-37 Catalog và trang khoá | `/khoa-hoc`, `/khoa-hoc/:courseId` | Thay "Bản đồ" trong menu. `/ban-do` chuyển hướng (`replace`) sang `/khoa-hoc/py-khoi-dong`. Khoá có **chương** (`course.json → chapters`), cấp độ, thẻ, hình minh hoạ. |
| S0-38 Trình học bài | `/bai-hoc/:id`, `/bai-tap/:id` | Không dùng sidebar chung của app: khung riêng (`handle: { layout: 'learn' }`) với **mục lục khoá ở bên trái, nền tối**, topbar có breadcrumb. |
| S0-39 Bài thực hành chia đôi | `/bai-tap/:id` | Đề bài bên trái; editor và panel Kết quả/Kiểm tra bên phải. Đề bài có thêm độ khó, yêu cầu, ví dụ (tuỳ chọn trong schema). |
| S0-40 Kho luyện tập | `/luyen-tap` | Mọi bài tập của mọi khoá, lọc theo độ khó/chủ đề/trạng thái, "Bài ngẫu nhiên", "Thử thách hôm nay", "Để dành" — tất cả trong trình duyệt. |

**Chương là dữ liệu, kiểm bằng schema.** Mỗi bài trong `order` thuộc **đúng một** chương, các chương xếp bài đúng thứ tự `order` (`validateCourseTree`, có test). Mục lục ở trang khoá và ở sidebar trình học bài, cùng thứ tự bài trước/tiếp (S0-36), đều đọc từ một nguồn này.

**Tiến độ khoá tính theo bài học đã xong** (đủ bài tập), không theo bài tập: "7/20 bài · 35%" giống nhau ở catalog, trang khoá và sidebar. "Tiếp tục bài N" luôn là bài **đầu tiên** chưa xong theo thứ tự khoá.

**Ngoại lệ mới của "chỉ giao diện sáng": sidebar trình học bài nền tối** (S0-38). Trước đây chỉ editor và console là tối. Sidebar mục lục tối tách hẳn "khung điều hướng" khỏi "nội dung để đọc" và nối liền với editor tối ở màn bài tập. Màu dùng token riêng `learn-*` trong `@theme`, mọi cặp chữ/nền và viền focus có trong `tokens.test.ts`. Phần còn lại vẫn sáng; **không có chế độ tối cho toàn trang** trong đợt này.

**Bộ lọc nằm trên URL** (`?trang-thai=dang-hoc`, `?cap-do=…`, `?tim=…`): tải lại trang hay gửi link vẫn giữ nguyên, không cần lưu gì thêm.

## Không làm (và vì sao)

| Thứ | Lý do |
| --- | --- |
| Bảng xếp hạng, so sánh với bạn khác | Cần server biết tiến độ của từng trẻ; tạo áp lực so bì với trẻ 10–15 tuổi. |
| Bình luận dưới bài | Cần tài khoản và kiểm duyệt; trẻ có thể để lộ thông tin cá nhân. |
| Đăng nhập Google, tài khoản | Giai đoạn 0 không có tài khoản (CLAUDE.md, luật 1). |
| Bảng giá, quảng cáo | Chưa bán gì; không quảng cáo cho trẻ em. |
| Tỉ lệ đúng, số lượt nộp, sao đánh giá trên bài tập | Cần gom dữ liệu của mọi trẻ lên server; với trẻ, "chỉ 12% làm đúng" là lời doạ, không phải thông tin. |
| Chế độ tối cho toàn trang | Chưa có nhu cầu; thêm một bộ màu là gấp đôi việc kiểm tương phản. Chỉ editor, console và sidebar trình học bài là tối. |

Những thứ cần server chỉ xét lại ở giai đoạn sau, và chỉ bật khi phụ huynh đồng ý.

## Hệ quả
- Tốt: trẻ luôn thấy mình ở chương nào, bài nào, còn bao nhiêu; thêm khoá thứ hai không phải sửa giao diện.
- Tốt: mục lục, bài trước/tiếp và tiến độ cùng đọc một nguồn (`content/catalog.ts`, `content/navigation.ts`), hàm thuần có unit test.
- Xấu: `course.json` có thêm trường bắt buộc (`level`, `illustration`, `chapters`); thêm bài mới phải nhớ xếp vào một chương (`content:check` nhắc).
- Xấu: hai khung trang (khung chung và khung học bài) phải giữ đồng bộ phần logo và liên kết bỏ qua. Khung học bài không có chân trang: link Quyền riêng tư, Mã tiến độ nằm ở các trang khác, cách một lần bấm qua breadcrumb.

# Video 01 — Xin chào, Python!

**Khái niệm:** `print`, chuỗi · **Thời lượng:** ~5 phút 35 · **Bài tập đi kèm:** In lời chào, Hai dòng chữ, Sửa lỗi giúp bạn, Cây thông bằng dấu sao

**Sau video, em biết:** dùng `print` in chữ ra màn hình; chữ phải nằm trong ngoặc kép; mỗi `print` là một dòng; gặp lỗi thì bình tĩnh sửa.

---

## Cảnh 1 · 0:00–0:35 · Mở đầu
**Hình:** Màn hình kem. Logo LaLaKode bật lên rồi thu nhỏ vào góc. Rùa Lala bò vào giữa, vẫy tay. Tiêu đề "Bài 1 · Xin chào, Python!" hiện chữ từng tiếng.
**Trên màn hình:** `Bài 1 · Xin chào, Python!`
**Lời đọc:**
> Xin chào em! Chào mừng em đến với LaLaKode. Đây là Rùa Lala, bạn đồng hành của mình trong cả khoá học. Hôm nay, em sẽ viết dòng code Python đầu tiên trong đời. Chỉ một dòng thôi, nhưng máy tính sẽ làm đúng theo lời em nói. Mình bắt đầu nhé!

## Cảnh 2 · 0:35–1:15 · Máy tính làm theo lệnh
**Hình:** Một chiếc máy tính hoạt hình có mặt cười. Lala đưa một tờ giấy ghi "Hãy nói: Chào em!". Máy đọc, màn hình máy hiện chữ "Chào em!". Bên cạnh, Lala đưa tờ giấy viết nguệch ngoạc "chào em đi mà…" — máy nghiêng đầu, hiện dấu "?".
**Trên màn hình:** `Máy tính rất giỏi làm theo lệnh` → `… nhưng lệnh phải viết đúng cách`
**Lời đọc:**
> Máy tính rất giỏi làm theo lệnh. Nhưng nó không hiểu tiếng Việt như mình. Mình phải nói với nó bằng một ngôn ngữ riêng, gọi là ngôn ngữ lập trình. Python là một ngôn ngữ như thế, và nó rất dễ đọc. Mỗi lệnh phải viết đúng cách. Viết đúng, máy làm ngay. Viết lộn xộn, máy sẽ ngơ ngác, không biết em muốn gì.

## Cảnh 3 · 1:15–2:00 · Lệnh `print`
**Hình:** Khung editor nền tối trượt vào. Code gõ ra từng ký tự. Lần lượt tô sáng: chữ `print` (nhãn "lệnh"), cặp ngoặc tròn (nhãn "đặt thứ cần in vào đây"), chữ trong ngoặc kép (nhãn "chuỗi"). Mũi tên từ code bay sang khung "Kết quả chạy" bên phải, hiện `Chào em!`.
**Trên màn hình:**
```python
print("Chào em!")
```
Kết quả: `Chào em!`
**Lời đọc:**
> Lệnh đầu tiên em học là "prin". Chữ print trong tiếng Anh nghĩa là in. Trong Python, print nghĩa là in ra màn hình. Em viết print, mở ngoặc tròn, rồi đặt chữ muốn in vào trong cặp ngoặc kép. Cuối cùng đóng ngoặc tròn lại. Chữ nằm trong ngoặc kép, Python gọi là chuỗi. Bấm Chạy thử, và… máy hiện đúng dòng chữ Chào em! Thấy chưa, em vừa ra lệnh cho máy tính đấy.

## Cảnh 4 · 2:00–2:30 · Mỗi `print` là một dòng
**Hình:** Thêm dòng code thứ hai và thứ ba. Mỗi lần thêm, khung kết quả mọc thêm một dòng, có hiệu ứng "bật" nhẹ. Lala đếm ngón tay: một, hai, ba.
**Trên màn hình:**
```python
print("Chào em!")
print("Mình là Lala")
print("Cùng học Python nhé")
```
**Lời đọc:**
> Muốn in nhiều dòng thì sao? Rất dễ. Mỗi lệnh print in ra một dòng. Ba lệnh print là ba dòng. Máy đọc code từ trên xuống dưới, dòng nào trước thì làm trước. Em đổi thứ tự hai dòng, kết quả cũng đổi thứ tự theo.

## Cảnh 5 · 2:30–3:20 · Khi máy báo lỗi
**Hình:** Lala tự gõ `print(Chào em!)` — thiếu ngoặc kép. Bấm chạy. Khung lỗi màu đỏ cam rung nhẹ, hiện chữ tiếng Anh `SyntaxError`. Lala ôm đầu hoảng hốt. Sau đó một kính lúp di chuyển tới chỗ thiếu ngoặc kép, nháy sáng. Lala thêm hai dấu ngoặc kép, chạy lại, có dấu ✓ xanh lá, Lala nhảy lên vui mừng.
**Trên màn hình:** `print(Chào em!)` → ⚠ `SyntaxError` → `print("Chào em!")` ✓
**Lời đọc:**
> Bây giờ, Lala thử viết mà quên mất dấu ngoặc kép. Bấm chạy… Ối, máy báo lỗi, toàn chữ tiếng Anh! Lala hoảng quá. Nhưng em đừng lo nhé. Lỗi không có nghĩa là em kém. Lỗi chỉ có nghĩa là máy chưa hiểu em muốn gì. Mình nhìn kỹ lại dòng code: chữ Chào em chưa nằm trong ngoặc kép. Thêm hai dấu ngoặc kép vào, chạy lại… Được rồi! Người viết code giỏi nhất cũng gặp lỗi mỗi ngày. Họ chỉ bình tĩnh tìm chỗ sai rồi sửa thôi.

## Cảnh 6 · 3:20–4:10 · Lala thử ngay: tấm thiệp chúc mừng
**Hình:** Lala gõ từng dòng, mỗi dòng in ra một phần của tấm thiệp; khung thiệp hoạt hình có viền hoa mọc dần quanh kết quả. Dòng dấu sao làm đường viền trên và dưới.
**Trên màn hình:**
```python
print("**********")
print("Chúc mừng sinh nhật!")
print("Chúc bạn Minh thật vui")
print("**********")
```
**Lời đọc:**
> Lala muốn làm một tấm thiệp sinh nhật cho bạn Minh. Bạn ấy dùng bốn lệnh print. Dòng đầu và dòng cuối toàn dấu sao, làm đường viền cho đẹp. Hai dòng giữa là lời chúc. Em thấy không, dấu sao cũng là chữ, nên vẫn phải nằm trong ngoặc kép. Chỉ với một lệnh print, em đã làm được thiệp, vẽ được hình bằng ký tự, như cây thông trong bài tập cuối hôm nay. Em thử nghĩ xem, em muốn làm thiệp tặng ai?

## Cảnh 7 · 4:10–4:45 · Dừng lại thử nhé!
**Hình:** Màn hình chuyển nền xanh dương nhạt, chữ "Dừng lại thử nhé!" và đồng hồ đếm 5-4-3-2-1. Code hiện ra, khung kết quả bị che bằng dấu "?". Hết giờ, dấu "?" lật mở ra kết quả.
**Trên màn hình:**
```python
print("Một")
print("Hai")
```
Kết quả: `Một` / `Hai`
**Lời đọc:**
> Đố em nhé! Đoạn code này in ra mấy dòng, và in những gì? Em tạm dừng video và đoán thử. … Đáp án là: hai dòng. Dòng trên là Một, dòng dưới là Hai. Em đoán đúng không?

## Cảnh 8 · 4:45–5:35 · Tóm tắt và bài tập
**Hình:** Ba thẻ ghi nhớ lần lượt lật ra. Cuối cùng Lala chỉ tay về nút "Bài tập tiếp theo" màu xanh dương trên giao diện LaLaKode.
**Trên màn hình:** ① `print` in chữ ra màn hình · ② Chữ nằm trong `" "` gọi là chuỗi · ③ Mỗi `print` là một dòng · Gặp lỗi: bình tĩnh, tìm chỗ sai, sửa lại.
**Lời đọc:**
> Mình cùng nhớ lại nhé. Một: lệnh print in chữ ra màn hình. Hai: chữ cần in phải nằm trong ngoặc kép, gọi là chuỗi. Ba: mỗi lệnh print in một dòng. Và gặp lỗi thì bình tĩnh, tìm chỗ sai rồi sửa. Giờ đến lượt em. Bài tập đầu tiên đang chờ ngay bên dưới video. Em sẽ in lời chào, in hai dòng, sửa lỗi giúp bạn Minh, và vẽ một cây thông bằng dấu sao. Hẹn gặp em ở bài sau!

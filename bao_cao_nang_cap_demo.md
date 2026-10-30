# BÁO CÁO KỸ THUẬT: CÁC NỘI DUNG NÂNG CẤP VÀ HOÀN THIỆN HỆ THỐNG DEMO
**Đề tài:** Mô hình kinh doanh bảo hiểm nông nghiệp tự động đa rủi ro dựa trên nền tảng Blockchain và Hợp đồng thông minh (Smart Contract)  
**Học phần:** Đổi mới sáng tạo Tài chính  

---

## 1. TỔNG QUAN CÁC HẠNG MỤC NÂNG CẤP
Nhằm chuyển hóa toàn diện các luận điểm lý thuyết từ Phần 1 đến Phần 6 trong thuyết minh đề tài thành trải nghiệm trực quan trên hệ thống mô phỏng, nhóm đã tiến hành nâng cấp 5 module cốt lõi trên mã nguồn (`payout.js`, `data.js`, `index.html`):

1. **Module Oracle Đa nguồn & Chống gian lận số liệu (Mục 4.2.1 & 4.3.1)**
2. **Module Công thức chi trả Tuyến tính giảm "Hiệu ứng vách đá" (Mục 4.2.5)**
3. **Module Đa kịch bản & Mô phỏng Backtest lịch sử (Mục 6.3)**
4. **Module Biên lai Đối soát Ba mắt xích: Blockchain – Ngân hàng VNĐ – Tin nhắn Nông dân (Mục 4.3.3 & 6.4)**
5. **Module Đối chiếu Định lượng Rủi ro Cơ sở: Cụm trạm vs. Trung bình Huyện (Mục 1.2.2 & 3.1.4)**

> [!NOTE]
> **Nguyên tắc bảo toàn tính nhất quán:** Kịch bản mặc định (`Mùa khô minh họa`) vẫn giữ nguyên 100% số liệu gốc (5 trạm, 9 đợt, tổng chi **150.000.000 đ**), khớp tuyệt đối với Bảng 5.2 và Bảng 5.3 trong báo cáo chính.

---

## 2. CHI TIẾT CÁC CẤU PHẦN NÂNG CẤP MỚI

### 2.1. Module Oracle Đa nguồn & Thuật toán Chống gian lận (Mục 4.3.1)
* **Vấn đề giải quyết:** Khắc phục triệt để "bài toán Oracle" — nguy cơ dữ liệu đầu vào bị sai lệch do cảm biến hỏng hoặc có hành vi gian lận (ví dụ: cố tình đổ nước muối vào cảm biến).
* **Quy tắc kỹ thuật triển khai trong `payout.js` (`tinhOracleDaNguon`):**
  * **Tối thiểu 3 nguồn độc lập:** (1) Trạm KTTV Quốc gia, (2) Cảm biến IoT của HTX, (3) Nguồn độc lập do DNBH chỉ định.
  * **Lọc trước nguồn lỗi:** Tự động loại bỏ các trạm mất kết nối (`ketNoi = false`) hoặc sai chữ ký số (`chuKyHopLe = false`).
  * **Thuật toán Trung vị (Median):** Lấy giá trị trung vị của các nguồn đo hợp lệ thay vì trung bình cộng để triệt tiêu các giá trị ngoại lai (outliers).
  * **Ngưỡng đồng thuận 2/3:** Yêu cầu tối thiểu 2/3 nguồn hoạt động và chênh lệch không vượt quá biên độ $\pm 15\%$ quanh giá trị trung vị.
  * **Trạng thái "Chờ kiểm tra" (Pending Review):** Khi không đạt ngưỡng đồng thuận (ví dụ mất kết nối 2 nguồn hoặc các nguồn mâu thuẫn lớn), Smart Contract không tự ý từ chối hay chi sai, mà chuyển hồ sơ sang trạng thái giám định bổ sung.
* **4 tình huống tương tác thực tế trên giao diện:**
  1. *Bình thường:* Cả 3 nguồn đồng thuận trong biên độ $\pm 3\% \rightarrow$ Trả về giá trị hợp lệ.
  2. *Đổ muối vào cảm biến HTX:* Cảm biến HTX vọt lên $15,0‰$, nhưng Trạm Quốc gia ($3,6‰$) và Trạm Độc lập ($3,5‰$) bình thường $\rightarrow$ Giá trị trung vị vẫn là $3,6‰$, nguồn HTX bị gắn cờ cảnh báo, chứng minh hệ thống không bị đánh lừa.
  3. *Mất kết nối 2/3 nguồn:* Hệ thống cảnh báo vi phạm điều kiện số lượng nguồn $\rightarrow$ Chuyển sang "Chờ kiểm tra".
  4. *Các nguồn mâu thuẫn:* Độ lệch vượt quá $\pm 15\% \rightarrow$ Chuyển sang "Chờ kiểm tra".

---

### 2.2. Module Công thức Tuyến tính giảm "Hiệu ứng Vách đá" (Mục 4.2.5)
* **Vấn đề giải quyết:** Khắc phục nhược điểm của biểu chi trả bậc thang cứng (Cliff Effect) — nơi $S = 3,99‰$ nhận $0$ đ nhưng $S = 4,00‰$ nhận $50\%$ (chênh lệch $0,01‰$ tạo bước nhảy 30 triệu đồng).
* **Công thức triển khai trong `payout.js` (`tyLeChiTra`):**
  * Với $S < 4,0‰$: Tỷ lệ chi trả $= 0\%$.
  * Với $4,0‰ \le S < 5,5‰$:
    $$\text{Tỷ lệ chi trả} = 50\% + \frac{S - 4,0}{5,5 - 4,0} \times 50\%$$
    *(Ví dụ: $S = 4,75‰ \Rightarrow$ Tỷ lệ chi trả $= 75\%$, thay vì đứng yên ở 50% như biểu bậc thang).*
  * Với $S \ge 5,5‰$: Tỷ lệ chi trả $= 100\%$.
* **Tính năng trên giao diện:** Người dùng có thể chuyển đổi bằng 1 cú nhấp giữa chế độ `Bậc thang` và `Tuyến tính` để quan sát sự thay đổi của thanh thước đo và tổng tiền chi trả mùa vụ.

---

### 2.3. Module Đa kịch bản & Mô phỏng Backtest Mùa vụ (Mục 6.3)
Nhóm đã bổ sung 4 bộ dữ liệu giả định trong `data.js` bên cạnh kịch bản gốc, mô phỏng các hình thái thời tiết cực đoan phục vụ bài toán định phí:

| Mã Kịch bản | Tên hiển thị | Đặc điểm diễn biến mặn | Tổng chi (Bậc thang) | Tổng chi (Tuyến tính) |
| :--- | :--- | :--- | :---: | :---: |
| `minh-hoa` | **Mùa khô minh họa** (Báo cáo mục 5) | Đỉnh mặn tháng 3, vào sâu 40 km | **150 triệu đ** | 168 triệu đ |
| `han-man-2016` | **Giả định kiểu hạn mặn 2015–2016** | Mặn xâm nhập sâu 60 km, 4 trạm vượt ngưỡng | **210 triệu đ** | 226 triệu đ |
| `han-man-2020` | **Giả định kiểu hạn mặn 2019–2020** | Mặn đến sớm, kéo dài, 4 trạm đạt đỉnh | **240 triệu đ** | 240 triệu đ |
| `man-cuc-bo` | **Giả định mặn cục bộ ven biển** | Chỉ Bình Đại bị mặn nặng, nội đồng an toàn | **60 triệu đ** | 60 triệu đ |
| `nam-thuan-loi` | **Giả định năm thủy văn thuận lợi** | Toàn bộ các trạm đều dưới 4,0‰ | **0 đ** | 0 đ |

*(Lưu ý khoa học: Báo cáo ghi rõ các kịch bản 2016, 2020 là số liệu giả định theo mô tả định tính, chưa phải chuỗi số đo quan trắc thực tế).*

---

### 2.4. Module Biên lai Đối soát Ba mắt xích (Mục 4.3.3 & 6.4)
Khi người dùng nhấp chuột vào bất kỳ dòng nào trên cuốn **Sổ chi trả**, một cửa sổ đối soát (Modal) sẽ hiển thị liên thông 3 lớp thông tin:

1. **Thẻ Blockchain (Lớp 3 - Web3):**
   * Minh họa cấu trúc dữ liệu trên chuỗi khối: `Block #`, mã băm giao dịch `Tx Hash`, địa chỉ `Smart Contract`, mã băm điều khoản văn bản `Policy Hash` (đảm bảo chữ và code khớp nhau).
   * Chuỗi số đo đầu vào được ký số điện tử của từng trạm.
2. **Thẻ Ngân hàng (Lớp 4 - Web2):**
   * Minh họa lệnh chi bồi thường bằng **Đồng Việt Nam (VNĐ)** qua Open Banking API / NAPAS tới tài khoản HTX (Agribank/VietinBank).
   * Hiển thị mã tham chiếu ngân hàng `Bank Transaction ID` và mã neo ngược lên chuỗi (On-chain Receipt Anchoring).
   * Khẳng định tính tuân thủ pháp lý: Tuyệt đối không sử dụng token hay tài sản mã hóa để thanh toán (phù hợp Nghị quyết 05/2025/NQ-CP và Luật KDBH 2022).
3. **Thẻ Tin nhắn cho Nông dân (Lớp 1 - Mô hình B2B2C):**
   * Mô phỏng màn hình điện thoại của Chủ nhiệm HTX nhận tin nhắn Zalo OA / SMS thông báo số tiền giải ngân, số tài khoản và mã giao dịch.
   * Chứng minh nông dân không cần kiến thức về Web3 hay ví tiền mã hóa vẫn thụ hưởng quyền lợi nhanh chóng.

---

### 2.5. Module Đối chiếu Định lượng: Cụm trạm vs. "Trung bình Huyện" (Mục 3.1.4)
Bảng đối chiếu ở chân trang tự động tính toán chỉ số trung bình của 5 trạm và so sánh kết quả:
* **Tại kịch bản minh họa:** Chỉ số đỉnh trung bình huyện đạt $4,60‰$ (Mức 2). Nếu chi theo trung bình huyện, cả 5 HTX đều nhận 30 triệu đồng $\rightarrow$ Hai trạm chịu thiệt hại nặng nhất (Bình Đại và Ba Tri) bị **chi thiếu 30 triệu đồng/HTX**, trong khi hai trạm nội đồng an toàn (Giồng Trôm, Chợ Lách) lại được **nhận thừa 30 triệu đồng/HTX**.
* **Tại kịch bản mặn cục bộ ven biển:** Trung bình huyện chỉ đạt $2,96‰ < 4,0‰ \rightarrow$ Chi 0 đồng. Hộ tại Bình Đại mất trắng nhưng **không được bồi thường đồng nào** theo cơ chế truyền thống.
* **Thanh đo thời gian giải ngân:** Trực quan hóa sự vượt trội về thời gian đưa dòng vốn trở lại tái sản xuất:
  * Quy trình giám định truyền thống: **20–35 ngày**.
  * Trần pháp lý Nghị định 346/2026/NĐ-CP: **15 ngày làm việc**.
  * Mục tiêu thiết kế Smart Contract: **3–5 ngày làm việc**.

---

## 3. KẾT QUẢ KIỂM THỬ HỆ THỐNG
* Toàn bộ 28 kịch bản kiểm thử tự động (Unit Tests) trong `payout.js` đều vượt qua (`passed`):
  * 14 kiểm thử gốc: Xếp mức, tính tiền, kiểm tra điểm biên ($3,99‰$, $4,0‰$, $5,49‰$, $5,5‰$), từ chối số âm/NaN, chi phần chênh lệch, không thu hồi khi mặn rút.
  * 14 kiểm thử nâng cấp: Thuật toán trung vị chẵn/lẻ, lọc chữ ký số, tính năng chống đổ muối, xử lý mất kết nối, cơ chế chuyển trạng thái `CHO_KIEM_TRA`, và tính toán tỷ lệ chi trả tuyến tính.
* Cú pháp JavaScript trên `index.html` được kiểm tra độc lập và tương thích mượt mà trên các trình duyệt hiện đại.

---

## 4. KẾT LUẬN
Các nội dung nâng cấp đã hoàn thiện hóa bản Demo từ một giao diện minh họa ý tưởng sơ khai thành một **hệ thống Proof of Concept (PoC) hoàn chỉnh, chặt chẽ về logic kinh tế và tường minh về công nghệ**. Bản demo hiện tại đã sẵn sàng để minh họa trực tiếp mọi câu hỏi chất vấn của hội đồng phản biện liên quan đến Oracle, rủi ro đạo đức, rủi ro cơ sở và cơ chế thanh toán ngân hàng tại Việt Nam.

# MẶN · Demo bảo hiểm lúa theo độ mặn

Bản demo giữa kỳ cho bài tập lớn môn Đổi mới sáng tạo Tài chính. Trang web mô phỏng một hợp đồng bảo hiểm tự chi trả khi độ mặn vượt ngưỡng.

## Cách mở

Mở file `index.html` bằng trình duyệt (Chrome, Edge, Firefox). Không cần cài đặt hay chạy server.

Ba file phải nằm cùng một thư mục:

| File | Nội dung |
| --- | --- |
| `index.html` | Giao diện demo |
| `data.js` | Số liệu độ mặn theo trạm (minh họa) |
| `payout.js` | Logic chi trả, mô phỏng smart contract |

Kiểm tra logic chi trả (cần Node.js):

```bash
node payout.js
```

## Quy tắc chi trả

Theo báo cáo, mục 4.2.2. Đây là ngưỡng minh họa cho lúa, chưa dựa trên số liệu nông học. Số trên demo là chỉ số độ mặn S của vùng trạm (trung bình trượt 72 giờ, mục 4.2.1). Hợp đồng mặc định: 2 ha × 30 triệu đồng/ha = 60 triệu, giống ví dụ ở mục 4.2.3.

| Mức | Độ mặn | Chi trả |
| --- | --- | --- |
| 1 | Dưới 4,0‰ | 0% |
| 2 | 4,0‰ đến dưới 5,5‰ | 50% |
| 3 | Từ 5,5‰ | 100% |

Mỗi vụ, hợp đồng chỉ chi một lần cho mỗi mức. Khi độ mặn tăng từ mức 2 lên mức 3, hợp đồng chỉ chi thêm phần chênh. Khi độ mặn giảm, hợp đồng không thu hồi tiền.

## Kịch bản thuyết trình

Mỗi trạm đo đại diện cho một hợp tác xã có hợp đồng riêng.

1. Bấm **Phát lại mùa khô**. Nước mặn tiến dần từ cửa sông vào nội đồng. Bình Đại và Ba Tri được chi 50% khi mặn qua 4,0‰, rồi chi thêm phần chênh khi qua 5,5‰. Sổ chi trả ghi từng lần chi.
2. Hết mùa, bấm vào trạm **Giồng Trôm** trên dòng sông. Mặn không vượt 4,0‰ nên hợp tác xã này không được chi đồng nào.
3. Dùng ô **Thử một chỉ số khác** để trả lời câu hỏi kiểu "nếu mặn 5,0‰ thì sao".

## Giới hạn

- Số liệu là **minh họa**, không phải số đo thật. Hình dạng mô phỏng một mùa khô: mặn tăng từ tháng 1, đỉnh tháng 3, giảm trong tháng 4.
- Chưa có blockchain. Logic chi trả chạy trên trình duyệt. Khi triển khai, logic này chạy trên blockchain được cấp quyền (mục 4.1.2).
- Oracle trong demo chỉ mô phỏng thuật toán bằng dữ liệu kịch bản, chưa kết nối trạm KTTV hoặc cảm biến IoT thật.
- Chuyển tiền VNĐ qua ngân hàng chỉ được ghi vào nhật ký, không chuyển thật.
- Tên trạm là tên khu vực thuộc Bến Tre cũ (nay thuộc tỉnh Vĩnh Long). Đây không phải tên trạm quan trắc chính thức.

## Giao diện 2.0 (01/11)

- **Phong cách dashboard môi trường – tài chính:** ảnh ruộng lúa làm nền hero, hệ màu xanh nước cửa sông – vàng mặn – đỏ cảnh báo, typography Be Vietnam Pro phân cấp lại và các khu vực dữ liệu được tổ chức lại.
- **Sơ đồ dòng sông:** giữ 5 trạm và ranh mặn 4,0‰ / 5,5‰; bấm vào trạm để đổi vùng đang xem. Trên màn hình nhỏ có thể kéo ngang sơ đồ.
- **Hợp đồng và mô phỏng nhanh:** nhập diện tích, số tiền bảo hiểm/ha, chọn biểu chi trả bậc thang hoặc tuyến tính rồi thử một chỉ số khác.
- **Oracle đa nguồn:** hiển thị ba nguồn đo thành thẻ độc lập. Có thể thử tình huống bình thường, đổ muối vào cảm biến HTX, mất kết nối hai nguồn hoặc các nguồn mâu thuẫn. Thiết kế yêu cầu tối thiểu 3 nguồn độc lập; không đủ nguồn hoặc không đủ đồng thuận thì chuyển sang chờ kiểm tra.
- **Tin nhắn cho HTX:** khung điện thoại hiển thị thông báo khi phát sinh khoản chi hoặc hồ sơ chờ kiểm tra. Bấm vào tin để mở biên lai.
- **Sổ chi trả và kiểm tra tính toàn vẹn:** mỗi bản ghi nối mã băm với bản ghi trước. Trình duyệt có Web Crypto dùng SHA-256; trường hợp không hỗ trợ sẽ dùng FNV-1a cho mục đích minh họa và được ghi nhãn rõ. Nút **Thử sửa một bản ghi cũ** nhân đôi số tiền của lần chi đầu tiên để minh họa chuỗi bị gãy; bấm lại để hoàn tác.
- **Phím tắt khi thuyết trình:** `Space` phát hoặc dừng mùa khô, `←` `→` đổi đợt đang xem, `1`–`5` chọn trạm.
- Font Be Vietnam Pro nằm trong thư mục `font/`, ảnh nằm trong thư mục `anh/`. Mở `index.html` trực tiếp, không cần kết nối mạng.

## Kiểm thử

Chạy `node payout.js` để kiểm tra logic chi trả và Oracle. Bộ kiểm thử hiện có 31 kiểm tra, gồm ngưỡng bậc thang, chi phần chênh, cách tính tuyến tính, nguồn dữ liệu mâu thuẫn và yêu cầu tối thiểu ba nguồn Oracle.

Kịch bản hỏi đáp đề xuất: phát lại mùa khô; chọn Giồng Trôm; thử chỉ số 3,9‰ và 4,0‰; thử tình huống đổ muối vào cảm biến; thử mất kết nối hai nguồn; cuối cùng dùng **Thử sửa một bản ghi cũ** để minh họa khả năng phát hiện thay đổi dữ liệu.

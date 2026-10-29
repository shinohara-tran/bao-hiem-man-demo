# Demo: Bảo hiểm lúa theo độ mặn

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
- Chưa mô phỏng oracle đa nguồn (trung vị, đồng thuận 2/3, trạng thái chờ kiểm tra ở mục 4.3.1).
- Chuyển tiền VNĐ qua ngân hàng chỉ được ghi vào nhật ký, không chuyển thật.
- Tên trạm là tên khu vực thuộc Bến Tre cũ (nay thuộc tỉnh Vĩnh Long). Đây không phải tên trạm quan trắc chính thức.

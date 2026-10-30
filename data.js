// SỐ LIỆU MINH HỌA, không phải số đo thật.
// Hình dạng mô phỏng một mùa khô: mặn tăng dần từ tháng 1, đỉnh tháng 3, giảm trong tháng 4.
// Trạm càng gần cửa sông thì càng mặn. Thay bằng số đo thật khi nhóm có nguồn (cuối kỳ).
// km: khoảng cách tới cửa sông (minh họa), dùng để vẽ sơ đồ dòng sông, không theo bản đồ thật.
const DU_LIEU = {
  mua: 'Mùa khô minh họa',
  ngay: ['06/01', '20/01', '03/02', '17/02', '03/03', '17/03', '31/03', '14/04', '28/04'],
  tram: [
    { id: 'binh-dai', ten: 'Bình Đại', km: 4, doMan: [1.8, 2.9, 4.1, 5.2, 6.4, 7.1, 6.2, 4.4, 2.6] },
    { id: 'ba-tri', ten: 'Ba Tri', km: 13, doMan: [1.5, 2.4, 3.6, 4.5, 5.6, 6.0, 5.1, 3.7, 2.1] },
    { id: 'thanh-phu', ten: 'Thạnh Phú', km: 26, doMan: [1.1, 1.9, 2.8, 3.7, 4.4, 4.9, 4.2, 3.0, 1.6] },
    { id: 'giong-trom', ten: 'Giồng Trôm', km: 47, doMan: [0.6, 1.0, 1.7, 2.4, 3.1, 3.6, 3.2, 2.2, 1.0] },
    { id: 'cho-lach', ten: 'Chợ Lách', km: 72, doMan: [0.2, 0.3, 0.5, 0.8, 1.2, 1.4, 1.1, 0.7, 0.3] },
  ],
};

// Thông tin hợp tác xã thụ hưởng (MINH HỌA, tên và số tài khoản không có thật).
// Dùng cho biên lai đối soát: chỉ mã định danh ẩn danh lên chuỗi, số tài khoản lưu ngoài chuỗi (mục 4.3.2).
const HTX = {
  'binh-dai':   { ten: 'HTX Nông nghiệp Bình Đại (minh họa)',   nganHang: 'Agribank',   taiKhoan: '7300 **** 1021', maTram: 'TR-BD-01', sdt: '09** *** 101' },
  'ba-tri':     { ten: 'HTX Nông nghiệp Ba Tri (minh họa)',     nganHang: 'Agribank',   taiKhoan: '7300 **** 1132', maTram: 'TR-BT-02', sdt: '09** *** 202' },
  'thanh-phu':  { ten: 'HTX Nông nghiệp Thạnh Phú (minh họa)',  nganHang: 'VietinBank', taiKhoan: '1080 **** 2243', maTram: 'TR-TP-03', sdt: '09** *** 303' },
  'giong-trom': { ten: 'HTX Nông nghiệp Giồng Trôm (minh họa)', nganHang: 'VietinBank', taiKhoan: '1080 **** 3354', maTram: 'TR-GT-04', sdt: '09** *** 404' },
  'cho-lach':   { ten: 'HTX Nông nghiệp Chợ Lách (minh họa)',   nganHang: 'MB',         taiKhoan: '0680 **** 4465', maTram: 'TR-CL-05', sdt: '09** *** 505' },
};

// Các kịch bản mùa khô để chạy thử (mục 6.3).
// Chỉ kịch bản đầu khớp báo cáo (Bảng 5.2, 5.3). Các kịch bản còn lại là SỐ LIỆU GIẢ ĐỊNH,
// dựng theo mô tả định tính (mặn vào sâu hơn, đến sớm hơn...), CHƯA PHẢI số đo lịch sử thật.
// Khi có chuỗi số đo năm 2016 và 2020 thì thay vào đúng cấu trúc này.
(function () {
  const meta = DU_LIEU.tram.map(({ id, ten, km }) => ({ id, ten, km }));
  const ghep = (doMan) => meta.map(t => ({ ...t, doMan: doMan[t.id] }));
  const KB = (id, ten, ghiChu, doMan) => ({ id, ten, ghiChu, mua: ten, ngay: DU_LIEU.ngay, tram: ghep(doMan) });

  window.KICH_BAN = [
    { id: 'minh-hoa', ten: 'Mùa khô minh họa (báo cáo mục 5)', ghiChu: 'Số liệu minh họa, khớp Bảng 5.2–5.3 của báo cáo', ...DU_LIEU },
    KB('han-man-2016', 'Giả định kiểu hạn mặn 2015–2016',
      'Số liệu giả định theo kiểu mùa khô 2016 (mặn vào sâu), chưa phải số đo thật', {
        'binh-dai':   [2.5, 4.2, 5.8, 7.5, 8.6, 9.0, 8.1, 6.0, 3.5],
        'ba-tri':     [2.0, 3.4, 4.8, 6.3, 7.4, 7.8, 6.9, 5.0, 2.8],
        'thanh-phu':  [1.5, 2.6, 3.9, 5.1, 6.0, 6.4, 5.5, 3.9, 2.0],
        'giong-trom': [0.9, 1.6, 2.5, 3.5, 4.3, 4.8, 4.0, 2.7, 1.2],
        'cho-lach':   [0.3, 0.6, 1.0, 1.7, 2.4, 2.9, 2.3, 1.4, 0.5],
      }),
    KB('han-man-2020', 'Giả định kiểu hạn mặn 2019–2020',
      'Số liệu giả định theo kiểu mùa khô 2020 (mặn đến sớm, kéo dài), chưa phải số đo thật', {
        'binh-dai':   [4.3, 6.0, 7.6, 8.8, 9.4, 9.1, 8.3, 7.0, 5.2],
        'ba-tri':     [3.6, 5.0, 6.5, 7.6, 8.2, 8.0, 7.2, 5.9, 4.1],
        'thanh-phu':  [2.8, 4.0, 5.3, 6.4, 7.0, 6.8, 6.0, 4.8, 3.0],
        'giong-trom': [1.8, 2.8, 3.9, 4.9, 5.6, 5.4, 4.6, 3.4, 1.9],
        'cho-lach':   [0.8, 1.4, 2.1, 2.9, 3.5, 3.8, 3.2, 2.2, 1.0],
      }),
    KB('man-cuc-bo', 'Giả định mặn cục bộ ven biển',
      'Số liệu giả định: chỉ vùng sát cửa sông bị mặn nặng, minh họa rủi ro cơ sở của "trung bình huyện"', {
        'binh-dai':   [2.0, 3.2, 4.6, 5.9, 6.6, 6.2, 5.0, 3.4, 2.1],
        'ba-tri':     [1.2, 1.9, 2.7, 3.4, 3.8, 3.6, 3.0, 2.1, 1.3],
        'thanh-phu':  [0.8, 1.2, 1.7, 2.2, 2.5, 2.4, 2.0, 1.4, 0.9],
        'giong-trom': [0.4, 0.6, 0.9, 1.2, 1.4, 1.3, 1.1, 0.8, 0.5],
        'cho-lach':   [0.1, 0.2, 0.3, 0.4, 0.5, 0.5, 0.4, 0.3, 0.2],
      }),
    KB('nam-thuan-loi', 'Giả định năm thủy văn thuận lợi',
      'Số liệu giả định: mặn không vượt 4,0‰ ở trạm nào, hợp đồng không chi', {
        'binh-dai':   [1.2, 1.8, 2.4, 3.0, 3.4, 3.5, 2.9, 2.0, 1.3],
        'ba-tri':     [0.9, 1.4, 1.9, 2.4, 2.7, 2.8, 2.3, 1.6, 1.0],
        'thanh-phu':  [0.6, 1.0, 1.4, 1.8, 2.1, 2.2, 1.8, 1.2, 0.7],
        'giong-trom': [0.3, 0.5, 0.8, 1.1, 1.3, 1.4, 1.1, 0.7, 0.4],
        'cho-lach':   [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.5, 0.3, 0.2],
      }),
  ];
})();

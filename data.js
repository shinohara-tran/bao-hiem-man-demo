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

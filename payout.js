// Logic chi trả của hợp đồng bảo hiểm lúa theo độ mặn.
// Mô phỏng đúng việc smart contract sẽ làm: nhận số đo, xếp mức, tính tiền chi.
// Ngưỡng lấy theo sheet nhóm, mục 4.2 (ngưỡng ví dụ, chưa dựa trên số liệu nông học).
(function (root) {
  const MUC = [
    { tu: 0, ten: 'An toàn', tyLe: 0 },
    { tu: 4.0, ten: 'Thiệt hại một phần', tyLe: 0.5 },
    { tu: 5.5, ten: 'Mất trắng', tyLe: 1 },
  ];

  // doMan tính bằng ‰ (g/l).
  function xepMuc(doMan) {
    if (!Number.isFinite(doMan) || doMan < 0) throw new RangeError('Độ mặn không hợp lệ: ' + doMan);
    let i = 0;
    while (i + 1 < MUC.length && doMan >= MUC[i + 1].tu) i++;
    return { bac: i + 1, ten: MUC[i].ten, tyLe: MUC[i].tyLe };
  }

  // Tỷ lệ chi theo cách tính.
  // 'bac'   : biểu bậc thang 0% / 50% / 100% (mục 4.2.2, mặc định).
  // 'tuyen' : tuyến tính trong khoảng 4,0–5,5‰, từ 50% lên 100% (mục 4.2.5: S = 4,75‰ ≈ 75%).
  function tyLeChiTra(doMan, cachTinh = 'bac') {
    const muc = xepMuc(doMan);
    if (cachTinh !== 'tuyen' || muc.bac !== 2) return muc.tyLe;
    const lo = MUC[1].tu, hi = MUC[2].tu;
    return Math.min(1, 0.5 + (doMan - lo) / (hi - lo) * 0.5);
  }

  function payout(doMan, soTienBaoHiem, cachTinh = 'bac') {
    return Math.round(tyLeChiTra(doMan, cachTinh) * soTienBaoHiem);
  }

  // Một hợp đồng cho một vụ: mức tăng thì chỉ chi phần chênh, không bao giờ chi hai lần.
  function taoHopDong({ dienTichHa, soTienMoiHa, cachTinh = 'bac' }) {
    if (!(dienTichHa > 0) || !(soTienMoiHa > 0)) throw new RangeError('Diện tích và số tiền bảo hiểm phải lớn hơn 0');
    const soTienBaoHiem = Math.round(dienTichHa * soTienMoiHa);
    let daTra = 0;
    return {
      soTienBaoHiem,
      cachTinh,
      get daTra() { return daTra; },
      guiSoDo(doMan) {
        const muc = xepMuc(doMan);
        const tyLe = tyLeChiTra(doMan, cachTinh);
        const chiThem = Math.max(0, payout(doMan, soTienBaoHiem, cachTinh) - daTra);
        daTra += chiThem;
        return { muc, tyLe, chiThem, daTra };
      },
    };
  }

  // ---------- Oracle đa nguồn (mục 4.2.1 và 4.3.1) ----------
  // nguon: [{ ten, giaTri, ketNoi, chuKyHopLe }]
  // Bước 1: loại nguồn mất kết nối hoặc sai chữ ký số.
  // Bước 2: lấy trung vị các nguồn hợp lệ.
  // Bước 3: đồng thuận 2/3: cần ít nhất 2/3 tổng số nguồn hợp lệ VÀ nằm trong ±bienDo quanh trung vị.
  // Không đạt thì trả 'CHO_KIEM_TRA' (không tự từ chối, chuyển giám định bổ sung).
  function trungVi(arr) {
    const a = arr.slice().sort((x, y) => x - y), n = a.length;
    if (!n) return NaN;
    return n % 2 ? a[(n - 1) / 2] : (a[n / 2 - 1] + a[n / 2]) / 2;
  }

  function tinhOracleDaNguon(nguon, bienDo = 0.15) {
    const can = Math.ceil(nguon.length * 2 / 3);
    const chiTiet = nguon.map(n => {
      let trangThai = 'hop-le', lyDo = '';
      if (!n.ketNoi) { trangThai = 'loai'; lyDo = 'Mất kết nối'; }
      else if (!n.chuKyHopLe) { trangThai = 'loai'; lyDo = 'Sai chữ ký số'; }
      else if (!Number.isFinite(n.giaTri) || n.giaTri < 0) { trangThai = 'loai'; lyDo = 'Giá trị không hợp lệ'; }
      return { ...n, trangThai, lyDo };
    });
    const hopLe = chiTiet.filter(n => n.trangThai === 'hop-le');
    if (hopLe.length < can) {
      return { trangThai: 'CHO_KIEM_TRA', giaTri: null, chiTiet,
        lyDo: `Chỉ ${hopLe.length}/${nguon.length} nguồn hoạt động, cần tối thiểu ${can}` };
    }
    const tv = trungVi(hopLe.map(n => n.giaTri));
    hopLe.forEach(n => {
      if (Math.abs(n.giaTri - tv) > bienDo * tv) { n.trangThai = 'lech'; n.lyDo = `Lệch quá ±${Math.round(bienDo * 100)}% so với trung vị`; }
    });
    const dongThuan = chiTiet.filter(n => n.trangThai === 'hop-le').length;
    if (dongThuan < can) {
      return { trangThai: 'CHO_KIEM_TRA', giaTri: null, trungVi: tv, chiTiet,
        lyDo: `Chỉ ${dongThuan}/${nguon.length} nguồn đồng thuận, cần tối thiểu ${can}` };
    }
    return { trangThai: 'HOP_LE', giaTri: Math.round(tv * 100) / 100, trungVi: tv, chiTiet,
      lyDo: `${dongThuan}/${nguon.length} nguồn đồng thuận` };
  }

  const api = { MUC, xepMuc, tyLeChiTra, payout, taoHopDong, trungVi, tinhOracleDaNguon };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.BaoHiem = api;

  // Tự kiểm tra: chạy `node payout.js`.
  if (typeof require !== 'undefined' && typeof module !== 'undefined' && require.main === module) {
    const assert = require('assert');
    let soKiemTra = 0;
    const kt = (f) => { f(); soKiemTra++; };

    // --- 14 kiểm tra gốc (báo cáo mục 5.3) ---
    kt(() => assert.strictEqual(xepMuc(0).bac, 1));
    kt(() => assert.strictEqual(xepMuc(3.99).bac, 1));
    kt(() => assert.strictEqual(xepMuc(4.0).bac, 2));
    kt(() => assert.strictEqual(xepMuc(5.49).bac, 2));
    kt(() => assert.strictEqual(xepMuc(5.5).bac, 3));
    kt(() => assert.strictEqual(payout(4.6, 10000000), 5000000));
    kt(() => assert.throws(() => xepMuc(-1)));
    kt(() => assert.throws(() => xepMuc(NaN)));

    const hd = taoHopDong({ dienTichHa: 2, soTienMoiHa: 10000000 });
    kt(() => assert.strictEqual(hd.guiSoDo(3.2).chiThem, 0));
    kt(() => assert.strictEqual(hd.guiSoDo(4.5).chiThem, 10000000)); // lên mức 2: chi 50%
    kt(() => assert.strictEqual(hd.guiSoDo(4.8).chiThem, 0));        // vẫn mức 2: không chi lặp
    kt(() => assert.strictEqual(hd.guiSoDo(6.1).chiThem, 10000000)); // lên mức 3: chi phần chênh
    kt(() => assert.strictEqual(hd.guiSoDo(3.0).chiThem, 0));        // mặn giảm: không thu hồi, không chi thêm
    kt(() => assert.strictEqual(hd.daTra, 20000000));

    // --- Cách tính tuyến tính (mục 4.2.5) ---
    kt(() => assert.strictEqual(tyLeChiTra(3.99, 'tuyen'), 0));
    kt(() => assert.strictEqual(tyLeChiTra(4.0, 'tuyen'), 0.5));
    kt(() => assert.strictEqual(payout(4.75, 60000000, 'tuyen'), 45000000)); // 75%
    kt(() => assert.strictEqual(tyLeChiTra(5.5, 'tuyen'), 1));
    const hdT = taoHopDong({ dienTichHa: 2, soTienMoiHa: 30000000, cachTinh: 'tuyen' });
    kt(() => assert.strictEqual(hdT.guiSoDo(4.75).chiThem, 45000000));
    kt(() => assert.strictEqual(hdT.guiSoDo(5.5).chiThem, 15000000));  // chỉ chi phần chênh
    kt(() => assert.strictEqual(hdT.guiSoDo(4.2).chiThem, 0));         // giảm: không thu hồi

    // --- Oracle đa nguồn (mục 4.3.1) ---
    const N = (a, b, c) => [a, b, c].map((v, i) => ({ ten: 'N' + i, giaTri: v, ketNoi: true, chuKyHopLe: true }));
    kt(() => assert.strictEqual(trungVi([3, 1, 2]), 2));
    kt(() => assert.strictEqual(trungVi([1, 2, 3, 4]), 2.5));
    kt(() => { const r = tinhOracleDaNguon(N(3.6, 3.7, 3.5)); assert.strictEqual(r.trangThai, 'HOP_LE'); assert.strictEqual(r.giaTri, 3.6); });
    // đổ muối vào một cảm biến: trung vị không bị kéo lệch, nguồn bị gắn cờ
    kt(() => { const r = tinhOracleDaNguon(N(3.6, 15, 3.5)); assert.strictEqual(r.trangThai, 'HOP_LE'); assert.strictEqual(r.giaTri, 3.6); assert.strictEqual(r.chiTiet[1].trangThai, 'lech'); });
    // các nguồn mâu thuẫn: chờ kiểm tra
    kt(() => assert.strictEqual(tinhOracleDaNguon(N(3.0, 4.5, 6.0)).trangThai, 'CHO_KIEM_TRA'));
    // mất kết nối 2/3 nguồn: chờ kiểm tra
    kt(() => { const n = N(3.6, 3.7, 3.5); n[1].ketNoi = false; n[2].ketNoi = false; assert.strictEqual(tinhOracleDaNguon(n).trangThai, 'CHO_KIEM_TRA'); });
    // sai chữ ký số một nguồn: vẫn đủ 2/3
    kt(() => { const n = N(4.6, 4.7, 9.9); n[2].chuKyHopLe = false; const r = tinhOracleDaNguon(n); assert.strictEqual(r.trangThai, 'HOP_LE'); assert.strictEqual(r.giaTri, 4.65); });

    console.log(`payout.js: tất cả ${soKiemTra} kiểm tra đều đạt`);
  }
})(this);

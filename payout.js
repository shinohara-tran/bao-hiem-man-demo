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

  function payout(doMan, soTienBaoHiem) {
    return Math.round(xepMuc(doMan).tyLe * soTienBaoHiem);
  }

  // Một hợp đồng cho một vụ: mức tăng thì chỉ chi phần chênh, không bao giờ chi hai lần.
  function taoHopDong({ dienTichHa, soTienMoiHa }) {
    if (!(dienTichHa > 0) || !(soTienMoiHa > 0)) throw new RangeError('Diện tích và số tiền bảo hiểm phải lớn hơn 0');
    const soTienBaoHiem = Math.round(dienTichHa * soTienMoiHa);
    let daTra = 0;
    return {
      soTienBaoHiem,
      get daTra() { return daTra; },
      guiSoDo(doMan) {
        const muc = xepMuc(doMan);
        const chiThem = Math.max(0, payout(doMan, soTienBaoHiem) - daTra);
        daTra += chiThem;
        return { muc, chiThem, daTra };
      },
    };
  }

  const api = { MUC, xepMuc, payout, taoHopDong };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.BaoHiem = api;

  // Tự kiểm tra: chạy `node payout.js`.
  if (typeof require !== 'undefined' && typeof module !== 'undefined' && require.main === module) {
    const assert = require('assert');
    assert.strictEqual(xepMuc(0).bac, 1);
    assert.strictEqual(xepMuc(3.99).bac, 1);
    assert.strictEqual(xepMuc(4.0).bac, 2);
    assert.strictEqual(xepMuc(5.49).bac, 2);
    assert.strictEqual(xepMuc(5.5).bac, 3);
    assert.strictEqual(payout(4.6, 10000000), 5000000);
    assert.throws(() => xepMuc(-1));
    assert.throws(() => xepMuc(NaN));

    const hd = taoHopDong({ dienTichHa: 2, soTienMoiHa: 10000000 });
    assert.strictEqual(hd.guiSoDo(3.2).chiThem, 0);
    assert.strictEqual(hd.guiSoDo(4.5).chiThem, 10000000); // lên mức 2: chi 50%
    assert.strictEqual(hd.guiSoDo(4.8).chiThem, 0);        // vẫn mức 2: không chi lặp
    assert.strictEqual(hd.guiSoDo(6.1).chiThem, 10000000); // lên mức 3: chi phần chênh
    assert.strictEqual(hd.guiSoDo(3.0).chiThem, 0);        // mặn giảm: không thu hồi, không chi thêm
    assert.strictEqual(hd.daTra, 20000000);
    console.log('payout.js: tất cả kiểm tra đều đạt');
  }
})(this);

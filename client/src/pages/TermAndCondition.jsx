export const TermAndCondition = () => {
  return (
    <div className="bg-white min-h-screen flex flex-col font-['Prompt']">
      {/* Navbar Container (นำคอมโพเนนต์ Navbar ของคุณมาใส่ตรงนี้) */}
      <header id="navbar-container"></header>

      {/* Wrapper สำหรับจัดเนื้อหาให้อยู่กึ่งกลางหน้าจอ */}
      <div className="w-full flex-1 flex justify-center items-center px-4">
        <main className="w-full max-w-4xl py-8 sm:py-10 text-left">
          {/* Header */}
          <header className="mb-8 border-b border-gray-200 pb-6 text-center sm:text-left">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              ข้อกำหนดและเงื่อนไขการใช้บริการ
            </h1>
            <p className="text-xs sm:text-sm text-gray-500">
              บริษัท ยูนิโคล่ (ประเทศไทย) จำกัด &bull; อัปเดตล่าสุด:{" "}
              <span className="font-medium text-gray-700">9 กรกฎาคม 2567</span>
            </p>
          </header>

          {/* Notice Box */}
          <div className="bg-amber-50/80 border-l-4 border-amber-500 p-4 rounded-r-lg mb-8 text-sm text-amber-900">
            <p className="font-medium mb-1">ข้อตกลงสำคัญ</p>
            <p className="text-xs sm:text-sm leading-relaxed text-amber-800">
              โปรดอ่านข้อกำหนดและเงื่อนไขเหล่านี้อย่างละเอียดก่อนใช้งานเว็บไซต์หรือแอปพลิเคชัน
              การเข้าถึงหรือใช้งานบริการถือว่าท่านยอมรับและตกลงที่จะผูกพันตามข้อกำหนดและเงื่อนไขทั้งหมดนี้
            </p>
          </div>

          {/* Quick Navigation Bar */}
          <nav className="bg-gray-50 p-4 rounded-xl border border-gray-200 mb-10">
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3 flex items-center gap-1.5">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h7"
                ></path>
              </svg>
              สารบัญหัวข้อ
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs sm:text-sm text-blue-600 font-medium">
              <a
                href="#sec-1"
                className="hover:underline hover:text-blue-800 transition"
              >
                1. ข้อกำหนดทั่วไป
              </a>
              <a
                href="#sec-2"
                className="hover:underline hover:text-blue-800 transition"
              >
                2. การลงทะเบียนบัญชี
              </a>
              <a
                href="#sec-3"
                className="hover:underline hover:text-blue-800 transition"
              >
                3. การสั่งซื้อและชำระเงิน
              </a>
              <a
                href="#sec-4"
                className="hover:underline hover:text-blue-800 transition"
              >
                4. การจัดส่งและการรับสินค้า
              </a>
              <a
                href="#sec-5"
                className="hover:underline hover:text-blue-800 transition"
              >
                5. การยกเลิกและคืนสินค้า
              </a>
              <a
                href="#sec-6"
                className="hover:underline hover:text-blue-800 transition"
              >
                6. ทรัพย์สินทางปัญญา
              </a>
              <a
                href="#sec-7"
                className="hover:underline hover:text-blue-800 transition"
              >
                7. ข้อจำกัดความรับผิด
              </a>
              <a
                href="#sec-8"
                className="hover:underline hover:text-blue-800 transition"
              >
                8. การแก้ไขและการยกเลิก
              </a>
              <a
                href="#sec-9"
                className="hover:underline hover:text-blue-800 transition"
              >
                9. กฎหมายบังคับใช้
              </a>
            </div>
          </nav>

          {/* Content Sections */}
          <div className="space-y-10 text-gray-700 text-sm leading-relaxed">
            {/* Section 1 */}
            <section id="sec-1" className="scroll-mt-20">
              <h2 className="text-lg font-bold text-gray-900 border-b border-gray-200 pb-2 mb-3">
                1. ข้อกำหนดทั่วไป
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 mb-3">
                เว็บไซต์และแอปพลิเคชันนี้ดำเนินการโดย บริษัท ออคเคชัน
                (ประเทศไทย) จำกัด ("บริษัท") ข้อกำหนดนี้ใช้สำหรับการเข้าชม
                ซื้อสินค้า และใช้งานบริการทุกรูปแบบผ่านช่องทางออนไลน์ของบริษัท
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <span className="font-semibold text-gray-900 block mb-0.5">
                    การยอมรับข้อตกลง
                  </span>
                  <span className="text-gray-600">
                    หากท่านไม่ยอมรับเงื่อนไขนี้
                    โปรดหยุดการใช้งานเว็บไซต์หรือบริการทันที
                  </span>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <span className="font-semibold text-gray-900 block mb-0.5">
                    คุณสมบัติผู้ใช้
                  </span>
                  <span className="text-gray-600">
                    ผู้ใช้งานต้องมีอายุบรรลุนิติภาวะ
                    หรือได้รับความยินยอมจากผู้ปกครองตามกฎหมาย
                  </span>
                </div>
              </div>
            </section>

            {/* Section 2 */}
            <section id="sec-2" className="scroll-mt-20">
              <h2 className="text-lg font-bold text-gray-900 border-b border-gray-200 pb-2 mb-3">
                2. การลงทะเบียนและการดูแลรักษาบัญชี
              </h2>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm list-disc pl-4 text-gray-600">
                <li>
                  ท่านต้องให้ข้อมูลที่ถูกต้อง ครบถ้วน
                  และเป็นจริงในการลงทะเบียนบัญชี
                </li>
                <li>
                  ท่านมีหน้าที่รับผิดชอบในการเก็บรักษาความลับของชื่อผู้ใช้และรหัสผ่าน
                </li>
                <li>
                  กิจกรรมทั้งหมดที่เกิดขึ้นภายใต้บัญชีของท่าน
                  ถือเป็นความรับผิดชอบของท่านเอง
                </li>
                <li>
                  หากพบการเข้าถึงบัญชีโดยไม่ได้รับอนุญาต
                  ต้องแจ้งให้บริษัททราบทันที
                </li>
              </ul>
            </section>

            {/* Section 3 */}
            <section id="sec-3" className="scroll-mt-20">
              <h2 className="text-lg font-bold text-gray-900 border-b border-gray-200 pb-2 mb-3">
                3. การสั่งซื้อ สินค้า และการชำระเงิน
              </h2>
              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="w-full text-xs sm:text-sm text-left">
                  <thead className="bg-gray-100 text-gray-900 font-semibold border-b border-gray-200">
                    <tr>
                      <th className="px-3 py-2 w-1/3">หัวข้อ</th>
                      <th className="px-3 py-2">รายละเอียด</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white text-gray-600">
                    <tr>
                      <td className="px-3 py-2 font-medium text-gray-900">
                        การสมบูรณ์ของคำสั่งซื้อ
                      </td>
                      <td className="px-3 py-2">
                        คำสั่งซื้อจะสมบูรณ์เมื่อบริษัทได้ยืนยันการรับชำระเงินและส่งอีเมลยืนยันคำสั่งซื้อแล้ว
                      </td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2 font-medium text-gray-900">
                        ราคาสินค้าและภาษี
                      </td>
                      <td className="px-3 py-2">
                        ราคาสินค้ารวมภาษีมูลค่าเพิ่ม (VAT) แล้ว
                        ทั้งนี้อาจมีค่าจัดส่งเพิ่มเติมตามที่ระบุไว้ในขั้นตอนชำระเงิน
                      </td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2 font-medium text-gray-900">
                        ช่องทางการชำระเงิน
                      </td>
                      <td className="px-3 py-2">
                        รองรับบัตรเครดิต/เดบิต, QR PromptPay, บัญชีธนาคาร
                        และช่องทางชำระเงินพันธมิตรที่ได้รับอนุมัติ
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* Section 4 */}
            <section id="sec-4" className="scroll-mt-20">
              <h2 className="text-lg font-bold text-gray-900 border-b border-gray-200 pb-2 mb-3">
                4. การจัดส่งและการรับสินค้า
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
                <div className="p-3.5 bg-white border border-gray-200 rounded-lg shadow-2xs">
                  <span className="inline-block px-2 py-0.5 rounded text-xs font-semibold bg-blue-100 text-blue-800 mb-1.5">
                    ระยะเวลาจัดส่ง
                  </span>
                  <p className="text-gray-600">
                    บริษัทจะจัดส่งตามที่อยู่ที่ระบุไว้
                    ระยะเวลาจัดส่งขึ้นอยู่กับพื้นที่และบริการขนส่งที่เลือก
                  </p>
                </div>
                <div className="p-3.5 bg-white border border-gray-200 rounded-lg shadow-2xs">
                  <span className="inline-block px-2 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-800 mb-1.5">
                    ความเสี่ยงและกรรมสิทธิ์
                  </span>
                  <p className="text-gray-600">
                    ความเสี่ยงในสูญหายหรือเสียหายของสินค้าจะตกเป็นของผู้ซื้อทันทีเมื่อจัดส่งสำเร็จ
                  </p>
                </div>
              </div>
            </section>

            {/* Section 5 */}
            <section id="sec-5" className="scroll-mt-20">
              <h2 className="text-lg font-bold text-gray-900 border-b border-gray-200 pb-2 mb-3">
                5. นโยบายการคืนสินค้าและการคืนเงิน
              </h2>
              <p className="text-gray-600 mb-2">
                ท่านสามารถแจ้งขอเปลี่ยนหรือคืนสินค้าได้ตามเงื่อนไขของนโยบายการเปลี่ยนคืนสินค้าภายในระยะเวลาที่กำหนด
                (เช่น ภายใน 14 วันนับจากวันที่ได้รับสินค้า)
                สินค้าต้องอยู่ในสภาพสมบูรณ์ ไม่ผ่านการซัก
                ป้ายสินค้าและบรรจุภัณฑ์ยังอยู่ครบถ้วน
              </p>
              <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 p-4 rounded-lg mt-2 ">
                <strong>* ข้อยกเว้น:</strong> สินค้าบางกลุ่ม เช่น ชุดชั้นใน
                ถุงเท้า หรือสินค้าลดราคาพิเศษ
                อาจไม่สามารถเปลี่ยน/คืนได้ตามที่ระบุไว้เฉพาะรายการ
              </p>
            </section>

            {/* Section 6 */}
            <section id="sec-6" className="scroll-mt-20">
              <h2 className="text-lg font-bold text-gray-900 border-b border-gray-200 pb-2 mb-3">
                6. สิทธิในทรัพย์สินทางปัญญา
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 mb-3">
                เนื้อหา ข้อความ รูปภาพ โลโก้ เครื่องหมายการค้า ซอฟต์แวร์
                และส่วนประกอบทั้งหมดบนเว็บไซต์เป็นทรัพย์สินทางปัญญาของบริษัทหรือผู้ได้รับอนุญาต
                ห้ามทำซ้ำ ดัดแปลง เผยแพร่
                หรือนำไปใช้เพื่อการค้าโดยไม่ได้รับอนุญาตเป็นลายลักษณ์อักษร
              </p>
            </section>

            {/* Section 7 */}
            <section id="sec-7" className="scroll-mt-20">
              <h2 className="text-lg font-bold text-gray-900 border-b border-gray-200 pb-2 mb-3">
                7. ข้อจำกัดความรับผิด
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <strong className="text-gray-900 block mb-1">
                    ขอบเขตความรับผิดชอบ
                  </strong>
                  <p className="text-gray-600">
                    บริษัทจะไม่รับผิดชอบต่อความเสียหายทางอ้อม ความเสียหายพิเศษ
                    หรือผลกระทบจากการใช้บริการเกินกว่ามูลค่าสินค้าที่สั่งซื้อ
                  </p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <strong className="text-gray-900 block mb-1">
                    เหตุสุดวิสัย
                  </strong>
                  <p className="text-gray-600">
                    บริษัทไม่ต้องรับผิดต่อความล่าช้าหรือการไม่สามารถปฏิบัติตามสัญญาอันเนื่องมาจากเหตุสุดวิสัยหรือภัยธรรมชาติ
                  </p>
                </div>
              </div>
            </section>

            {/* Section 8 */}
            <section id="sec-8" className="scroll-mt-20">
              <h2 className="text-lg font-bold text-gray-900 border-b border-gray-200 pb-2 mb-3">
                8. การแก้ไขเงื่อนไขและการระงับการใช้งาน
              </h2>
              <ul className="list-disc pl-4 text-xs sm:text-sm text-gray-600 space-y-1">
                <li>
                  บริษัทขอสงวนสิทธิ์ในการแก้ไขหรือปรับปรุงข้อกำหนดนี้ได้ทุกเมื่อ
                  โดยจะแจ้งให้ทราบผ่านหน้าเว็บไซต์
                </li>
                <li>
                  บริษัทมีสิทธิระงับหรือยกเลิกบัญชีผู้ใช้งานทันทีหากพบว่ามีการละเมิดข้อกำหนดหรือกระทำการทุจริต
                </li>
              </ul>
            </section>

            {/* Section 9 */}
            <section id="sec-9" className="scroll-mt-20">
              <h2 className="text-lg font-bold text-gray-900 border-b border-gray-200 pb-2 mb-3">
                9. กฎหมายที่ใช้บังคับและการติดต่อ
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 mb-3">
                ข้อกำหนดและเงื่อนไขนี้อยู่ภายใต้บังคับและการตีความตามกฎหมายแห่งราชอาณาจักรไทย
              </p>
              <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-2xs">
                <h3 className="font-bold text-gray-900 mb-1">
                  สอบถามข้อมูลเพิ่มเติมเกี่ยวกับข้อกำหนดการใช้งาน
                </h3>
                <p className="text-gray-500 mb-2 text-xs">
                  บริษัท ยูนิโคล่ (ประเทศไทย) จำกัด &bull; อาคารมิตรทาวน์ ออฟฟิศ
                  ทาวเวอร์ ชั้น 18 ถ.พระราม 4 แขวงวังใหม่ เขตปทุมวัน กทม. 10330
                </p>
                <p className="text-xs">
                  <strong>Email:</strong>{" "}
                  <a
                    href="mailto:customerservice@uniqlo.co.th"
                    className="text-blue-600 underline"
                  >
                    customerservice@uniqlo.co.th
                  </a>{" "}
                  | <strong>Tel:</strong> 1800-013-640
                </p>
              </div>
            </section>
          </div>
        </main>
      </div>

      {/* Footer Container (นำคอมโพเนนต์ Footer ของคุณมาใส่ตรงนี้) */}
      <div id="footer-container"></div>
    </div>
  );
};

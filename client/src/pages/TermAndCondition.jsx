export const TermAndCondition = () => {
  return (
    <div className="bg-white min-h-screen flex flex-col">
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
              บริษัท ออกเคชั่น (ประเทศไทย) จำกัด &bull; อัปเดตล่าสุด{" "}
              <span className="font-medium text-gray-700">30 กรกฎาคม 2569</span>
            </p>
          </header>

          {/* Notice Box */}
          <div className="bg-amber-50/80 border-l-4 border-amber-500 p-4 rounded-r-lg mb-8 text-sm text-amber-900">
            <p className="font-medium mb-1">ข้อตกลงสำคัญ</p>
            <p className="text-xs sm:text-sm leading-relaxed text-amber-800">
              โปรดอ่านข้อกำหนดและเงื่อนไขเหล่านี้อย่างละเอียดก่อนใช้งานเว็บไซต์หรือแพลตฟอร์มของเรา
              การเข้าถึงหรือใช้บริการใด ๆ
              ถือว่าท่านยอมรับและตกลงที่จะปฏิบัติตามข้อกำหนดทั้งหมดนี้โดยเงื่อนไข
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
                เว็บไซต์และแพลตฟอร์มนี้ดำเนินการโดย บริษัท ออกเคชั่น (ประเทศไทย)
                จำกัด ("บริษัท") ข้อกำหนดนี้ใช้ควบคุมการเข้าชม การทำธุรกรรม
                และการใช้บริการดิจิทัลทุกประเภทของบริษัท
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <span className="font-semibold text-gray-900 block mb-0.5">
                    การยอมรับข้อตกลง
                  </span>
                  <span className="text-gray-600">
                    หากท่านไม่เห็นด้วยกับเงื่อนไขข้อใดข้อหนึ่ง
                    โปรดระงับการใช้งานแพลตฟอร์มนี้ในทันที
                  </span>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <span className="font-semibold text-gray-900 block mb-0.5">
                    คุณสมบัติผู้ใช้
                  </span>
                  <span className="text-gray-600">
                    ผู้ใช้งานต้องมีอายุไม่ต่ำกว่า 18 ปีบริบูรณ์
                    หรือได้รับความยินยอมจากผู้แทนโดยชอบธรรม
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
                  ผู้ใช้ต้องให้ข้อมูลส่วนบุคคลที่ถูกต้อง เป็นปัจจุบัน
                  และครบถ้วนในการสมัครสมาชิก
                </li>
                <li>
                  ท่านต้องเก็บรักษาข้อมูลรหัสผ่านและชื่อบัญชีผู้ใช้เป็นความลับอย่างเคร่งครัด
                </li>
                <li>
                  ทุกกิจกรรมที่เกิดขึ้นภายใต้บัญชีของท่าน ถือเป็นการกระทำ100%
                  จากตัวท่านเอง
                </li>
                <li>
                  หากตรวจพบการเข้าใช้งานโดยไม่ได้รับอนุญาต
                  ท่านต้องรีบแจ้งทีมงานเพื่อระงับบัญชีทันที
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
                        การยืนยันคำสั่งซื้อ
                      </td>
                      <td className="px-3 py-2">
                        คำสั่งซื้อจะถือว่าเสร็จสมบูรณ์เมื่อระบบออกหมายเลขคำสั่งซื้อ
                        (Order ID)
                        และการชำระเงินได้รับการตรวจสอบความถูกต้องแล้วเท่านั้น
                      </td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2 font-medium text-gray-900">
                        ราคาและภาษี
                      </td>
                      <td className="px-3 py-2">
                        ราคาสินค้าทุกรายการแสดงผลเป็นสกุลเงินบาท
                        และได้รวมภาษีมูลค่าเพิ่ม (VAT) ไว้แล้ว
                        ยกเว้นค่าบริการเสริมอื่น ๆ
                      </td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2 font-medium text-gray-900">
                        ช่องทางชำระเงิน
                      </td>
                      <td className="px-3 py-2">
                        รองรับการชำระผ่านโมบายแบงก์กิ้ง, พร้อมเพย์ (PromptPay),
                        บัตรเครดิต/เดบิตชั้นนำ และกระเปเงินดิจิทัลที่บริษัทกำหนด
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
                    รอบการจัดส่ง
                  </span>
                  <p className="text-gray-600">
                    บริษัทดำเนินการจัดส่งสินค้าผ่านผู้ให้บริการขนส่งเอกชน
                    ระยะเวลาอาจเปลี่ยนแปลงตามพื้นที่ปลายทางและวันหยุดนักขัตฤกษ์
                  </p>
                </div>
                <div className="p-3.5 bg-white border border-gray-200 rounded-lg shadow-2xs">
                  <span className="inline-block px-2 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-800 mb-1.5">
                    การตรวจรับสินค้า
                  </span>
                  <p className="text-gray-600">
                    ผู้รับสินค้าควรตรวจสอบสภาพพัสดุและกล่องบรรจุภัณฑ์เบื้องต้นก่อนลงนามรับของ
                    เพื่อรักษาสิทธิ์ในการเคลมสินค้า
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
                ท่านสามารถยื่นคำร้องขอคืนสินค้าหรือเปลี่ยนสินค้าได้ภายใน 7
                วันทำการ นับจากวันที่ได้รับพัสดุ โดยสินค้าต้องอยู่ในสภาพเดิม
                ป้ายสินค้าไม่ถูกตัดออก
                และมีหลักฐานวิดีโอขณะเปิดกล่องพัสดุอย่างชัดเจน
              </p>
              <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 p-4 rounded-lg mt-2 ">
                <strong>ข้อกำหนดเพิ่มเติม</strong> สินค้าประเภทดิจิทัล
                สินค้าสั่งทำพิเศษ (Made-to-order)
                หรือสินค้าจัดรายการลดราคาล้างสต็อก
                จะไม่สามารถขอคืนเงินหรือเปลี่ยนคืนได้ทุกกรณี
              </p>
            </section>

            {/* Section 6 */}
            <section id="sec-6" className="scroll-mt-20">
              <h2 className="text-lg font-bold text-gray-900 border-b border-gray-200 pb-2 mb-3">
                6. สิทธิในทรัพย์สินทางปัญญา
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 mb-3">
                กราฟิก โลโก้ ข้อความ ส่วนติดต่อผู้ใช้ (UI)
                และซอร์ฟแวร์ทั้งหมดบนเว็บไซต์
                ถือเป็นลิขสิทธิ์และทรัพย์สินทางปัญญาของบริษัท ออกเคชั่น
                (ประเทศไทย) จำกัด แต่เพียงผู้เดียว ห้ามมิให้บุคคลอื่นนำไปคัดลอก
                ดัดแปลง หรือเผยแพร่ต่อสาธารณชนโดยไม่ได้รับอนุญาต
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
                    ขอบเขตความเสียหาย
                  </strong>
                  <p className="text-gray-600">
                    บริษัทขอสงวนสิทธิ์ในการจำกัดความรับผิดชอบต่อความเสียหายทางการเงิน
                    โดยจะไม่เกินมูลค่ารวมของสินค้าที่ท่านได้ชำระจริงในคำสั่งซื้อนั้น
                    ๆ
                  </p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <strong className="text-gray-900 block mb-1">
                    เหตุขัดข้องทางเทคนิค
                  </strong>
                  <p className="text-gray-600">
                    บริษัทไม่ต้องรับผิดชอบต่อความเสียหายอันเนื่องมาจากความขัดข้องของอินเทอร์เน็ต
                    ระบบเซิร์ฟเวอร์ล่ม หรือเหตุสุดวิสัยภายนอกการควบคุม
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
                  บริษัทสามารถเปลี่ยนแปลง ปรับปรุง
                  หรือเพิ่มเติมข้อกำหนดเหล่านี้ได้ทุกเวลา
                  โดยจะมีผลบังคับใช้ทันทีเมื่อประกาศผ่านหน้าเว็บไซต์
                </li>
                <li>
                  บริษัทมีสิทธิ์เด็ดขาดในการระงับ ปิดกั้น
                  หรือยกเลิกบัญชีผู้ใช้งาน หากพบพฤติกรรมเข้าข่ายฉ้อโกง
                  ละเมิดสิทธิ์ หรือทำลายระบบ
                </li>
              </ul>
            </section>

            {/* Section 9 */}
            <section id="sec-9" className="scroll-mt-20">
              <h2 className="text-lg font-bold text-gray-900 border-b border-gray-200 pb-2 mb-3">
                9. กฎหมายที่ใช้บังคับและการติดต่อ
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 mb-3">
                เงื่อนไขการใช้บริการทั้งหมดนี้
                อยู่ภายใต้การตีความและบังคับใช้ตามกฎหมายแห่งราชอาณาจักรไทย
              </p>
              <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-2xs">
                <h3 className="font-bold text-gray-900 mb-1">
                  ช่องทางการติดต่อฝ่ายบริการลูกค้า (Occasion Support)
                </h3>
                <p className="text-gray-500 mb-2 text-xs">
                  บริษัท ออกเคชั่น (ประเทศไทย) จำกัด &bull;
                  อาคารสำนักงานออกเคชั่น ชั้น 10 ถนนสุขุมวิท แขวงคลองเตย
                  เขตคลองเตย กรุงเทพฯ 10110
                </p>
                <p className="text-xs">
                  <strong>Email:</strong>{" "}
                  <a
                    href="mailto:support@occasion.co.th"
                    className="text-blue-600 underline"
                  >
                    support@occasion.co.th
                  </a>{" "}
                  | <strong>Tel:</strong> 02-123-4567
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

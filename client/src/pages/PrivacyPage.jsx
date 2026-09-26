export default function PrivacyPolicy() {
  return (
    <div className="bg-white min-h-screen flex flex-col">
      {/* Navbar Container (หากมีคอมโพเนนต์ Navbar สามารถใส่แทนที่ตรงนี้ได้) */}
      <header id="navbar-container"></header>

      {/* Wrapper สำหรับจัดเนื้อหาอยู่กึ่งกลางหน้าจอ */}
      <div className="w-full flex-1 flex justify-center items-center px-4">
        <main className="w-full max-w-4xl py-8 sm:py-10 text-left">
          {/* Header */}
          <header className="mb-8 border-b border-gray-200 pb-6 text-center sm:text-left">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              นโยบายความเป็นส่วนตัว
            </h1>
            <p className="text-xs sm:text-sm text-gray-500">
              บริษัท ออคเคชัน (ประเทศไทย) จำกัด &bull; อัปเดตล่าสุด{" "}
              <span className="font-medium text-gray-700">9 กรกฎาคม 2567</span>
            </p>
          </header>

          {/* Notice Box */}
          <div className="bg-blue-50/80 border-l-4 border-blue-600 p-4 rounded-r-lg mb-8 text-sm text-blue-900">
            <p className="font-medium mb-1">เรียน ลูกค้าและคู่ค้า</p>
            <p className="text-xs sm:text-sm leading-relaxed text-blue-800">
              เราให้ความสำคัญกับการคุ้มครองข้อมูลส่วนบุคคลของท่านตาม พ.ร.บ.
              คุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562 (PDPA) นโยบายนี้อธิบายถึงการเก็บ
              รวบรวม ใช้ และเปิดเผยข้อมูลของท่าน
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
                1. คำนิยาม
              </a>
              <a
                href="#sec-2"
                className="hover:underline hover:text-blue-800 transition"
              >
                2. สัญญาของเรา
              </a>
              <a
                href="#sec-3"
                className="hover:underline hover:text-blue-800 transition"
              >
                3. ข้อมูลที่เก็บรวบรวม
              </a>
              <a
                href="#sec-4"
                className="hover:underline hover:text-blue-800 transition"
              >
                4. วัตถุประสงค์
              </a>
              <a
                href="#sec-5"
                className="hover:underline hover:text-blue-800 transition"
              >
                5. การเปิดเผยข้อมูล
              </a>
              <a
                href="#sec-6"
                className="hover:underline hover:text-blue-800 transition"
              >
                6. สิทธิของท่าน
              </a>
              <a
                href="#sec-7"
                className="hover:underline hover:text-blue-800 transition"
              >
                7. การติดต่อ / DPO
              </a>
              <a
                href="#sec-8"
                className="hover:underline hover:text-blue-800 transition"
              >
                8. ความปลอดภัย & คุกกี้
              </a>
              <a
                href="#sec-9"
                className="hover:underline hover:text-blue-800 transition"
              >
                9. เงื่อนไขอื่น ๆ
              </a>
            </div>
          </nav>

          {/* Content Sections */}
          <div className="space-y-10 text-gray-700 text-sm leading-relaxed">
            {/* Section 1 */}
            <section id="sec-1" className="scroll-mt-20">
              <h2 className="text-lg font-bold text-gray-900 border-b border-gray-200 pb-2 mb-3">
                1. คำนิยาม
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <span className="font-semibold text-gray-900 block mb-0.5">
                    ลูกค้า
                  </span>
                  <span className="text-gray-600">
                    ผู้ซื้อหรือใช้บริการผ่านหน้าร้าน เว็บไซต์ หรือแอปพลิเคชัน
                  </span>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <span className="font-semibold text-gray-900 block mb-0.5">
                    คู่ค้า
                  </span>
                  <span className="text-gray-600">
                    ผู้ขายสินค้า/บริการ หรือผู้แทนตัวแทนของนิติบุคคลคู่ค้า
                  </span>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <span className="font-semibold text-gray-900 block mb-0.5">
                    ข้อมูลส่วนบุคคล
                  </span>
                  <span className="text-gray-600">
                    ข้อมูลที่ระบุตัวตนบุคคลธรรมดาได้ทั้งทางตรงหรือทางอ้อม
                  </span>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <span className="font-semibold text-gray-900 block mb-0.5">
                    พ.ร.บ. คุ้มครองข้อมูลฯ
                  </span>
                  <span className="text-gray-600">
                    พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562 (PDPA)
                  </span>
                </div>
              </div>
            </section>

            {/* Section 2 */}
            <section id="sec-2" className="scroll-mt-20">
              <h2 className="text-lg font-bold text-gray-900 border-b border-gray-200 pb-2 mb-3">
                2. สัญญาและหลักการของเรา
              </h2>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm list-disc pl-4 text-gray-600">
                <li>ประมวลผลข้อมูลอย่างถูกต้อง สุจริต และตามที่กฎหมายกำหนด</li>
                <li>ใช้ข้อมูลตามวัตถุประสงค์ที่ได้แจ้งไว้เท่านั้น</li>
                <li>
                  ไม่เปิดเผยข้อมูลแก่บุคคลที่สาม
                  เว้นแต่ได้รับอนุญาตหรือมีข้อยกเว้นตามกฎหมาย
                </li>
                <li>มีมาตรการรักษาความปลอดภัยของข้อมูลขั้นสูง</li>
              </ul>
            </section>

            {/* Section 3 */}
            <section id="sec-3" className="scroll-mt-20">
              <h2 className="text-lg font-bold text-gray-900 border-b border-gray-200 pb-2 mb-3">
                3. ข้อมูลส่วนบุคคลที่เราเก็บรวบรวม
              </h2>
              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="w-full text-xs sm:text-sm text-left">
                  <thead className="bg-gray-100 text-gray-900 font-semibold border-b border-gray-200">
                    <tr>
                      <th className="px-3 py-2 w-1/3">ประเภทข้อมูล</th>
                      <th className="px-3 py-2">รายละเอียด</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white text-gray-600">
                    <tr>
                      <td className="px-3 py-2 font-medium text-gray-900">
                        ระบุตัวตน & ติดต่อ
                      </td>
                      <td className="px-3 py-2">
                        ชื่อ-นามสกุล, เบอร์โทร, ที่อยู่, อีเมล, วันเกิด, เพศ,
                        เลขบัตรประชาชน/พาสปอร์ต
                      </td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2 font-medium text-gray-900">
                        การชำระเงิน & ซื้อสินค้า
                      </td>
                      <td className="px-3 py-2">
                        เลขบัตรเครดิต, บัญชีธนาคาร, ประวัติการสั่งซื้อ,
                        สลิปโอนเงิน
                      </td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2 font-medium text-gray-900">
                        อุปกรณ์ & การใช้งาน
                      </td>
                      <td className="px-3 py-2">
                        IP Address, หมายเลขอุปกรณ์, OS, คุกกี้,
                        ประวัติการเข้าชมเว็บไซต์
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* Section 4 */}
            <section id="sec-4" className="scroll-mt-20">
              <h2 className="text-lg font-bold text-gray-900 border-b border-gray-200 pb-2 mb-3">
                4. วัตถุประสงค์ในการประมวลผลข้อมูล
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
                <div className="p-3.5 bg-white border border-gray-200 rounded-lg shadow-2xs">
                  <span className="inline-block px-2 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-800 mb-1.5">
                    การปฏิบัติตามสัญญา
                  </span>
                  <p className="text-gray-600">
                    จัดการบัญชีสมาชิก, จัดส่งสินค้า, ชำระเงิน, บริการหลังการขาย
                    และการตลาดสิทธิประโยชน์
                  </p>
                </div>
                <div className="p-3.5 bg-white border border-gray-200 rounded-lg shadow-2xs">
                  <span className="inline-block px-2 py-0.5 rounded text-xs font-semibold bg-indigo-100 text-indigo-800 mb-1.5">
                    ประโยชน์โดยชอบด้วยกฎหมาย
                  </span>
                  <p className="text-gray-600">
                    วิเคราะห์ พัฒนาสินค้า/บริการ, ปรับปรุงเว็บไซต์
                    และการดำเนินคดีทางกฎหมาย
                  </p>
                </div>
                <div className="p-3.5 bg-white border border-gray-200 rounded-lg shadow-2xs">
                  <span className="inline-block px-2 py-0.5 rounded text-xs font-semibold bg-purple-100 text-purple-800 mb-1.5">
                    ปฏิบัติตามกฎหมาย
                  </span>
                  <p className="text-gray-600">
                    ออกใบกำกับภาษี, เอกสารทางบัญชี และการขอคืนภาษีมูลค่าเพิ่ม
                    (VAT Refund)
                  </p>
                </div>
                <div className="p-3.5 bg-white border border-gray-200 rounded-lg shadow-2xs">
                  <span className="inline-block px-2 py-0.5 rounded text-xs font-semibold bg-amber-100 text-amber-800 mb-1.5">
                    ความยินยอม & คุกกี้
                  </span>
                  <p className="text-gray-600">
                    นำเสนอโฆษณาที่ตรงใจ และปรับแต่งประสบการณ์ใช้งานเฉพาะบุคคล
                  </p>
                </div>
              </div>
              <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 p-2.5 rounded-lg mt-3">
                <strong>ข้อสังเกต</strong> หากไม่ให้ข้อมูลที่จำเป็น
                บริษัทอาจไม่สามารถให้บริการหรือดำเนินงานตามสัญญาแก่ท่านได้
              </p>
            </section>

            {/* Section 5 */}
            <section id="sec-5" className="scroll-mt-20">
              <h2 className="text-lg font-bold text-gray-900 border-b border-gray-200 pb-2 mb-3">
                5. การเปิดเผยข้อมูลแก่บุคคลที่สาม
              </h2>
              <p className="text-gray-600 mb-2">
                เราจะไม่เปิดเผยข้อมูลแก่บุคคลภายนอก เว้นแต่ได้รับความยินยอม,
                จำเป็นเพื่อรักษาชีวิต/ทรัพย์สิน, เป็นไปตามกฎหมาย
                หรือส่งต่อให้ผู้ประมวลผลข้อมูล/กลุ่มบริษัท Fast Retailing
                ภายใต้มาตรการความปลอดภัยที่มาตรฐานคุ้มครองเทียบเท่า
              </p>
            </section>

            {/* Section 6 */}
            <section id="sec-6" className="scroll-mt-20">
              <h2 className="text-lg font-bold text-gray-900 border-b border-gray-200 pb-2 mb-3">
                6. สิทธิของท่านตามกฎหมาย (PDPA)
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                <div className="p-2 bg-gray-50 rounded border border-gray-200 font-medium text-gray-800">
                  1. ขอเข้าถึง/รับสำเนา
                </div>
                <div className="p-2 bg-gray-50 rounded border border-gray-200 font-medium text-gray-800">
                  2. ขอแก้ไขข้อมูล
                </div>
                <div className="p-2 bg-gray-50 rounded border border-gray-200 font-medium text-gray-800">
                  3. ขอถอนความยินยอม
                </div>
                <div className="p-2 bg-gray-50 rounded border border-gray-200 font-medium text-gray-800">
                  4. ขอลบ/ทำลายข้อมูล
                </div>
                <div className="p-2 bg-gray-50 rounded border border-gray-200 font-medium text-gray-800">
                  5. คัดค้านการประมวลผล
                </div>
                <div className="p-2 bg-gray-50 rounded border border-gray-200 font-medium text-gray-800">
                  6. ขอระงับการใช้ข้อมูล
                </div>
                <div className="p-2 bg-gray-50 rounded border border-gray-200 font-medium text-gray-800 col-span-2 sm:col-span-2">
                  7. ขอโอนย้ายข้อมูลอัตโนมัติ
                </div>
              </div>
            </section>

            {/* Section 7 */}
            <section id="sec-7" className="scroll-mt-20">
              <h2 className="text-lg font-bold text-gray-900 border-b border-gray-200 pb-2 mb-3">
                7. ช่องทางการติดต่อ & DPO
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 mb-3">
                บริษัทจะตอบกลับคำร้องใช้สิทธิภายใน <strong>30 วัน</strong>{" "}
                หลังยืนยันตัวตนเรียบร้อยแล้ว
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
                <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-2xs">
                  <h3 className="font-bold text-gray-900 mb-1">
                    บริษัท ออคเคชัน (ประเทศไทย) จำกัด
                  </h3>
                  <p className="text-gray-500 mb-2">
                    อาคารมิตรทาวน์ ออฟฟิศ ทาวเวอร์
                  </p>
                  <p>
                    <strong>Email:</strong>{" "}
                    <a
                      href="mailto:customerservice@uniqlo.co.th"
                      className="text-blue-600 underline"
                    >
                      customerservice@occasion.co.th
                    </a>
                  </p>
                  <p>
                    <strong>Tel:</strong> 1800-013-640
                  </p>
                </div>
                <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-2xs">
                  <h3 className="font-bold text-gray-900 mb-1">
                    เจ้าหน้าที่คุ้มครองข้อมูลส่วนบุคคล (DPO)
                  </h3>
                  <p className="text-gray-500 mb-2">
                    อาคารมิตรทาวน์ ออฟฟิศ ทาวเวอร์
                  </p>
                  <p>
                    <strong>Email:</strong>{" "}
                    <a
                      href="mailto:dpo_th@uniqlo.co.th"
                      className="text-blue-600 underline"
                    >
                      dpo_th@occasion.co.th
                    </a>
                  </p>
                </div>
              </div>
            </section>

            {/* Section 8 */}
            <section id="sec-8" className="scroll-mt-20 space-y-4">
              <h2 className="text-lg font-bold text-gray-900 border-b border-gray-200 pb-2 mb-1">
                8. ความปลอดภัย คุกกี้ และผู้เยาว์
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <strong className="text-gray-900 block mb-1">
                    การใช้คุกกี้ (Cookies)
                  </strong>
                  <p className="text-gray-600">
                    เราใช้คุกกี้จำเป็น, คุกกี้ประสิทธิภาพ และคุกกี้เพื่อการโฆษณา
                    ท่านสามารถจัดการตั้งค่าคุกกี้ได้ผ่านเบราว์เซอร์
                  </p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <strong className="text-gray-900 block mb-1">
                    ผู้เยาว์ (ต่ำกว่า 20 ปี)
                  </strong>
                  <p className="text-gray-600">
                    ต้องได้รับความยินยอมจากผู้ปกครองก่อนให้ข้อมูล
                    หากพบว่ามีการเก็บข้อมูลโดยไม่ได้เจตนา บริษัทจะลบข้อมูลทันที
                  </p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <strong className="text-gray-900 block mb-1">
                    ความปลอดภัย & แหล่งเก็บ
                  </strong>
                  <p className="text-gray-600">
                    อาจมีการเก็บ/โอนข้อมูลไปยังต่างประเทศภายใต้ระบบรักษาความปลอดภัยตามมาตรฐานกฎหมาย
                  </p>
                </div>
              </div>
            </section>

            {/* Section 9 */}
            <section id="sec-9" className="scroll-mt-20">
              <h2 className="text-lg font-bold text-gray-900 border-b border-gray-200 pb-2 mb-2">
                9. เงื่อนไขอื่น ๆ
              </h2>
              <ul className="list-disc pl-4 text-xs sm:text-sm text-gray-600 space-y-1">
                <li>
                  บริษัทขอสงวนสิทธิ์ในการแก้ไขปรับปรุงนโยบายนี้
                  การใช้งานต่อถือว่าท่านรับทราบและยอมรับข้อตกลงแล้ว
                </li>
                <li>
                  หากเนื้อหาภาษาไทยและภาษาอังกฤษไม่สอดคล้องกัน ให้ยึดถือฉบับ{" "}
                  <strong>ภาษาอังกฤษ</strong> เป็นหลัก
                </li>
              </ul>
            </section>
          </div>
        </main>
      </div>

      {/* Footer Container */}
      <div id="footer-container"></div>
    </div>
  );
}

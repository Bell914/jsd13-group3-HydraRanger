import React, { useState } from "react";
import { useContactStore } from "../store/useContactStore.js"; // ปรับ path ให้ตรงกับโปรเจกต์ของคุณ
import { Modal } from "../components/ui/Modal.jsx";

const initialFormData = { name: "", email: "", phone: "", topic: "", message: "" };

export default function CustomerService() {
  // 1. ดึง State และ Action มาจาก Store
  const { loading, statusMsg, submitContactForm } = useContactStore();

  // 2. State สำหรับเก็บข้อมูลฟอร์ม (เก็บไว้ใน Component ดีที่สุด เพราะอัปเดตบ่อยตอนพิมพ์)
  const [formData, setFormData] = useState(initialFormData);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 3. ฟังก์ชันกดยืนยันฟอร์ม
  const handleSubmit = async (e) => {
    e.preventDefault();

    // เรียกใช้ฟังก์ชันจาก Store
    const isSuccess = await submitContactForm(formData);

    // ถ้าส่งสำเร็จ ให้แสดง modal success และเคลียร์ข้อมูลในฟอร์ม
    if (isSuccess) {
      setFormData(initialFormData);
      setShowSuccessModal(true);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">
      <div className="w-full flex-1 flex justify-center py-10 px-4">
        <main className="w-full max-w-4xl text-left">
          {/* ... โค้ดส่วน Header และ Cards (FAQ) ด้านบนคงเดิม ไม่เปลี่ยนแปลง ... */}

          <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-2xs mt-12">
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              ส่งข้อความถึงเรา
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mb-6">
              หากท่านมีข้อสงสัยเพิ่มเติมหรือต้องการความช่วยเหลือ
              สามารถกรอกฟอร์มด้านล่างนี้ได้เลย
            </p>

            {/* แจ้งเตือนสถานะการส่ง (ดึงข้อมูลมาจาก Store) */}
            {statusMsg && (
              <div
                className={`p-4 mb-6 rounded-lg text-sm ${statusMsg.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}
              >
                {statusMsg.text}
              </div>
            )}

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    ชื่อ - นามสกุล <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="ระบุชื่อและนามสกุล"
                    className="w-full text-xs sm:text-sm p-3 border border-gray-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    อีเมลติดต่อ <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="example@email.com"
                    className="w-full text-xs sm:text-sm p-3 border border-gray-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    เบอร์โทรศัพท์
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="08X-XXX-XXXX"
                    className="w-full text-xs sm:text-sm p-3 border border-gray-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    หัวข้อเรื่อง <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="topic"
                    value={formData.topic}
                    onChange={handleChange}
                    className="w-full text-xs sm:text-sm p-3 border border-gray-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-white"
                    required
                  >
                    <option value="" disabled>
                      เลือกหัวข้อสอบถาม
                    </option>
                    <option value="order">สอบถามคำสั่งซื้อ / สถานะพัสดุ</option>
                    <option value="return">การคืนสินค้าและการคืนเงิน</option>
                    <option value="payment">ปัญหาการชำระเงิน</option>
                    <option value="other">เรื่องอื่นๆ</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  รายละเอียดข้อความ <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows="4"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="อธิบายรายละเอียดหรือคำถามของท่าน..."
                  className="w-full text-xs sm:text-sm p-3 border border-gray-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  required
                ></textarea>
              </div>

              <div className="text-right">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto px-6 py-3 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-400 text-white font-medium text-xs sm:text-sm rounded-lg transition"
                >
                  {loading ? "กำลังส่งข้อมูล..." : "ส่งข้อความ"}
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
      <footer id="footer-container"></footer>

      {/* Modal แจ้งเตือนเมื่อส่งข้อความสำเร็จ */}
      <Modal
        open={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="ส่งข้อความสำเร็จ"
        footer={
          <button
            type="button"
            onClick={() => setShowSuccessModal(false)}
            className="px-6 py-2.5 bg-gray-900 hover:bg-gray-800 text-white font-medium text-sm rounded-lg transition"
          >
            ปิด
          </button>
        }
      >
        <p className="text-sm leading-relaxed">
          ขอบคุณที่ติดต่อทีมงาน OCCASION
          เจ้าหน้าที่จะติดต่อกลับไปหาท่านโดยเร็วที่สุดผ่านช่องทางที่ระบุไว้
        </p>
      </Modal>
    </div>
  );
}

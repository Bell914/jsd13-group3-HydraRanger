# Size Recommendation และ Security: งานแก้ไขต่อยอด

ใช้ branch `codex/size-security-followup` ต่อจาก develop `df99038` (PR #70)

## หลักการเขียนโค้ด

- แยกฟังก์ชันตามหน้าที่ และใช้ชื่อที่บอกสิ่งที่ทำ
- ใช้ if และ return เพื่อแยกกรณีปกติ กรณีไม่มีไซส์ และกรณีหมดสต็อก
- ไม่เพิ่ม dependency หรือเปลี่ยนโครงสร้างโปรเจกต์

## Size Recommendation

1. ถ้ามีตารางรอบอกของสินค้า ใช้รอบอกกับระยะเผื่อตาม preferred fit
2. ถ้าตารางไม่มีไซส์ที่รองรับ จะบอกว่าไม่มีไซส์เหมาะสม ไม่เลือกไซส์ใหญ่สุดแทน
3. ตารางสินค้าปัจจุบันมีเฉพาะรอบอก จึงแสดงความมั่นใจปานกลางและบอกข้อจำกัดเรื่องเอว
4. กางเกงใช้เอวและสะโพกจากตารางสัดส่วนมาตรฐาน ไม่ใช้ตารางรอบอก
5. ตารางมาตรฐานเลือกไซส์ที่รองรับทุกสัดส่วนที่เกี่ยวข้อง ไม่เฉลี่ยจนเลือกเล็กเกินไป
6. สัดส่วนอยู่นอกช่วงข้อมูล หรือไม่มีไซส์ตามทรงที่เลือก จะแสดงว่าไม่มีไซส์เหมาะสม
7. ไซส์ที่เหมาะกับรูปร่างกับสถานะสต็อกเป็นคนละเรื่อง ไม่เปลี่ยนไปแนะนำไซส์อื่นเพียงเพราะของหมด
8. ปุ่มเลือกไซส์เปิดใช้เมื่อมีสต็อกในสีที่เลือก และการเพิ่มตะกร้าใช้ variant ID / ราคา / สต็อกของไซส์นั้นจริง

สถานะผลลัพธ์: available, out-of-stock, unavailable (ไม่มี variant หรือไม่ทราบสต็อก), no-match

เมื่อ Admin แก้สินค้า:
- ไม่ส่ง size_chart = เก็บตารางเดิม
- ส่ง size_chart เป็น array = แทนที่ด้วยตารางใหม่
- ส่ง size_chart เป็น [] = ล้างตารางอย่างชัดเจน

ยังไม่ได้เพิ่มหน้าจอ Admin สำหรับกรอกตารางไซส์ หรือเพิ่มข้อมูลเอว/สะโพกจริงใน schema สินค้า

## Security

- rate limiter แต่ละตัวเก็บตัวนับแยกกัน และทำงานทั้ง development / test / production
- API วิเคราะห์รูปจำกัด 10 คำขอต่อ IP ใน 15 นาที ก่อนอ่านรูปเข้า memory
- รูปไม่เกิน 5 MB ต่อไฟล์ สูงสุด 2 ไฟล์ คือ top และ bottom
- รับ JPG, PNG, WebP, GIF และตรวจลายเซ็นส่วนหัวไฟล์ให้ตรง MIME type
- ตอบ 413 เมื่อไฟล์ใหญ่เกินกำหนด และ 400 เมื่อรูปแบบไฟล์/จำนวนไฟล์ไม่ถูกต้อง
- นอก development: ไม่ยอมรับ mock session และตอบ 503 เมื่ออ่านบัญชีจากฐานข้อมูลไม่ได้
- เมื่อฐานข้อมูลทำงาน ใช้ role และสถานะระงับบัญชีจากฐานข้อมูล ไม่ใช้ role เก่าใน token

ข้อจำกัด: ตัวนับอยู่ใน memory ของแต่ละ server และเริ่มใหม่เมื่อ restart ไม่ใช่โควตาร่วมหลาย server การตรวจส่วนหัวไฟล์ไม่ใช่การ decode รูปทั้งหมด ส่วน production ที่มี reverse proxy ต้องกำหนด trusted proxy ให้ตรงกับ deployment จริง ห้ามเชื่อ X-Forwarded-For จากทุกแหล่ง

## การตรวจรับ

```sh
cd client
npm test -- src/test/sizeRecommendation.test.js src/test/SizeRecommendationCard.test.jsx src/test/ProductDetail.size.test.jsx
npm run build
cd ../server
npm run test:security
cd ../admin-client
npm run build
```

Server tests ต้องมี JWT_SECRET สำหรับทดสอบใน environment ไม่ต้องใช้ secret จริง ไม่เรียก MongoDB หรือ Gemini จริง

ทดสอบเพิ่มบนระบบทดสอบก่อน merge: Admin แก้ชื่อสินค้าที่มีตารางไซส์แล้ว refresh, ลูกค้าบันทึกสัดส่วนและสลับสี, เลือกไซส์แนะนำแล้วตรวจ SKU ในตะกร้า, บัญชีถูกระงับต้องเข้า protected API ไม่ได้

งานนี้ไม่เปลี่ยน Checkout, Membership, ค่าส่ง, การหักสต็อกในฐานข้อมูล หรือ Forgot Password ของ PR #61/#71/#72

## ผลทดสอบวันที่ 22 กันยายน 2026

- Size logic, recommendation card และการเลือก variant เข้าตะกร้า: 17/17 ผ่าน
- Server security / validation / regression: 17/17 ผ่าน
- ตรวจโหมด production ของ security suite แล้วผ่าน
- Client และ Admin production build ผ่าน (มีคำเตือนขนาด bundle เดิม)
- Client suite รวม: 36/40 ผ่าน; 4 ข้อที่ล้มอยู่ใน Checkout.test.jsx ซึ่งพบตั้งแต่ develop ก่อนแก้รอบนี้
- git diff --check ผ่าน
- ยังไม่ได้ทดสอบกับ MongoDB, Gemini หรือ deployment จริง

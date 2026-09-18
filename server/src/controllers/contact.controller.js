export const submitContactForm = async (req, res) => {
  try {
    const { name, email, phone, topic, message } = req.body;

    // ตรวจสอบว่าส่งข้อมูลมาครบไหม
    if (!name || !email || !topic || !message) {
      return res
        .status(400)
        .json({
          success: false,
          message: "กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน",
        });
    }

    // โหลด nodemailer แบบ dynamic เพื่อป้องกัน server crash ตอนเริ่มต้นหาก package ยังไม่ได้ติดตั้งบน cloud
    let nodemailer;
    try {
      const nodemailerModule = await import("nodemailer");
      nodemailer = nodemailerModule.default || nodemailerModule;
    } catch (loadError) {
      console.error("⚠️ Nodemailer is not installed or failed to load:", loadError.message);
      return res.status(503).json({
        success: false,
        message: "ระบบส่งอีเมลยังไม่พร้อมใช้งาน กรุณาติดต่อผ่านช่องทางอื่น",
      });
    }

    // 1. ตั้งค่า transporter (ผู้ส่ง)
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // 2. จัดรูปแบบอีเมลที่จะส่ง
    const mailOptions = {
      from: `"${name}" <${process.env.EMAIL_USER}>`, // ส่งจากระบบ
      to: process.env.RECEIVER_EMAIL, // ส่งถึงแอดมิน
      replyTo: email, // ถ้าแอดมินกด Reply ให้ตอบกลับไปที่อีเมลของลูกค้า
      subject: `[Customer Service] หัวข้อ: ${topic} - จากคุณ ${name}`,
      html: `
        <h2>มีข้อความใหม่จากหน้า Customer Service</h2>
        <p><strong>ชื่อ-นามสกุล:</strong> ${name}</p>
        <p><strong>อีเมลติดต่อ:</strong> ${email}</p>
        <p><strong>เบอร์โทรศัพท์:</strong> ${phone || "ไม่ระบุ"}</p>
        <p><strong>หัวข้อ:</strong> ${topic}</p>
        <hr />
        <h3>รายละเอียดข้อความ:</h3>
        <p style="white-space: pre-wrap;">${message}</p>
      `,
    };

    // 3. สั่งส่งอีเมล
    await transporter.sendMail(mailOptions);

    res
      .status(200)
      .json({
        success: true,
        message: "ส่งข้อความสำเร็จ ทีมงานจะติดต่อกลับโดยเร็วที่สุด",
      });
  } catch (error) {
    console.error("Error sending email:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "ไม่สามารถส่งข้อความได้ กรุณาลองใหม่อีกครั้ง",
      });
  }
};

import dotenv from 'dotenv';
dotenv.config();

/**
 * Helper to get nodemailer transporter safely
 */
async function getTransporter() {
  try {
    const nodemailerModule = await import('nodemailer');
    const nodemailer = nodemailerModule.default || nodemailerModule;

    const user = process.env.SMTP_USER || process.env.EMAIL_USER;
    const pass = process.env.SMTP_PASS || process.env.EMAIL_PASS;

    if (!user || !pass) {
      return null;
    }

    return nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user,
        pass
      }
    });
  } catch (err) {
    console.warn('⚠️ Nodemailer not available or failed to configure:', err.message);
    return null;
  }
}

/**
 * ส่งอีเมลแจ้งเตือนเมื่อสมาชิกได้รับการเลื่อนระดับ (Rank Upgrade Email)
 * @param {Object} user - ข้อมูลผู้ใช้
 * @param {string} previousRank - ระดับก่อนหน้า
 * @param {string} newRank - ระดับใหม่ที่ได้รับ
 * @param {Array<string>} benefits - รายการสิทธิประโยชน์ใหม่
 */
export async function sendRankUpgradeEmail(user, previousRank, newRank, benefits = []) {
  if (!user || !user.email) return false;

  const subject = `🎉 ยินดีด้วยคุณ ${user.username || ''}! คุณได้รับการอัปเกรดเป็นสมาชิกระดับ ${newRank} แล้ว`;
  const benefitsList = benefits.map((b) => `<li>✨ ${b}</li>`).join('');

  const htmlContent = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; rounded: 16px;">
      <h2 style="color: #111827; text-align: center;">ยินดีด้วย! คุณได้รับการเลื่อนระดับสมาชิก</h2>
      <div style="background: #f8fafc; padding: 16px; border-radius: 12px; text-align: center; margin: 16px 0;">
        <span style="font-size: 14px; color: #64748b;">ระดับสมาชิกใหม่ของคุณ:</span>
        <h1 style="color: #d97706; margin: 8px 0; font-size: 28px;">${newRank}</h1>
        <p style="font-size: 12px; color: #94a3b8;">(อัปเกรดจากระดับ ${previousRank})</p>
      </div>
      <h3 style="color: #1f2937;">สิทธิพิเศษใหม่ที่คุณปลดล็อก:</h3>
      <ul style="color: #4b5563; line-height: 1.6;">
        ${benefitsList}
      </ul>
      <p style="font-size: 14px; color: #6b7280; margin-top: 24px;">
        ขอบคุณที่เป็นส่วนหนึ่งของ OCCASION LOYALTY CLUB คุณสามารถเข้าสู่ระบบเพื่อใช้สิทธิประโยชน์ได้ทันที
      </p>
    </div>
  `;

  try {
    const transporter = await getTransporter();
    if (transporter) {
      await transporter.sendMail({
        from: `"OCCASION Club" <${process.env.SMTP_USER}>`,
        to: user.email,
        subject,
        html: htmlContent
      });
      console.log(`✉️ Rank upgrade email sent to ${user.email} (${newRank})`);
    } else {
      console.log(`[Email Service - Simulated] Rank upgrade email for ${user.email}: upgraded to ${newRank}`);
    }
    return true;
  } catch (error) {
    console.error('Failed to send rank upgrade email:', error.message);
    return false;
  }
}

/**
 * ส่งอีเมลต้อนรับสมาชิกใหม่พร้อมคูปอง
 */
export async function sendWelcomeMemberEmail(user, couponCode = 'OCCWELCOME10') {
  if (!user || !user.email) return false;

  const subject = `ยินดีต้อนรับสู่ OCCASION LOYALTY CLUB - รับคูปองลด 10%`;
  const htmlContent = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
      <h2>ยินดีต้อนรับคุณ ${user.username || ''} เข้าสู่ OCCASION</h2>
      <p>ขอบคุณที่สมัครเป็นสมาชิกกับเรา คุณสามารถใช้โค้ดส่วนลดต้อนรับสมาชิกใหม่ได้ทันที:</p>
      <div style="background: #fef3c7; padding: 16px; border-radius: 8px; text-align: center; font-weight: bold; font-size: 20px; color: #b45309;">
        ${couponCode}
      </div>
      <p style="color: #6b7280; font-size: 12px; margin-top: 12px;">ส่วนลด 10% เมื่อซื้อสินค้าขั้นต่ำ ฿500 บาท</p>
    </div>
  `;

  try {
    const transporter = await getTransporter();
    if (transporter) {
      await transporter.sendMail({
        from: `"OCCASION Club" <${process.env.SMTP_USER}>`,
        to: user.email,
        subject,
        html: htmlContent
      });
    } else {
      console.log(`[Email Service - Simulated] Welcome email for ${user.email} with coupon ${couponCode}`);
    }
    return true;
  } catch (error) {
    console.error('Failed to send welcome email:', error.message);
    return false;
  }
}

// 🚀 Welcome Coupon Email (ส่งโค้ด 5% ให้สมาชิกใหม่)
export const sendWelcomeDiscountEmail = async ({ toEmail, username, couponCode = "WELCOME5", discountPercent = 5, expiresAt }) => {
  const user = process.env.SMTP_USER || process.env.EMAIL_USER;

  const formattedDate = expiresAt 
    ? new Date(expiresAt).toLocaleDateString("th-TH", { year: "numeric", month: "long", day: "numeric" })
    : "30 วันนับจากวันที่สมัคร";

  const mailOptions = {
    from: process.env.EMAIL_FROM || process.env.SMTP_FROM || `"HydraRanger Store" <${user || "support@hydraranger.com"}>`,
    to: toEmail,
    subject: `🎉 ยินดีต้อนรับสู่ HydraRanger! รับโค้ดส่วนลด ${discountPercent}% (${couponCode})`,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; line-height: 1.6;">
        <h2 style="color: #111827;">ยินดีต้อนรับคุณ ${username || "สมาชิกใหม่"}! 👋</h2>
        <p>ขอบคุณที่ร่วมเป็นครอบครัวเดียวกับ <b>HydraRanger</b> เราขอมอบของขวัญต้อนรับพิเศษสำหรับการสั่งซื้อครั้งแรก:</p>
        
        <div style="background-color: #fdf2f2; border: 2px dashed #e11d48; border-radius: 8px; padding: 15px; text-align: center; margin: 20px 0;">
          <span style="font-size: 28px; font-weight: bold; letter-spacing: 3px; color: #e11d48;">${couponCode}</span>
          <p style="margin: 5px 0 0; color: #4b5563; font-size: 14px;">รับส่วนลดทันที ${discountPercent}%</p>
        </div>

        <p style="font-size: 13px; color: #6b7280;">
          *เงื่อนไข: สิทธิ์เฉพาะสมาชิกใหม่ 1 บัญชี/1 ครั้ง หมดอายุวันที่ ${formattedDate}
        </p>
      </div>
    `,
  };

  try {
    const transporter = await getTransporter();
    if (transporter) {
      const info = await transporter.sendMail(mailOptions);
      console.log(`✅ Welcome coupon email sent to ${toEmail}`);
      return { success: true, messageId: info.messageId };
    } else {
      console.log(`[Email Service - Simulated] Welcome coupon email for ${toEmail} with code ${couponCode} (${discountPercent}%)`);
      return { success: true, simulated: true };
    }
  } catch (error) {
    console.error("❌ Send welcome email failed:", error.message);
    return { success: false, error: error.message };
  }
};

export async function sendPasswordResetEmail(user, resetUrl) {
  if (!user?.email || !resetUrl) return false;

  const transporter = await getTransporter();
  if (!transporter) {
    if (process.env.NODE_ENV === 'development') {
      console.info(`[Development password reset] ${resetUrl}`);
    } else {
      console.error('Password reset email is not configured. Set SMTP_USER and SMTP_PASS.');
    }
    return false;
  }

  try {
    await transporter.sendMail({
      from: `"OCCASION" <${process.env.SMTP_USER}>`,
      to: user.email,
      subject: 'ตั้งรหัสผ่าน OCCASION ใหม่',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
          <h2>ตั้งรหัสผ่านใหม่</h2>
          <p>ลิงก์นี้ใช้ได้ 1 ชั่วโมงและใช้ได้เพียงครั้งเดียว</p>
          <p><a href="${resetUrl}">ตั้งรหัสผ่านใหม่</a></p>
          <p style="color: #6b7280; font-size: 12px;">หากคุณไม่ได้ส่งคำขอนี้ คุณสามารถเพิกเฉยต่ออีเมลฉบับนี้ได้</p>
        </div>
      `
    });
    return true;
  } catch (error) {
    console.error(`Failed to send password reset email: ${error.message}`);
    return false;
  }
}

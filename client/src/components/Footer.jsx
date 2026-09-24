import { assets } from "../assets/assets.js";
import { Link } from "react-router-dom";
import { useAuth } from "../context/Auth/useAuth.jsx";

const linkClass =
  "rounded-sm transition hover:text-[#efc3bc] hover:underline focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-white/80";

export const Footer = () => {
  const { isAuthenticated } = useAuth();
  const socialLinks = [
    ["https://facebook.com", assets.facebook, "facebook", "Facebook"],
    ["https://instagram.com", assets.instagram, "instagram", "Instagram"],
    ["https://line.me", assets.lineOfficial, "line", "Line Official"],
    ["https://tiktok.com", assets.tiktok, "tiktok", "TikTok"],
  ];

  return (
    <footer id="Footer" className="bg-[#263639] text-[#f7f2ec]">
      <div className="max-w-6xl w-full mx-auto px-4 py-8">
        <div className="mx-auto flex max-w-4xl flex-col items-center justify-between gap-3 rounded-xl bg-[#987b76] px-6 py-3.5 shadow-md sm:flex-row sm:px-7 sm:py-4">
          <p className="text-[#f7f2ec] font-medium text-base sm:text-lg text-center sm:text-left">
            Become a member and get 10% off for first purchase
          </p>
          <Link
            to="/register"
            className="min-h-11 inline-flex items-center cursor-pointer whitespace-nowrap rounded-xl border border-[#f7f2ec] bg-[#f7f2ec] px-6 py-2.5 font-bold text-[#263639] shadow transition hover:bg-[#efc3bc] focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-[#987b76] active:translate-y-px"
          >
            Subscribe
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 my-10">
          <div>
            <h4 className="font-bold text-lg mb-4 text-[#efc3bc]">สินค้า</h4>
            <ul className="space-y-2 text-sm text-[#f7f2ec]/90 list-none p-0 m-0">
              <li>
                <Link to="/products?category=tops" className={linkClass}>
                  ชุดส่วนบน
                </Link>
              </li>
              <li>
                <Link to="/products?category=bottoms" className={linkClass}>
                  ชุดส่วนร่าง
                </Link>
              </li>
              <li>
                <Link to="/lookbook" className={linkClass}>
                  เซ็ตเสื้อผ้า
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-lg mb-4 text-[#efc3bc]">ช่วยเหลือ</h4>
            <ul className="space-y-2 text-sm text-[#f7f2ec]/90 list-none p-0 m-0">
              <li>
                <Link to="/customerservice" className={linkClass}>
                  ติดต่อศูนย์บริการลูกค้า
                </Link>
              </li>
              <li>
                <Link to="/termsconditions" className={linkClass}>
                  ข้อตกลงและเงื่อนไข
                </Link>
              </li>
              <li>
                <Link to="/privacy" className={linkClass}>
                  นโยบายความปลอดภัย
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-lg mb-4 text-[#efc3bc]">ลูกค้า</h4>
            <ul className="space-y-2 text-sm text-[#f7f2ec]/90 list-none p-0 m-0">
              <li>
                {!isAuthenticated ? (
                  <Link to="/register" className={linkClass}>
                    สมัครสมาชิก
                  </Link>
                ) : (
                  <Link to="/profile" className={linkClass}>
                    บัญชีของฉัน
                  </Link>
                )}
              </li>
              <li>
                <Link to="/profile" className={linkClass}>
                  เข้าสู่ระบบ
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-lg mb-4 text-[#efc3bc]">
              โซเชียลมีเดีย
            </h4>
            <ul className="flex flex-col space-y-3 text-sm text-[#f7f2ec]/90 list-none p-0 m-0">
              {socialLinks.map(([href, icon, alt, label]) => (
                <li key={label}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={"inline-flex items-center gap-2 " + linkClass}
                  >
                    <img
                      src={icon}
                      alt={alt}
                      aria-hidden="true"
                      className="w-5 h-5 object-contain brightness-0 invert"
                    />
                    <span>{label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-[#f7f2ec]/20 pt-6 text-center text-xs text-[#f7f2ec]/70">
          &copy; 2026 ออคเคชัน สงวนลิขสิทธิ์ทั้งหมด
        </div>
      </div>
    </footer>
  );
};

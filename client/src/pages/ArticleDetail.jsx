import { fashionNews } from "../assets/assets";
import { useParams, Link } from "react-router-dom";

export const ArticleDetail = () => {
  const { id } = useParams();

  // ==========================================
  // 1. กรณีที่มี ID ใน URL (หน้า Detail บทความ)
  // ==========================================
  if (id) {
    const article = fashionNews.find((item) => item.id === parseInt(id));

    // ถ้าหาบทความไม่เจอ (เช่น พิมพ์ URL ผิด)
    if (!article) {
      return (
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold text-red-500 mb-4">ไม่พบบทความ</h2>
          <Link to="/article" className="btn">
            กลับไปหน้ารวม
          </Link>
        </div>
      );
    }

    return (
      <div className="mx-auto max-w-4xl py-10 px-4 text-black">
        {/* ปุ่มย้อนกลับ */}
        <Link to="/article" className="btn btn-ghost mb-6">
          ← กลับหน้ารวม
        </Link>

        {/* เนื้อหาบทความ */}
        <div className="mb-4 flex items-center gap-2">
          <span className="badge badge-secondary">{article.category}</span>
          <span className="text-gray-500 text-sm">{article.date}</span>
        </div>

        <h1 className="text-3xl font-bold mb-6">{article.title}</h1>

        <img
          src={
            article.image ||
            "https://img.daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.webp"
          }
          alt={article.title}
          className="w-full h-[400px] object-cover rounded-xl mb-6 shadow-md"
        />

        <p className="text-lg leading-relaxed">
          เนื้อหาของบทความ {article.title} จะแสดงที่นี่...
        </p>
      </div>
    );
  }

  // ==========================================
  // 2. กรณีที่ไม่มี ID ใน URL (หน้ารวมบทความ Grid)
  // ==========================================
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold text-center mb-8 text-black">
        ข่าวสารแฟชั่นล่าสุด
      </h1>

      {/* ปรับให้ Responsive: มือถือ 1 แถว, แท็บเล็ต 2 แถว, คอม 3 แถว */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-4">
        {fashionNews.map((el) => (
          <div
            key={el.id}
            className="card bg-base-100 w-full shadow-sm hover:shadow-md transition-all"
          >
            <figure>
              <img
                // ถ้าใน data มี image ให้ใช้ image ถ้าไม่มีให้ใช้รูปพื้นฐาน
                src={
                  el.image ||
                  "https://img.daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.webp"
                }
                alt={el.title}
                className="w-full h-56 object-cover"
              />
            </figure>
            <div className="card-body text-black px-4 py-4 flex flex-col">
              <h2 className="card-title text-lg leading-tight mb-2">
                {el.title}
                {/* แสดงป้าย NEW เฉพาะบทความใหม่ๆ (ตัวอย่าง: สมมติว่า 3 บทความแรกคือของใหม่) */}
                {el.id <= 3 && (
                  <div className="badge badge-secondary rounded-xl p-2 text-xs">
                    NEW
                  </div>
                )}
              </h2>
              <p className="text-gray-600 text-sm">{el.category}</p>

              {/* ปุ่มอ่านต่อพร้อม Link ส่ง id ไปที่ URL */}
              <div className="card-actions justify-end mt-auto pt-4">
                <Link to={`/article/${el.id}`}>
                  <button className="bg-primary hover:bg-primary-focus transition-colors rounded-xl px-4 py-2 text-white text-sm font-medium">
                    อ่านเพิ่มเติม
                  </button>
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

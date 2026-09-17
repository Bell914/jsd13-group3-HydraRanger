import { useEffect, useState } from 'react';
import { Menu, Package, PackageCheck, PackageX, Users } from 'lucide-react';
import { AdminNotifications } from '../components/AdminNotifications.jsx';
import { getDashboardSummary } from '../services/dashboardService.js';

function SummaryCard({ label, value, detail, Icon }) {
  return (
    <article className="summary-card">
      <div className="summary-icon"><Icon size={19} /></div>
      <p>{label}</p>
      <strong>{value}</strong>
      <small>{detail}</small>
    </article>
  );
}

function createLinePoints(items, highestValue) {
  const startX = 35;
  const endX = 525;
  const chartBottom = 190;
  const chartHeight = 140;
  const spaceBetweenPoints = items.length > 1 ? (endX - startX) / (items.length - 1) : 0;

  return items.map((item, index) => {
    return {
      ...item,
      x: startX + (spaceBetweenPoints * index),
      y: chartBottom - ((item.count / highestValue) * chartHeight)
    };
  });
}

export function AdminDashboardPage({ user, onOpenSidebar }) {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadDashboard() {
    setLoading(true);
    setError('');

    try {
      const dashboardData = await getDashboardSummary();
      setSummary(dashboardData);
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  const categoryStock = summary?.stockByCategory || [];
  const monthlyProducts = summary?.monthlyProducts || [];
  const highestStock = Math.max(1, ...categoryStock.map((item) => item.stock));
  const highestMonthlyCount = Math.max(1, ...monthlyProducts.map((item) => item.count));
  const linePoints = createLinePoints(monthlyProducts, highestMonthlyCount);
  const linePath = linePoints.map((point) => `${point.x},${point.y}`).join(' ');
  const notifications = [];
  if (summary?.lowStockCount > 0) {
    notifications.push(`มีสินค้าใกล้หมด ${summary.lowStockCount} รายการ`);
  }
  if (summary?.inactiveProductCount > 0) {
    notifications.push(`มีสินค้าที่ไม่แสดง ${summary.inactiveProductCount} รายการ`);
  }

  return (
    <div className="admin-content">
      <header className="admin-topbar">
        <button type="button" className="mobile-menu" onClick={onOpenSidebar} aria-label="เปิดเมนู">
          <Menu size={20} />
        </button>
        <strong className="topbar-title">ภาพรวมร้านค้า</strong>
        <div className="admin-profile">
          <AdminNotifications items={notifications} />
          <strong>{user?.username ?? 'Admin'} (Admin Supervisor)</strong>
        </div>
      </header>

      <main className="dashboard-page">
        <header className="page-heading">
          <div>
            <h1>Admin Dashboard</h1>
            <p>ข้อมูลสินค้าและลูกค้าจริงจาก MongoDB</p>
          </div>
          <button type="button" className="refresh-button" onClick={loadDashboard} disabled={loading}>
            {loading ? 'กำลังโหลด…' : 'อัปเดตข้อมูล'}
          </button>
        </header>

        {error && (
          <div className="dashboard-error" role="alert">
            <p>{error}</p>
            <button type="button" onClick={loadDashboard}>ลองใหม่</button>
          </div>
        )}

        {loading && !summary && <p className="dashboard-message">กำลังโหลดข้อมูล Dashboard…</p>}

        {summary && (
          <>
            <section className="summary-grid" aria-label="ข้อมูลสรุปของร้านค้า">
              <SummaryCard label="สินค้าทั้งหมด" value={summary.totalProducts} detail={`พร้อมขาย ${summary.activeProductCount} รายการ`} Icon={Package} />
              <SummaryCard label="สต็อกรวม" value={summary.totalStock} detail={`สต็อกต่ำ ${summary.lowStockCount} รายการ`} Icon={PackageCheck} />
              <SummaryCard label="สินค้าที่ไม่แสดง" value={summary.inactiveProductCount} detail="รวมสินค้าที่ปิดการขาย" Icon={PackageX} />
              <SummaryCard label="ลูกค้าทั้งหมด" value={summary.customerCount} detail="เฉพาะบัญชีประเภทลูกค้า" Icon={Users} />
            </section>

            <section className="chart-grid">
              <article className="chart-card">
                <header>
                  <div>
                    <h2>จำนวนสต็อกแยกตามหมวดหมู่</h2>
                    <p>รวมจำนวนสินค้าคงเหลือในแต่ละหมวด</p>
                  </div>
                  <span className="chart-type">Bar Chart</span>
                </header>
                <div className="bar-chart" role="img" aria-label="กราฟแท่งจำนวนสต็อกแยกตามหมวดหมู่">
                  {categoryStock.map((item) => (
                    <div className="bar-column" key={item.category}>
                      <span>{item.stock}</span>
                      <div className="bar" style={{ height: `${(item.stock / highestStock) * 85}%` }} />
                      <small>{item.category}</small>
                    </div>
                  ))}
                </div>
              </article>

              <article className="chart-card">
                <header>
                  <div>
                    <h2>สินค้าที่เพิ่มใน 6 เดือนล่าสุด</h2>
                    <p>จำนวนสินค้าใหม่แยกตามเดือน</p>
                  </div>
                  <span className="chart-type">Line Chart</span>
                </header>
                <div className="line-chart" role="img" aria-label="กราฟเส้นจำนวนสินค้าที่เพิ่มในหกเดือนล่าสุด">
                  <svg viewBox="0 0 560 230" aria-hidden="true">
                    <line className="line-grid" x1="35" y1="50" x2="525" y2="50" />
                    <line className="line-grid" x1="35" y1="120" x2="525" y2="120" />
                    <line className="line-grid" x1="35" y1="190" x2="525" y2="190" />
                    <polyline className="order-line" points={linePath} />
                    {linePoints.map((point) => (
                      <g key={point.label}>
                        <circle className="line-point" cx={point.x} cy={point.y} r="7" />
                        <text className="line-value" x={point.x} y={point.y - 14}>{point.count}</text>
                        <text className="line-month" x={point.x} y="218">{point.label}</text>
                      </g>
                    ))}
                  </svg>
                </div>
              </article>
            </section>

            <p className="live-data-note">ข้อมูลจริงจาก MongoDB • กด “อัปเดตข้อมูล” เพื่อโหลดข้อมูลล่าสุด</p>
          </>
        )}
      </main>
    </div>
  );
}

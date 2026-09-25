import { useEffect, useState } from 'react';
import { AdminTopbar } from '../components/AdminTopbar.jsx';
import { getDashboardSummary } from '../services/dashboardService.js';

function SummaryCard({ label, value, detail }) {
  return (
    <article className="summary-card">
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

function formatMoney(value) {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    maximumFractionDigits: 0
  }).format(value || 0);
}

export function AdminDashboardPage() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');

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

  const allCategoryStock = summary?.stockByCategory || [];
  const categoryStock = allCategoryStock.filter((item) => {
    const matchesCategory = category === 'all' || item.category === category;
    return matchesCategory && item.category.toLowerCase().includes(search.trim().toLowerCase());
  });
  const monthlyOrders = summary?.monthlyOrders || [];
  const highestStock = Math.max(1, ...categoryStock.map((item) => item.stock));
  const highestMonthlyCount = Math.max(1, ...monthlyOrders.map((item) => item.count));
  const linePoints = createLinePoints(monthlyOrders, highestMonthlyCount);
  const linePath = linePoints.map((point) => `${point.x},${point.y}`).join(' ');
  return (
    <div className="admin-content">
      <AdminTopbar title="ภาพรวมร้านค้า" />

      <main className="dashboard-page">
        <header className="page-heading">
          <div>
            <h1>Admin Dashboard</h1>
            <p>ข้อมูลสินค้า ลูกค้า และคำสั่งซื้อจริงจาก MongoDB</p>
          </div>
          <button type="button" className="primary-action" onClick={loadDashboard} disabled={loading}>
            {loading ? 'กำลังโหลด…' : 'อัปเดตข้อมูล'}
          </button>
        </header>

        <section className="filter-toolbar" aria-label="ค้นหาและกรองกราฟสต็อก">
          <label className="product-search plain-search">
            <span className="sr-only">ค้นหาหมวดหมู่สินค้าในกราฟ</span>
            <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="ค้นหาหมวดหมู่ในกราฟ..." />
          </label>
          <div className="filters">
            <select value={category} onChange={(event) => setCategory(event.target.value)} aria-label="กรองหมวดหมู่ในกราฟ">
              <option value="all">ทุกหมวดหมู่</option>
              {allCategoryStock.map((item) => <option key={item.category} value={item.category}>{item.category}</option>)}
            </select>
          </div>
        </section>

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
              <SummaryCard label="สินค้าทั้งหมด" value={summary.totalProducts} detail={`พร้อมขาย ${summary.activeProductCount} รายการ`} />
              <SummaryCard label="สต็อกรวม" value={summary.totalStock} detail={`สต็อกต่ำ ${summary.lowStockCount} รายการ`} />
              <SummaryCard label="ลูกค้าทั้งหมด" value={summary.customerCount} detail="เฉพาะบัญชีประเภทลูกค้า" />
              <SummaryCard label="คำสั่งซื้อทั้งหมด" value={summary.totalOrders} detail={`รอตรวจสอบ ${summary.pendingOrderCount} รายการ`} />
              <SummaryCard label="รายได้จาก Orders" value={formatMoney(summary.totalRevenue)} detail="เฉพาะ Order ที่ชำระเงินแล้ว" />
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
                  {categoryStock.length === 0 && <p>ไม่พบหมวดหมู่ที่ค้นหา</p>}
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
                    <h2>Orders ใน 6 เดือนล่าสุด</h2>
                    <p>จำนวนคำสั่งซื้อแยกตามเดือน</p>
                  </div>
                  <span className="chart-type">Line Chart</span>
                </header>
                <div className="line-chart" role="img" aria-label="กราฟเส้นจำนวนคำสั่งซื้อในหกเดือนล่าสุด">
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

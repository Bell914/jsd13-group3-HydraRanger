import { useEffect, useState } from 'react';
import { Bell, Menu, Package, PackageCheck, PackageX, Users } from 'lucide-react';
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

  return (
    <div className="admin-content">
      <header className="admin-topbar">
        <button type="button" className="mobile-menu" onClick={onOpenSidebar} aria-label="เปิดเมนู">
          <Menu size={20} />
        </button>
        <strong className="topbar-title">ภาพรวมร้านค้า</strong>
        <div className="admin-profile">
          <button type="button" className="notification" aria-label="การแจ้งเตือน">
            <Bell size={18} />
            <span />
          </button>
          <strong>{user?.username ?? 'Admin'} (Super Admin)</strong>
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
                  <span className="chart-type">Horizontal Bar</span>
                </header>
                <div className="monthly-chart" role="img" aria-label="กราฟจำนวนสินค้าที่เพิ่มในหกเดือนล่าสุด">
                  {monthlyProducts.map((item) => (
                    <div className="monthly-row" key={item.label}>
                      <span>{item.label}</span>
                      <div className="monthly-track">
                        <div style={{ width: `${(item.count / highestMonthlyCount) * 100}%` }} />
                      </div>
                      <strong>{item.count}</strong>
                    </div>
                  ))}
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

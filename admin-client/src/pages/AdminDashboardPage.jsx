import { Bell, Menu, Package, ShoppingBag, TrendingUp, Users } from 'lucide-react';

const monthlySales = [
  { month: 'ม.ค.', amount: 42 },
  { month: 'ก.พ.', amount: 58 },
  { month: 'มี.ค.', amount: 48 },
  { month: 'เม.ย.', amount: 72 },
  { month: 'พ.ค.', amount: 64 },
  { month: 'มิ.ย.', amount: 88 },
];

const averageOrders = [
  { month: 'ม.ค.', amount: 1.4 },
  { month: 'ก.พ.', amount: 1.8 },
  { month: 'มี.ค.', amount: 1.6 },
  { month: 'เม.ย.', amount: 2.2 },
  { month: 'พ.ค.', amount: 2.4 },
  { month: 'มิ.ย.', amount: 2.8 },
];

const linePoints = averageOrders.map((item, index) => {
  const x = 35 + (index * 85);
  const y = 190 - (item.amount * 50);
  return `${x},${y}`;
}).join(' ');

const summaryCards = [
  { label: 'รายได้รวม', value: '฿372,000', detail: '+12% จากเดือนก่อน', icon: TrendingUp },
  { label: 'คำสั่งซื้อ', value: '186', detail: 'เฉลี่ย 6 รายการ/วัน', icon: ShoppingBag },
  { label: 'สินค้าในคลัง', value: '100', detail: 'เหลือน้อย 8 รายการ', icon: Package },
  { label: 'ลูกค้าทั้งหมด', value: '248', detail: 'ลูกค้าใหม่ 24 คน', icon: Users },
];

export function AdminDashboardPage({ user, onOpenSidebar }) {
  return (
    <div className="admin-content">
      <header className="admin-topbar">
        <button type="button" className="mobile-menu" onClick={onOpenSidebar} aria-label="เปิดเมนู">
          <Menu size={20} />
        </button>
        <div>
          <strong className="topbar-title">ภาพรวมร้านค้า</strong>
        </div>
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
            <p>ติดตามยอดขาย คำสั่งซื้อ และสินค้าในคลัง</p>
          </div>
        </header>

        <section className="summary-grid" aria-label="ข้อมูลสรุปของร้านค้า">
          {summaryCards.map(({ label, value, detail, icon: Icon }) => (
            <article className="summary-card" key={label}>
              <div className="summary-icon"><Icon size={19} /></div>
              <p>{label}</p>
              <strong>{value}</strong>
              <small>{detail}</small>
            </article>
          ))}
        </section>

        <section className="chart-grid">
          <article className="chart-card">
            <header>
              <div>
                <h2>ยอดขายรายเดือน</h2>
                <p>Revenue (พันบาท)</p>
              </div>
              <span className="chart-type">Bar Chart</span>
            </header>
            <div className="bar-chart" role="img" aria-label="กราฟแท่งยอดขายรายเดือน มกราคมถึงมิถุนายน">
              {monthlySales.map((item) => (
                <div className="bar-column" key={item.month}>
                  <span>{item.amount}</span>
                  <div className="bar" style={{ height: `${item.amount}%` }} />
                  <small>{item.month}</small>
                </div>
              ))}
            </div>
          </article>

          <article className="chart-card">
            <header>
              <div>
                <h2>มูลค่าเฉลี่ยต่อคำสั่งซื้อ</h2>
                <p>Average Order (พันบาท)</p>
              </div>
              <span className="chart-type">Line Chart</span>
            </header>
            <div className="line-chart">
              <svg viewBox="0 0 500 220" role="img" aria-label="กราฟเส้นมูลค่าเฉลี่ยต่อคำสั่งซื้อ มกราคมถึงมิถุนายน">
                {[40, 90, 140, 190].map((y) => (
                  <line className="line-grid" key={y} x1="25" y1={y} x2="475" y2={y} />
                ))}
                <polyline className="order-line" points={linePoints} />
                {averageOrders.map((item, index) => {
                  const x = 35 + (index * 85);
                  const y = 190 - (item.amount * 50);
                  return (
                    <g key={item.month}>
                      <circle className="line-point" cx={x} cy={y} r="5" />
                      <text className="line-value" x={x} y={y - 12}>{item.amount}</text>
                      <text className="line-month" x={x} y="212">{item.month}</text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </article>
        </section>

        <p className="mock-data-note">ข้อมูลบน Dashboard เป็น Mock Data สำหรับพัฒนา UI และจะเปลี่ยนเป็นข้อมูลจาก API ภายหลัง</p>
      </main>
    </div>
  );
}

import { Bell } from 'lucide-react';
import { useState } from 'react';

export function AdminNotifications({ items = [] }) {
  const [isOpen, setIsOpen] = useState(false);

  function toggleNotifications() {
    setIsOpen(!isOpen);
  }

  return (
    <div className="notification-area">
      <button
        type="button"
        className="notification"
        onClick={toggleNotifications}
        aria-label="ดูการแจ้งเตือน"
        aria-expanded={isOpen}
      >
        <Bell size={18} />
        {items.length > 0 && <span />}
      </button>

      {isOpen && (
        <section className="notification-panel" aria-label="รายการแจ้งเตือน">
          <strong>การแจ้งเตือน</strong>
          {items.length === 0 ? (
            <p>ยังไม่มีการแจ้งเตือนใหม่</p>
          ) : (
            <ul>
              {items.map((item) => <li key={item}>{item}</li>)}
            </ul>
          )}
        </section>
      )}
    </div>
  );
}

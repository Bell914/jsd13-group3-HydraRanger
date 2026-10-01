import { Bell } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function formatNotificationDate(date) {
  return new Intl.DateTimeFormat('th-TH', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(date));
}

export function AdminNotifications({ items = [] }) {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  function toggleNotifications() {
    setIsOpen(!isOpen);
  }

  function openNotification(path) {
    setIsOpen(false);
    if (path) {
      navigate(path);
    }
  }

  return (
    <div className="notification-area">
      <button
        type="button"
        className={`notification ${items.length > 0 ? 'has-notifications' : ''}`}
        onClick={toggleNotifications}
        aria-label="ดูการแจ้งเตือน"
        aria-expanded={isOpen}
      >
        <Bell size={18} />
      </button>

      {isOpen && (
        <section className="notification-panel" aria-label="รายการแจ้งเตือน">
          <strong>การแจ้งเตือน</strong>
          {items.length === 0 ? (
            <p>ยังไม่มีการแจ้งเตือนใหม่</p>
          ) : (
            <ul>
              {items.map((item, index) => (
                <li key={`${item.message}-${index}`}>
                  <button
                    type="button"
                    className="notification-item"
                    onClick={() => openNotification(item.path)}
                  >
                    <span>{item.message}</span>
                    <time dateTime={new Date(item.date).toISOString()}>
                      {formatNotificationDate(item.date)}
                    </time>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </div>
  );
}

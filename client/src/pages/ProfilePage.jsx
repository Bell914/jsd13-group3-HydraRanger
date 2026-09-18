import React, { useState } from 'react';
import { User, Heart, BookOpen, MapPin, Package, AlertCircle } from 'lucide-react';
import { Card } from '../components';
import { useAuth } from '../context/Auth/useAuth.jsx';

// Component แสดงผลเมื่อไม่มีข้อมูล (Empty State)
const EmptyState = ({ message, subtitle }) => (
  <div className="text-center py-12 border border-dashed border-gray-200 rounded-xl">
    <p className="text-gray-500 font-medium">{message}</p>
    {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
  </div>
);

export const ProfilePage = () => {
  const { user: authUser } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [error, setError] = useState(''); // Error state สำหรับกรณี fetch ข้อมูลล้มเหลว

  // ข้อมูลผู้ใช้จาก Auth context พร้อม fallback
  const user = authUser || { username: 'Customer', email: 'user@example.com' };
  const wishlist = [];
  const lookbooks = [];
  const addresses = [];
  const orders = [];

  const tabs = [
    { id: 'profile', label: 'ข้อมูลส่วนตัว', icon: User },
    { id: 'wishlist', label: 'Wishlist', icon: Heart },
    { id: 'lookbooks', label: 'Favorite Lookbooks', icon: BookOpen },
    { id: 'addresses', label: 'Shipping Addresses', icon: MapPin },
    { id: 'orders', label: 'Order History', icon: Package },
  ];

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6 text-primary">My Profile</h1>

      {/* Error Alert State */}
      {error && (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          <AlertCircle size={18} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Navigation Sidebar */}
        <Card className="p-2 md:col-span-1 h-fit">
          <nav className="flex flex-col space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors text-left ${
                    activeTab === tab.id
                      ? 'bg-accent text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Icon size={18} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </Card>

        {/* Tab Content Display Area */}
        <Card className="p-6 md:col-span-3">
          {activeTab === 'profile' && (
            <div>
              <h2 className="text-lg font-semibold mb-4">ข้อมูลส่วนตัว</h2>
              <div className="space-y-3 text-sm">
                <p><span className="font-medium text-gray-500">Username:</span> {user.username}</p>
                <p><span className="font-medium text-gray-500">Email:</span> {user.email}</p>
              </div>
            </div>
          )}

          {activeTab === 'wishlist' && (
            <div>
              <h2 className="text-lg font-semibold mb-4">รายการโปรด (Wishlist)</h2>
              {wishlist.length === 0 ? (
                <EmptyState message="ยังไม่มีรายการสินค้าโปรด" subtitle="กดหัวใจที่สินค้าที่คุณชอบเพื่อบันทึกไว้ดูภายหลัง" />
              ) : (
                <div>{/* Map รายการ Wishlist */}</div>
              )}
            </div>
          )}

          {activeTab === 'lookbooks' && (
            <div>
              <h2 className="text-lg font-semibold mb-4">Favorite Lookbooks</h2>
              {lookbooks.length === 0 ? (
                <EmptyState message="ยังไม่มี Lookbook ที่บันทึกไว้" />
              ) : (
                <div>{/* Map รายการ Lookbooks */}</div>
              )}
            </div>
          )}

          {activeTab === 'addresses' && (
            <div>
              <h2 className="text-lg font-semibold mb-4">ที่อยู่จัดส่ง (Shipping Addresses)</h2>
              {addresses.length === 0 ? (
                <EmptyState message="ยังไม่มีข้อมูลที่อยู่จัดส่ง" />
              ) : (
                <div>{/* Map รายการ ที่อยู่ */}</div>
              )}
            </div>
          )}

          {activeTab === 'orders' && (
            <div>
              <h2 className="text-lg font-semibold mb-4">ประวัติการสั่งซื้อ (Order History)</h2>
              {orders.length === 0 ? (
                <EmptyState message="ยังไม่มีประวัติการสั่งซื้อ" subtitle="เริ่มช้อปปิ้งเลยเพื่อดูคำสั่งซื้อของคุณที่นี่" />
              ) : (
                <div>{/* Map รายการ คำสั่งซื้อ */}</div>
              )}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
import React, { useState, useEffect } from 'react';
import { User, Heart, BookOpen, MapPin, Package, AlertCircle, Loader2, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import { Card } from '../components';
import { useAuth } from '../context/Auth/useAuth.jsx';
import { getMyOrders } from '../services/orderService';
import { addAddress, deleteAddress, setDefaultAddress } from '../services/userService';

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
  const [orders, setOrders] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form State สำหรับเพิ่มที่อยู่
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressForm, setAddressForm] = useState({
    recipientName: '',
    phone: '',
    addressLine: '',
    district: '',
    province: '',
    postalCode: '',
  });

  useEffect(() => {
    fetchOrdersData();
  }, []);

  useEffect(() => {
    if (authUser?.shippingAddresses) {
      setAddresses(authUser.shippingAddresses);
    }
  }, [authUser]);

  const fetchOrdersData = async () => {
    try {
      setLoading(true);
      setError('');
      const ordersRes = await getMyOrders();
      if (ordersRes?.data) {
        setOrders(ordersRes.data);
      } else if (Array.isArray(ordersRes)) {
        setOrders(ordersRes);
      }
    } catch (err) {
      console.error('Fetch Orders Error:', err);
      setError(err.message || 'ไม่สามารถโหลดข้อมูลคำสั่งซื้อได้');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAddress = async (e) => {
    e.preventDefault();
    try {
      const res = await addAddress(addressForm);
      if (res.data) setAddresses(res.data);
      setShowAddressForm(false);
      setAddressForm({ recipientName: '', phone: '', addressLine: '', district: '', province: '', postalCode: '' });
    } catch (err) {
      alert(err.message || 'ไม่สามารถเพิ่มที่อยู่ได้');
    }
  };

  const handleDeleteAddress = async (addressId) => {
    if (!confirm('คุณต้องการลบที่อยู่นี้ใช่หรือไม่?')) return;
    try {
      const res = await deleteAddress(addressId);
      if (res.data) setAddresses(res.data);
    } catch (err) {
      alert(err.message || 'ไม่สามารถลบที่อยู่ได้');
    }
  };

  const handleSetDefaultAddress = async (addressId) => {
    try {
      const res = await setDefaultAddress(addressId);
      if (res.data) setAddresses(res.data);
    } catch (err) {
      alert(err.message || 'ไม่สามารถตั้งเป็นที่อยู่หลักได้');
    }
  };

  const user = authUser || { username: 'Customer', email: 'user@example.com' };
  const wishlist = user.wishlist || [];
  const lookbooks = user.favoriteLookbooks || [];

  const tabs = [
    { id: 'profile', label: 'ข้อมูลส่วนตัว', icon: User },
    { id: 'wishlist', label: 'Wishlist', icon: Heart },
    { id: 'lookbooks', label: 'Favorite Lookbooks', icon: BookOpen },
    { id: 'addresses', label: 'Shipping Addresses', icon: MapPin },
    { id: 'orders', label: 'Order History', icon: Package },
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <Loader2 className="animate-spin text-accent" size={32} />
        <p className="text-sm text-gray-500 font-medium">กำลังโหลดข้อมูลโปรไฟล์...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6 text-primary">My Profile</h1>

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

        {/* Tab Content Area */}
        <Card className="p-6 md:col-span-3">
          {/* 1. ข้อมูลส่วนตัว */}
          {activeTab === 'profile' && (
            <div>
              <h2 className="text-lg font-semibold mb-4">ข้อมูลส่วนตัว</h2>
              <div className="space-y-3 text-sm border p-4 rounded-xl bg-gray-50/50">
                <p><span className="font-medium text-gray-500">Username:</span> {user.username}</p>
                <p><span className="font-medium text-gray-500">Email:</span> {user.email}</p>
                {user.role && <p><span className="font-medium text-gray-500">Role:</span> {user.role}</p>}
              </div>
            </div>
          )}

          {/* 2. Wishlist */}
          {activeTab === 'wishlist' && (
            <div>
              <h2 className="text-lg font-semibold mb-4">รายการโปรด (Wishlist)</h2>
              {wishlist.length === 0 ? (
                <EmptyState message="ยังไม่มีรายการสินค้าโปรด" subtitle="กดหัวใจที่สินค้าที่คุณชอบเพื่อบันทึกไว้ดูภายหลัง" />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {wishlist.map((item, idx) => (
                    <div key={item._id || idx} className="border p-3 rounded-lg flex items-center gap-3">
                      <img src={item.imageUrl || item.image} alt={item.title} className="w-16 h-16 object-cover rounded" />
                      <div>
                        <p className="font-semibold text-sm">{item.title}</p>
                        <p className="text-xs text-accent font-bold">฿{item.price?.toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 3. Favorite Lookbooks */}
          {activeTab === 'lookbooks' && (
            <div>
              <h2 className="text-lg font-semibold mb-4">Favorite Lookbooks</h2>
              {lookbooks.length === 0 ? (
                <EmptyState message="ยังไม่มี Lookbook ที่บันทึกไว้" />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {lookbooks.map((lb, idx) => (
                    <div key={lb._id || idx} className="border p-3 rounded-lg">
                      <p className="font-semibold text-sm">{lb.title || lb.name || `Lookbook #${lb}`}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 4. Shipping Addresses */}
          {activeTab === 'addresses' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">ที่อยู่จัดส่ง (Shipping Addresses)</h2>
                <button
                  onClick={() => setShowAddressForm(!showAddressForm)}
                  className="flex items-center gap-1.5 text-xs bg-accent text-white px-3 py-2 rounded-lg font-medium hover:bg-accent/90 transition-colors"
                >
                  <Plus size={16} />
                  <span>เพิ่มที่อยู่ใหม่</span>
                </button>
              </div>

              {/* Form เพิ่มที่อยู่ */}
              {showAddressForm && (
                <form onSubmit={handleCreateAddress} className="mb-6 p-4 border rounded-xl bg-gray-50/80 space-y-3">
                  <h3 className="font-semibold text-sm text-gray-700">กรอกข้อมูลที่อยู่จัดส่ง</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <input
                      type="text"
                      placeholder="ชื่อ-นามสกุล ผู้รับ *"
                      required
                      value={addressForm.recipientName}
                      onChange={(e) => setAddressForm({ ...addressForm, recipientName: e.target.value })}
                      className="p-2 border rounded-lg w-full"
                    />
                    <input
                      type="text"
                      placeholder="เบอร์โทรศัพท์ *"
                      required
                      value={addressForm.phone}
                      onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                      className="p-2 border rounded-lg w-full"
                    />
                    <input
                      type="text"
                      placeholder="รายละเอียดที่อยู่ (บ้านเลขที่, ซอย, ถนน) *"
                      required
                      value={addressForm.addressLine}
                      onChange={(e) => setAddressForm({ ...addressForm, addressLine: e.target.value })}
                      className="p-2 border rounded-lg w-full sm:col-span-2"
                    />
                    <input
                      type="text"
                      placeholder="แขวง / ตำบล / เขต / อำเภอ"
                      value={addressForm.district}
                      onChange={(e) => setAddressForm({ ...addressForm, district: e.target.value })}
                      className="p-2 border rounded-lg w-full"
                    />
                    <input
                      type="text"
                      placeholder="จังหวัด"
                      value={addressForm.province}
                      onChange={(e) => setAddressForm({ ...addressForm, province: e.target.value })}
                      className="p-2 border rounded-lg w-full"
                    />
                    <input
                      type="text"
                      placeholder="รหัสไปรษณีย์ *"
                      required
                      value={addressForm.postalCode}
                      onChange={(e) => setAddressForm({ ...addressForm, postalCode: e.target.value })}
                      className="p-2 border rounded-lg w-full"
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddressForm(false)}
                      className="px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-200 rounded-lg"
                    >
                      ยกเลิก
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 text-xs bg-primary text-white rounded-lg font-medium"
                    >
                      บันทึกที่อยู่
                    </button>
                  </div>
                </form>
              )}

              {addresses.length === 0 ? (
                <EmptyState message="ยังไม่มีข้อมูลที่อยู่จัดส่ง" subtitle="กดปุ่มเพิ่มที่อยู่เพื่อบันทึกที่สำหรับจัดส่งสินค้า" />
              ) : (
                <div className="space-y-3">
                  {addresses.map((addr) => (
                    <div key={addr._id} className="border p-4 rounded-xl bg-white shadow-sm flex justify-between items-start">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-sm">{addr.recipientName}</p>
                          <span className="text-xs text-gray-500">({addr.phone})</span>
                          {addr.isDefault && (
                            <span className="text-[10px] bg-accent/10 text-accent px-2 py-0.5 rounded-full font-medium">
                              ที่อยู่หลัก
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-600">
                          {addr.addressLine} {addr.district} {addr.province} {addr.postalCode}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        {!addr.isDefault && (
                          <button
                            onClick={() => handleSetDefaultAddress(addr._id)}
                            className="text-xs text-gray-500 hover:text-accent flex items-center gap-1"
                          >
                            <CheckCircle2 size={14} />
                            <span>ตั้งเป็นหลัก</span>
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteAddress(addr._id)}
                          className="text-gray-400 hover:text-red-500 transition-colors p-1"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 5. Order History */}
          {activeTab === 'orders' && (
            <div>
              <h2 className="text-lg font-semibold mb-4">ประวัติการสั่งซื้อ (Order History)</h2>
              {orders.length === 0 ? (
                <EmptyState message="ยังไม่มีประวัติการสั่งซื้อ" subtitle="เริ่มช้อปปิ้งเลยเพื่อดูคำสั่งซื้อของคุณที่นี่" />
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order._id} className="border rounded-xl p-4 bg-white shadow-sm space-y-3">
                      <div className="flex justify-between items-center border-b pb-2">
                        <div>
                          <p className="font-bold text-sm text-primary">Order #{order.orderNumber || order._id}</p>
                          <p className="text-xs text-gray-400">
                            {new Date(order.createdAt).toLocaleDateString('th-TH')}
                          </p>
                        </div>
                        <span className="text-xs px-2.5 py-1 rounded-full font-semibold uppercase bg-blue-50 text-blue-600">
                          {order.status}
                        </span>
                      </div>

                      <div className="space-y-2">
                        {order.items?.map((item, idx) => (
                          <div key={idx} className="flex justify-between items-center text-sm">
                            <span className="text-gray-700">{item.title} ({item.variant}) x{item.quantity}</span>
                            <span className="font-medium">฿{item.lineTotal?.toLocaleString() || (item.unitPrice * item.quantity).toLocaleString()}</span>
                          </div>
                        ))}
                      </div>

                      <div className="border-t pt-2 flex justify-between items-center font-bold text-sm">
                        <span>ยอดรวมสุทธิ</span>
                        <span className="text-accent text-base">฿{order.totalAmount?.toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
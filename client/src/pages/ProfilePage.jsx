import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { User, Heart, BookOpen, MapPin, Package, AlertCircle, Save, KeyRound, Plus, Pencil, Trash2, Crown, Check, Ticket, Sparkles, Tag, Ruler } from 'lucide-react';
import { Card, WishlistSection, MembershipCard, CouponsSection } from '../components';
import { useAuth } from '../context/Auth/useAuth.jsx';
import { useWishlistStore } from '../store/wishlistStore.js';
import { useAddressStore, emptyAddress } from '../store/addressStore.js';
import { useLookbookStore } from '../store/lookbookStore.js';
import { normalizeImageUrl } from '../utils/imageUtils.js';
import { MEMBER_PROMOTIONS } from '../utils/loyaltyUtils.js';
import { SizeProfileSection } from '../components/profile/SizeProfileSection.jsx';

// Component แสดงผลเมื่อไม่มีข้อมูล (Empty State)
const EmptyState = ({ message, subtitle }) => (
  <div className="text-center py-12 border border-dashed border-gray-200 rounded-xl">
    <p className="text-gray-500 font-medium">{message}</p>
    {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
  </div>
);

export const ProfilePage = () => {
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'profile';
  const { user: authUser, updateProfile, changePassword } = useAuth();
  const [activeTab, setActiveTab] = useState(initialTab);
  const [error, setError] = useState(''); // Error state สำหรับกรณี fetch ข้อมูลล้มเหลว
  const [success, setSuccess] = useState('');
  const wishlist = useWishlistStore((state) => state.wishlist);
  const removeFromWishlist = useWishlistStore(
    (state) => state.removeFromWishlist
  );
  const addresses = useAddressStore((state) => state.addresses);
  const addAddress = useAddressStore((state) => state.addAddress);
  const updateAddress = useAddressStore((state) => state.updateAddress);
  const removeAddress = useAddressStore((state) => state.removeAddress);
  const setDefaultAddress = useAddressStore((state) => state.setDefaultAddress);
  const favoriteLookbooks = useLookbookStore((state) => state.favorites);
  const removeFavoriteLookbook = useLookbookStore((state) => state.removeFavorite);

  const user = authUser || { username: 'Customer', email: 'user@example.com' };
  const orders = [];

  const [form, setForm] = useState({
    username: user.username || '',
    email: user.email || '',
    avatar: user.avatar || '',
  });
  const [saving, setSaving] = useState(false);
  const [pwdForm, setPwdForm] = useState({ currentPassword: '', newPassword: '' });
  const [pwdMsg, setPwdMsg] = useState('');
  const [pwdError, setPwdError] = useState('');
  const [addrForm, setAddrForm] = useState(emptyAddress);
  const [editingAddrId, setEditingAddrId] = useState(null);
  const [addrMsg, setAddrMsg] = useState('');
  const [addrError, setAddrError] = useState('');

  const handleProfileChange = (field) => (e) => {
    setSuccess('');
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!authUser) {
      setError('กรุณาเข้าสู่ระบบก่อนแก้ไขข้อมูล');
      return;
    }
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      await updateProfile({
        username: form.username,
        email: form.email,
        avatar: form.avatar,
      });
      setSuccess('บันทึกข้อมูลส่วนตัวสำเร็จ');
    } catch (err) {
      const apiError =
        err?.response?.data?.errors?.[0] || err?.response?.data?.message;
      setError(apiError || 'บันทึกข้อมูลไม่สำเร็จ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!authUser) {
      setError('กรุณาเข้าสู่ระบบก่อนเปลี่ยนรหัสผ่าน');
      return;
    }
    setPwdMsg('');
    setPwdError('');
    try {
      const res = await changePassword(pwdForm);
      setPwdMsg(res?.data?.message || 'เปลี่ยนรหัสผ่านสำเร็จ');
      setPwdForm({ currentPassword: '', newPassword: '' });
    } catch (err) {
      const apiError =
        err?.response?.data?.errors?.[0] || err?.response?.data?.message;
      setPwdError(apiError || 'เปลี่ยนรหัสผ่านไม่สำเร็จ กรุณาลองใหม่อีกครั้ง');
    }
  };

  const handleAddrChange = (field) => (e) => {
    setAddrMsg('');
    setAddrForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const resetAddrForm = () => {
    setAddrForm(emptyAddress);
    setEditingAddrId(null);
    setAddrMsg('');
    setAddrError('');
  };

  const handleEditAddress = (addr) => {
    setAddrError('');
    setAddrMsg('');
    setEditingAddrId(addr.id);
    setAddrForm({
      label: addr.label || '',
      firstName: addr.firstName || '',
      lastName: addr.lastName || '',
      phone: addr.phone || '',
      address: addr.address || '',
      city: addr.city || '',
      state: addr.state || '',
      zipCode: addr.zipCode || '',
      location: addr.location || 'Thailand',
    });
  };

  const handleSaveAddress = (e) => {
    e.preventDefault();
    setAddrError('');
    setAddrMsg('');
    const required = ['firstName', 'lastName', 'phone', 'address', 'city', 'state', 'zipCode'];
    const missing = required.find((key) => !addrForm[key]?.trim());
    if (missing) {
      setAddrError('กรุณากรอกข้อมูลให้ครบทุกช่อง (ชื่อ, นามสกุล, เบอร์โทร, ที่อยู่, เมือง, จังหวัด, รหัสไปรษณีย์)');
      return;
    }
    if (editingAddrId) {
      updateAddress(editingAddrId, addrForm);
      setAddrMsg('อัปเดตที่อยู่เรียบร้อย');
    } else {
      addAddress(addrForm);
      setAddrMsg('บันทึกที่อยู่เรียบร้อย');
    }
    setAddrForm(emptyAddress);
    setEditingAddrId(null);
  };

  const handleRemoveAddress = (id) => {
    removeAddress(id);
    if (editingAddrId === id) {
      resetAddrForm();
    }
  };

  const tabs = [
    { id: 'profile', label: 'ข้อมูลส่วนตัว', icon: User },
    { id: 'membership', label: 'Membership & Loyalty', icon: Crown },
    { id: 'coupons', label: 'คูปองและรางวัล (Vouchers)', icon: Ticket },
    { id: 'size-profile', label: 'Size & Fit', icon: Ruler },
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
              {!authUser ? (
                <EmptyState message="ยังไม่ได้เข้าสู่ระบบ" subtitle="เข้าสู่ระบบเพื่อดูและแก้ไขข้อมูลส่วนตัวของคุณ" />
              ) : (
                <>
                  <MembershipCard user={user} />
                  <form onSubmit={handleSaveProfile} className="space-y-4">
                    {success && (
                      <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
                        <span>{success}</span>
                      </div>
                    )}
                    {error && (
                      <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                        <AlertCircle size={18} className="shrink-0" />
                        <span>{error}</span>
                      </div>
                    )}
                    <div>
                      <label htmlFor="profile-username" className="mb-1 block text-sm font-medium text-gray-600">
                        Username
                      </label>
                      <input
                        id="profile-username"
                        type="text"
                        value={form.username}
                        onChange={handleProfileChange('username')}
                        required
                        minLength={3}
                        className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
                      />
                    </div>
                    <div>
                      <label htmlFor="profile-email" className="mb-1 block text-sm font-medium text-gray-600">
                        Email
                      </label>
                      <input
                        id="profile-email"
                        type="email"
                        value={form.email}
                        onChange={handleProfileChange('email')}
                        required
                        className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
                      />
                    </div>
                    <div>
                      <label htmlFor="profile-avatar" className="mb-1 block text-sm font-medium text-gray-600">
                        รูปโปรไฟล์ (ลิงก์รูปภาพ)
                      </label>
                      <input
                        id="profile-avatar"
                        type="url"
                        value={form.avatar}
                        onChange={handleProfileChange('avatar')}
                        placeholder="https://example.com/avatar.jpg"
                        className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
                      />
                      {form.avatar && (
                        <img
                          src={normalizeImageUrl(form.avatar)}
                          alt="ตัวอย่างรูปโปรไฟล์"
                          className="mt-3 h-20 w-20 rounded-full border border-gray-200 object-cover"
                        />
                      )}
                    </div>
                    <div className="flex items-center gap-3 pt-2">
                      <button
                        type="submit"
                        disabled={saving}
                        className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-white shadow hover:bg-primary-hover transition disabled:opacity-50 cursor-pointer"
                      >
                        <Save size={16} />
                        {saving ? 'กำลังบันทึก…' : 'บันทึกข้อมูล'}
                      </button>
                    </div>
                  </form>

                  <form onSubmit={handleChangePassword} className="mt-10 space-y-4 border-t border-gray-200 pt-6">
                    <h3 className="inline-flex items-center gap-2 text-base font-bold text-primary">
                      <KeyRound size={18} />
                      เปลี่ยนรหัสผ่าน
                    </h3>
                    {pwdMsg && (
                      <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
                        <span>{pwdMsg}</span>
                      </div>
                    )}
                    {pwdError && (
                      <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                        <AlertCircle size={18} className="shrink-0" />
                        <span>{pwdError}</span>
                      </div>
                    )}
                    <div>
                      <label htmlFor="pwd-current" className="mb-1 block text-sm font-medium text-gray-600">
                        รหัสผ่านปัจจุบัน
                      </label>
                      <input
                        id="pwd-current"
                        type="password"
                        value={pwdForm.currentPassword}
                        onChange={(e) =>
                          setPwdForm((prev) => ({
                            ...prev,
                            currentPassword: e.target.value,
                          }))
                        }
                        required
                        autoComplete="current-password"
                        className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
                      />
                    </div>
                    <div>
                      <label htmlFor="pwd-new" className="mb-1 block text-sm font-medium text-gray-600">
                        รหัสผ่านใหม่ (อย่างน้อย 6 ตัวอักษร)
                      </label>
                      <input
                        id="pwd-new"
                        type="password"
                        value={pwdForm.newPassword}
                        onChange={(e) =>
                          setPwdForm((prev) => ({
                            ...prev,
                            newPassword: e.target.value,
                          }))
                        }
                        required
                        minLength={6}
                        autoComplete="new-password"
                        className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
                      />
                    </div>
                    <div className="pt-1">
                      <button
                        type="submit"
                        className="inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-2.5 text-sm font-semibold text-white shadow hover:opacity-90 transition cursor-pointer"
                      >
                        <KeyRound size={16} />
                        เปลี่ยนรหัสผ่าน
                      </button>
                    </div>
                  </form>
                </>
              )}
            </div>
          )}

          {activeTab === 'size-profile' && <SizeProfileSection />}

          {activeTab === 'membership' && (
            <div>
              <h2 className="text-lg font-semibold mb-4">ระดับสมาชิกและสิทธิพิเศษ (Membership & Loyalty)</h2>
              {!authUser ? (
                <EmptyState message="ยังไม่ได้เข้าสู่ระบบ" subtitle="เข้าสู่ระบบเพื่อตรวจสอบระดับสมาชิกและสิทธิพิเศษของคุณ" />
              ) : (
                <div>
                  <MembershipCard user={user} />

                  <div className="mt-8">
                    <h3 className="text-base font-bold text-primary mb-3">เปรียบเทียบสิทธิประโยชน์แต่ละระดับ (Membership Tiers)</h3>
                    <div className="overflow-x-auto rounded-xl border border-gray-200">
                      <table className="w-full text-left text-xs sm:text-sm">
                        <thead className="bg-slate-50 text-gray-700 font-bold border-b border-gray-200">
                          <tr>
                            <th className="p-3">ระดับสมาชิก</th>
                            <th className="p-3">ยอดซื้อสะสม</th>
                            <th className="p-3">ส่วนลด On-top</th>
                            <th className="p-3">คูปองวันเกิด</th>
                            <th className="p-3">สิทธิ์ส่งฟรี</th>
                            <th className="p-3">สิทธิพิเศษเพิ่มเติม</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 text-gray-600">
                          <tr className={user?.membership?.rank === 'MEMBER' ? 'bg-blue-50/50 font-semibold' : ''}>
                            <td className="p-3 font-bold text-slate-800">MEMBER</td>
                            <td className="p-3">฿0</td>
                            <td className="p-3">-</td>
                            <td className="p-3">ลด 5%</td>
                            <td className="p-3">ครบ ฿1,000</td>
                            <td className="p-3">Welcome Coupon ลด 10%</td>
                          </tr>
                          <tr className={user?.membership?.rank === 'BRONZE' ? 'bg-amber-100/40 font-semibold' : ''}>
                            <td className="p-3 font-bold text-amber-700">BRONZE</td>
                            <td className="p-3">฿1,000</td>
                            <td className="p-3 text-emerald-600 font-bold">ลด 3%</td>
                            <td className="p-3">ลด 10%</td>
                            <td className="p-3">ครบ ฿850</td>
                            <td className="p-3">สะสมยอดต่อเนื่อง</td>
                          </tr>
                          <tr className={user?.membership?.rank === 'SILVER' ? 'bg-slate-100/70 font-semibold' : ''}>
                            <td className="p-3 font-bold text-slate-600">SILVER</td>
                            <td className="p-3">฿3,000</td>
                            <td className="p-3 text-emerald-600 font-bold">ลด 5%</td>
                            <td className="p-3">ลด 15%</td>
                            <td className="p-3">ครบ ฿700</td>
                            <td className="p-3">Early Access 12 ชม.</td>
                          </tr>
                          <tr className={user?.membership?.rank === 'GOLD' ? 'bg-amber-50/70 font-semibold' : ''}>
                            <td className="p-3 font-bold text-amber-600">GOLD</td>
                            <td className="p-3">฿8,000</td>
                            <td className="p-3 text-emerald-600 font-bold">ลด 10%</td>
                            <td className="p-3">ลด 20%</td>
                            <td className="p-3 text-blue-600 font-bold">ส่งฟรี ไม่มีขั้นต่ำ</td>
                            <td className="p-3">Early Access 24 ชม.</td>
                          </tr>
                          <tr className={user?.membership?.rank === 'PLATINUM' ? 'bg-purple-50/70 font-semibold' : ''}>
                            <td className="p-3 font-bold text-purple-700">PLATINUM</td>
                            <td className="p-3">฿20,000</td>
                            <td className="p-3 text-emerald-600 font-bold">ลด 15%</td>
                            <td className="p-3">ลด 25% + Gift</td>
                            <td className="p-3 text-blue-600 font-bold">ส่งฟรี + Priority</td>
                            <td className="p-3">Early Access 48 ชม. + VIP Care</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Member Exclusive Promotions (Item 10) */}
                  <div className="mt-8 pt-6 border-t border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-base font-bold text-primary flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-amber-500" />
                          <span>โปรโมชั่นพิเศษสำหรับสมาชิก (Member Exclusive Campaigns)</span>
                        </h3>
                        <p className="text-xs text-gray-500 mt-0.5">
                          สิทธิประโยชน์และแคมเปญพิเศษที่จัดขึ้นสำหรับสมาชิก OCCASION LOYALTY CLUB โดยเฉพาะ
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {MEMBER_PROMOTIONS.map((promo) => (
                        <div
                          key={promo.id}
                          className="rounded-2xl border border-gray-200 p-4 bg-gradient-to-br from-white to-gray-50/80 shadow-2xs hover:shadow-xs transition flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex items-center justify-between gap-2 mb-2">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-primary text-white">
                                {promo.tag}
                              </span>
                              <span className="text-[10px] font-semibold text-gray-500">
                                {promo.period}
                              </span>
                            </div>
                            <h4 className="text-sm font-bold text-gray-900 mt-1">
                              {promo.title}
                            </h4>
                            <p className="text-xs text-gray-600 mt-1 line-clamp-3">
                              {promo.description}
                            </p>
                          </div>
                          <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500">
                            <span className="font-semibold text-amber-700">{promo.badge}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'coupons' && (
            <CouponsSection user={user} />
          )}

          {activeTab === 'wishlist' && (
            <WishlistSection items={wishlist} onRemove={removeFromWishlist} />
          )}

          {/* Favorite Lookbooks */}
          {activeTab === 'lookbooks' && (
            <div>
              <h2 className="text-lg font-semibold mb-4">Favorite Lookbooks</h2>
              {favoriteLookbooks.length === 0 ? (
                <EmptyState message="ยังไม่มี Lookbook ที่บันทึกไว้" subtitle="กดหัวใจที่ลุคที่คุณชอบเพื่อบันทึกไว้ดูภายหลัง" />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {favoriteLookbooks.map((item) => (
                    <div
                      key={item.id}
                      className="flex gap-4 rounded-xl border border-gray-200 bg-white p-3"
                    >
                      <Link to={`/lookbook/${item.id}`} className="shrink-0">
                        <img
                          src={normalizeImageUrl(item.image)}
                          alt={item.nameTh || item.name}
                          className="h-24 w-20 rounded-lg object-cover"
                        />
                      </Link>
                      <div className="flex min-w-0 flex-1 flex-col">
                        <Link
                          to={`/lookbook/${item.id}`}
                          className="line-clamp-1 block text-sm font-bold text-primary hover:text-accent transition"
                        >
                          {item.nameTh || item.name}
                        </Link>
                        <p className="text-xs text-secondary">{item.name}</p>
                        {item.concept && (
                          <p className="mt-1 line-clamp-2 text-xs text-gray-500">
                            {item.concept}
                          </p>
                        )}
                        <div className="mt-auto flex items-center justify-between pt-2">
                          <span className="text-sm font-extrabold text-primary">
                            ฿{(item.setPrice || 0).toLocaleString()}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeFavoriteLookbook(item.id)}
                            className="rounded-full p-2 text-red-500 hover:bg-red-50 transition cursor-pointer"
                            title="ลบออกจากลุคโปรด"
                            aria-label="ลบออกจากลุคโปรด"
                          >
                            <Heart size={18} fill="currentColor" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 4. Shipping Addresses */}
          {activeTab === 'addresses' && (
            <div>
              <h2 className="text-lg font-semibold mb-4">ที่อยู่จัดส่ง (Shipping Addresses)</h2>

              {addrMsg && (
                <div className="mb-4 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
                  <span>{addrMsg}</span>
                </div>
              )}
              {addrError && (
                <div className="mb-4 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                  <AlertCircle size={18} className="shrink-0" />
                  <span>{addrError}</span>
                </div>
              )}

              {addresses.length === 0 ? (
                <EmptyState message="ยังไม่มีข้อมูลที่อยู่จัดส่ง" subtitle="เพิ่มที่อยู่สำหรับใช้จัดส่งสินค้าได้เลยด้านล่าง" />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {addresses.map((addr) => (
                    <div
                      key={addr.id}
                      className="rounded-xl border border-gray-200 bg-white p-4"
                    >
                      <div className="mb-2 flex items-center justify-between gap-2">
                        <span className="flex items-center gap-2 text-sm font-bold text-primary">
                          <MapPin size={16} />
                          {addr.label || 'ที่อยู่'}
                        </span>
                        {addr.isDefault && (
                          <span className="rounded-full bg-accent/10 px-2.5 py-0.5 text-[11px] font-bold text-accent">
                            ค่าเริ่มต้น
                          </span>
                        )}
                      </div>
                      <div className="space-y-0.5 text-sm text-gray-600">
                        <p className="font-semibold text-gray-800">
                          {addr.firstName} {addr.lastName}
                        </p>
                        <p>{addr.address}</p>
                        <p>
                          {addr.city} {addr.state} {addr.zipCode}
                        </p>
                        <p>{addr.location}</p>
                        <p className="text-secondary">{addr.phone}</p>
                      </div>
                      <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-gray-100 pt-3">
                        {!addr.isDefault && (
                          <button
                            type="button"
                            onClick={() => setDefaultAddress(addr.id)}
                            className="text-xs font-semibold text-secondary hover:text-accent transition cursor-pointer"
                          >
                            ตั้งเป็นค่าเริ่มต้น
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleEditAddress(addr)}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-accent transition cursor-pointer"
                        >
                          <Pencil size={13} />
                          แก้ไข
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveAddress(addr.id)}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-red-500 hover:text-red-600 transition cursor-pointer"
                        >
                          <Trash2 size={13} />
                          ลบ
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <form
                onSubmit={handleSaveAddress}
                className="mt-6 space-y-4 rounded-xl border border-gray-200 bg-white p-5"
              >
                <h3 className="flex items-center gap-2 text-base font-bold text-primary">
                  <Plus size={18} />
                  {editingAddrId ? 'แก้ไขที่อยู่' : 'เพิ่มที่อยู่ใหม่'}
                </h3>
                <div>
                  <label htmlFor="addr-label" className="mb-1 block text-sm font-medium text-gray-600">
                    ชื่อที่อยู่ (เช่น บ้าน / ที่ทำงาน)
                  </label>
                  <input
                    id="addr-label"
                    type="text"
                    value={addrForm.label}
                    onChange={handleAddrChange('label')}
                    placeholder="บ้าน"
                    className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="addr-first" className="mb-1 block text-sm font-medium text-gray-600">
                      ชื่อ *
                    </label>
                    <input
                      id="addr-first"
                      type="text"
                      value={addrForm.firstName}
                      onChange={handleAddrChange('firstName')}
                      required
                      placeholder="สมชาย"
                      className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
                    />
                  </div>
                  <div>
                    <label htmlFor="addr-last" className="mb-1 block text-sm font-medium text-gray-600">
                      นามสกุล *
                    </label>
                    <input
                      id="addr-last"
                      type="text"
                      value={addrForm.lastName}
                      onChange={handleAddrChange('lastName')}
                      required
                      placeholder="ใจดี"
                      className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="addr-phone" className="mb-1 block text-sm font-medium text-gray-600">
                    เบอร์โทรศัพท์ *
                  </label>
                  <input
                    id="addr-phone"
                    type="tel"
                    value={addrForm.phone}
                    onChange={handleAddrChange('phone')}
                    required
                    placeholder="0812345678"
                    className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="addr-line" className="mb-1 block text-sm font-medium text-gray-600">
                    ที่อยู่ (บ้านเลขที่, ถนน, ซอย) *
                  </label>
                  <input
                    id="addr-line"
                    type="text"
                    value={addrForm.address}
                    onChange={handleAddrChange('address')}
                    required
                    placeholder="123/45 ซอยสุขุมวิท 21 ถนนสุขุมวิท"
                    className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="addr-city" className="mb-1 block text-sm font-medium text-gray-600">
                      เมือง / อำเภอ *
                    </label>
                    <input
                      id="addr-city"
                      type="text"
                      value={addrForm.city}
                      onChange={handleAddrChange('city')}
                      required
                      placeholder="เขตวัฒนา"
                      className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
                    />
                  </div>
                  <div>
                    <label htmlFor="addr-state" className="mb-1 block text-sm font-medium text-gray-600">
                      จังหวัด *
                    </label>
                    <select
                      id="addr-state"
                      value={addrForm.state}
                      onChange={handleAddrChange('state')}
                      required
                      className="w-full cursor-pointer rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
                    >
                      <option value="">เลือกจังหวัด...</option>
                      <option value="Bangkok">กรุงเทพมหานคร</option>
                      <option value="Chiang Mai">เชียงใหม่</option>
                      <option value="Phuket">ภูเก็ต</option>
                      <option value="Nonthaburi">นนทบุรี</option>
                      <option value="Samut Prakan">สมุทรปราการ</option>
                      <option value="Other">จังหวัดอื่นๆ</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="addr-zip" className="mb-1 block text-sm font-medium text-gray-600">
                      รหัสไปรษณีย์ *
                    </label>
                    <input
                      id="addr-zip"
                      type="text"
                      value={addrForm.zipCode}
                      onChange={handleAddrChange('zipCode')}
                      required
                      placeholder="10110"
                      className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="addr-location" className="mb-1 block text-sm font-medium text-gray-600">
                    ประเทศ
                  </label>
                  <select
                    id="addr-location"
                    value={addrForm.location}
                    onChange={handleAddrChange('location')}
                    className="w-full cursor-pointer rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
                  >
                    <option value="Thailand">ประเทศไทย (Thailand)</option>
                    <option value="United States">สหรัฐอเมริกา (United States)</option>
                    <option value="Singapore">สิงคโปร์ (Singapore)</option>
                    <option value="Japan">ญี่ปุ่น (Japan)</option>
                    <option value="United Kingdom">สหราชอาณาจักร (United Kingdom)</option>
                    <option value="Australia">ออสเตรเลีย (Australia)</option>
                  </select>
                </div>
                <div className="flex items-center gap-3 pt-1">
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-white shadow hover:bg-primary-hover transition cursor-pointer"
                  >
                    <Save size={16} />
                    {editingAddrId ? 'อัปเดตที่อยู่' : 'บันทึกที่อยู่'}
                  </button>
                  {editingAddrId && (
                    <button
                      type="button"
                      onClick={resetAddrForm}
                      className="rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-500 hover:bg-gray-100 transition cursor-pointer"
                    >
                      ยกเลิก
                    </button>
                  )}
                </div>
              </form>
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

import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { User, Heart, BookOpen, MapPin, Package, Ruler, Crown, Ticket, Loader2 } from 'lucide-react';
import { Card } from '../../components';
import { useAuth } from '../../context/Auth/useAuth.jsx';
import { UserInfoSection } from './UserInfoSection.jsx';
import { WishlistSection } from './WishlistSection.jsx';
import { LookbooksSection } from './LookbooksSection.jsx';
import { AddressSection } from './AddressSection.jsx';
import { OrderHistorySection } from './OrderHistorySection.jsx';
import { SizeProfileSection } from './SizeProfileSection.jsx';
import { MembershipSection } from './MembershipSection.jsx';
import { CouponsSection } from './CouponsSection.jsx';

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

export const ProfilePage = () => {
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'profile';
  const { loading, user } = useAuth();
  const [activeTab, setActiveTab] = useState(initialTab);

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
          {activeTab === 'profile' && <UserInfoSection />}
          {activeTab === 'membership' && <MembershipSection user={user} />}
          {activeTab === 'coupons' && <CouponsSection user={user} />}
          {activeTab === 'size-profile' && <SizeProfileSection />}
          {activeTab === 'wishlist' && <WishlistSection />}
          {activeTab === 'lookbooks' && <LookbooksSection />}
          {activeTab === 'addresses' && <AddressSection />}
          {activeTab === 'orders' && <OrderHistorySection />}
        </Card>
      </div>
    </div>
  );
};
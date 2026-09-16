import React from 'react';

export const UserInfoSection = ({ user }) => (
  <div className="space-y-4">
    <h3 className="text-lg font-bold text-primary border-b border-occasion-border/40 pb-2">ข้อมูลส่วนตัว</h3>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
      <div className="p-3 bg-background rounded-lg border border-occasion-border/30">
        <span className="text-xs text-secondary block">Username</span>
        <span className="font-semibold text-primary">{user?.username || 'ranger01'}</span>
      </div>
      <div className="p-3 bg-background rounded-lg border border-occasion-border/30">
        <span className="text-xs text-secondary block">Email</span>
        <span className="font-semibold text-primary">{user?.email || 'customer@example.com'}</span>
      </div>
    </div>
  </div>
);
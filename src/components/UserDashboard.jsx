import React from 'react';
import UserProfileView from './UserProfileView';

export default function UserDashboard({ session, storeName, logoSrc, onLogout }) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-6">
      <UserProfileView
        session={session}
        onLogout={onLogout}
        onBack={() => {
          if (typeof window !== 'undefined' && window.history.length > 1) {
            window.history.back();
          }
        }}
      />
    </div>
  );
}

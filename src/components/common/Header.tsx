import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import { formatStandardTime } from '../../utils/timeFormat';
import { Bell, GraduationCap, CheckCircle2, AlertTriangle, ShieldCheck, ChevronDown, Check, LogOut, User } from 'lucide-react';

interface HeaderProps {
  onOpenLogin: () => void;
  onSignOut: () => void;
  isLoggedIn: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onOpenLogin, onSignOut, isLoggedIn }) => {
  const {
    currentUser,
    currentRole,
    switchRole,
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    setActiveTab,
    settings
  } = useApp();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const roles: { role: UserRole; label: string }[] = [
    { role: 'student', label: 'Student' },
    { role: 'panelist', label: 'Panelist' },
    { role: 'adviser', label: 'Adviser' },
    { role: 'admin', label: 'Admin' }
  ];

  const handleRoleSelect = (role: UserRole) => {
    switchRole(role);
    setIsUserMenuOpen(false);
  };

  // Filter notifications relevant to current user
  const userNotifications = notifications.filter(
    n => n.userId === 'all' || n.userId === currentUser.id || n.roleTarget === currentRole
  );
  const unreadCount = userNotifications.filter(n => !n.isRead).length;

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-2xs">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Zone - 1 line */}
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center px-2.5 py-1 rounded-md bg-[#FFD100] text-[#005696] shadow-xs font-black text-lg tracking-tight select-none">
              STI
            </div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold tracking-tight text-slate-900">
                STI College Global City
              </span>
              <span className="hidden sm:inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                Defense Portal
              </span>
            </div>
          </div>

          {/* Right Action Zone: Notifications & User profile */}
          <div className="flex items-center gap-3">
            {/* Notification Popover */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-[#005696]"
                aria-label="View notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white font-mono-numbers animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {isNotifOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-50">
                  <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">Notifications</h4>
                      <p className="text-xs text-slate-500">{unreadCount} unread alerts</p>
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllNotificationsAsRead}
                        className="text-xs text-[#005696] hover:underline font-medium"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                    {userNotifications.length === 0 ? (
                      <div className="p-6 text-center text-sm text-slate-500">
                        No notifications to display.
                      </div>
                    ) : (
                      userNotifications.slice(0, 6).map(notif => (
                        <div
                          key={notif.id}
                          onClick={() => {
                            markNotificationAsRead(notif.id);
                            if (notif.linkTab) setActiveTab(notif.linkTab);
                            setIsNotifOpen(false);
                          }}
                          className={`p-3 text-left transition-colors cursor-pointer hover:bg-slate-50 ${
                            !notif.isRead ? 'bg-blue-50/40' : ''
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="text-xs font-semibold text-slate-900 line-clamp-1">
                              {notif.title}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono-numbers shrink-0">
                              {formatStandardTime(notif.time)}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                            {notif.message}
                          </p>
                          <span className="text-[10px] text-slate-400 mt-1 inline-block font-mono-numbers">
                            {notif.date}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="p-2.5 bg-slate-50 border-t border-slate-100 text-center">
                    <button
                      onClick={() => {
                        setActiveTab('Notifications');
                        setIsNotifOpen(false);
                      }}
                      className="text-xs font-semibold text-[#005696] hover:text-[#004273]"
                    >
                      View All Notifications →
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* User Profile dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200 cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full bg-[#00335e] text-[#FED100] flex items-center justify-center font-bold shadow-2xs border border-slate-200 shrink-0">
                  <User className="w-4 h-4" />
                </div>
                <div className="hidden md:block text-left">
                  <div className="text-xs font-bold text-slate-900 line-clamp-1 max-w-[130px]">
                    {currentUser.name}
                  </div>
                  <div className="text-[10px] font-semibold text-[#005696] uppercase tracking-wide">
                    {currentRole}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-1 z-50">
                  <div className="px-4 py-3 border-b border-slate-100">
                    <div className="flex items-center gap-3 mb-1.5">
                      <div className="w-9 h-9 rounded-full bg-[#00335e] text-[#FED100] flex items-center justify-center shrink-0 border border-slate-200">
                        <User className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Signed in as</p>
                        <p className="text-xs font-bold text-slate-900 truncate">{currentUser.name}</p>
                        <p className="text-[11px] text-slate-500 font-mono-numbers truncate">{currentUser.email}</p>
                      </div>
                    </div>
                    {currentUser.studentNumber && (
                      <p className="text-xs text-blue-700 font-mono-numbers mt-1">
                        SN: {currentUser.studentNumber}
                      </p>
                    )}
                    {currentUser.employeeId && (
                      <p className="text-xs text-slate-600 font-mono-numbers mt-1">
                        ID: {currentUser.employeeId}
                      </p>
                    )}
                  </div>

                  <div className="px-3 py-2 border-b border-slate-100">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      Switch Role
                    </p>
                    <div className="grid grid-cols-2 gap-1">
                      {roles.map(r => (
                        <button
                          key={r.role}
                          onClick={() => handleRoleSelect(r.role)}
                          className={`px-2.5 py-1.5 text-xs rounded-md text-left transition-colors flex items-center justify-between ${
                            currentRole === r.role
                              ? 'bg-[#005696] text-white font-semibold'
                              : 'text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          {r.label}
                          {currentRole === r.role && <Check className="w-3 h-3 text-[#FED100]" />}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => {
                        setActiveTab('Profile');
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full px-4 py-2 text-xs text-slate-700 hover:bg-slate-100 text-left font-medium"
                    >
                      View Profile
                    </button>
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        onSignOut();
                      }}
                      className="w-full px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 text-left flex items-center gap-1.5 font-medium"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Direct Sign Out Button */}
            <button
              type="button"
              onClick={onSignOut}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-rose-700 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-200/80 rounded-lg transition-colors cursor-pointer"
              title="Sign Out to Login Page"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

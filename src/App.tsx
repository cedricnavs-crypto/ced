import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { LoginView } from './components/auth/LoginView';

// Student Views
import { StudentDashboard } from './components/student/StudentDashboard';
import { MyDefenseView } from './components/student/MyDefenseView';
import { MyTitleView } from './components/student/MyTitleView';
import { TitleHistoryView } from './components/student/TitleHistoryView';
import { DefenseStatusView } from './components/student/DefenseStatusView';

// Panelist Views
import { PanelistDashboard } from './components/panelist/PanelistDashboard';
import { AssignedStudentsView } from './components/panelist/AssignedStudentsView';
import { AvailabilityManagerView } from './components/panelist/AvailabilityManagerView';
import { PanelDefenseHistoryView } from './components/panelist/PanelDefenseHistoryView';

// Adviser Views
import { AdviserDashboard } from './components/adviser/AdviserDashboard';
import { MyStudentsView } from './components/adviser/MyStudentsView';
import { AdviseeTitlesView } from './components/adviser/AdviseeTitlesView';
import { AdviseeDefenseHistoryView } from './components/adviser/AdviseeDefenseHistoryView';

// Admin Views
import { AdminDashboard } from './components/admin/AdminDashboard';
import { StudentManagement } from './components/admin/StudentManagement';
import { AdviserManagement } from './components/admin/AdviserManagement';
import { PanelistManagement } from './components/admin/PanelistManagement';
import { RoomManagement } from './components/admin/RoomManagement';
import { CapstoneTitleManagement } from './components/admin/CapstoneTitleManagement';
import { TitleHistoryManagement } from './components/admin/TitleHistoryManagement';
import { ReportsView } from './components/admin/ReportsView';
import { UserManagement } from './components/admin/UserManagement';
import { SettingsView } from './components/admin/SettingsView';

// Common Views
import { NotificationsView } from './components/common/NotificationsView';
import { ProfileView } from './components/common/ProfileView';
import { DefenseCalendarDashboard } from './components/calendar/DefenseCalendarDashboard';
import { BackButton } from './components/common/BackButton';

import { Menu, ChevronRight } from 'lucide-react';

const MainLayout: React.FC = () => {
  const { currentRole, activeTab, setActiveTab } = useApp();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    localStorage.setItem('sti_capstone_logged_in', 'true');
  };

  const handleSignOut = () => {
    setIsLoggedIn(false);
    localStorage.setItem('sti_capstone_logged_in', 'false');
  };

  if (!isLoggedIn) {
    return <LoginView onSuccess={handleLoginSuccess} />;
  }

  const isDefenseScheduleRoute = [
    'Defense Schedule',
    'Defense Schedules',
    'Defense Calendar',
    'My Defense',
    'My Schedule'
  ].includes(activeTab);

  const renderContent = () => {
    if (activeTab === 'Notifications') return <NotificationsView />;
    if (activeTab === 'Profile') return <ProfileView />;

    if (isDefenseScheduleRoute) {
      if (currentRole === 'student') {
        return <MyDefenseView />;
      }
      // Admin, Adviser, and Panelist all view all group defense schedules
      return (
        <DefenseCalendarDashboard
          defaultScope="all"
          initialDisplayMode={activeTab === 'Defense Calendar' ? 'calendar' : 'table'}
          onBackToDashboard={() => setActiveTab('Dashboard')}
        />
      );
    }

    // 1. Student Views
    if (currentRole === 'student') {
      switch (activeTab) {
        case 'Dashboard':
          return <StudentDashboard />;
        case 'Capstone Titles':
        case 'My Title':
          return <MyTitleView />;
        case 'Title History':
          return <TitleHistoryView />;
        case 'Defense Status':
          return <DefenseStatusView />;
        default:
          return <StudentDashboard />;
      }
    }

    // 2. Panelist Views
    if (currentRole === 'panelist') {
      switch (activeTab) {
        case 'Dashboard':
          return <PanelistDashboard />;
        case 'Assigned Defense':
        case 'Assigned Students':
          return <AssignedStudentsView />;
        case 'Availability':
          return <AvailabilityManagerView />;
        case 'Defense History':
          return <PanelDefenseHistoryView />;
        default:
          return <PanelistDashboard />;
      }
    }

    // 3. Adviser Views
    if (currentRole === 'adviser') {
      switch (activeTab) {
        case 'Dashboard':
          return <AdviserDashboard />;
        case 'Handled Groups':
        case 'My Students':
          return <MyStudentsView />;
        case 'Capstone Titles':
          return <AdviseeTitlesView />;
        case 'Defense History':
          return <AdviseeDefenseHistoryView />;
        default:
          return <AdviserDashboard />;
      }
    }

    // 4. Admin Views
    if (currentRole === 'admin') {
      switch (activeTab) {
        case 'Dashboard':
          return <AdminDashboard />;
        case 'Students / Programs':
        case 'Students & Programs':
        case 'Students':
        case 'Programs':
          return <StudentManagement />;
        case 'Advisers':
          return <AdviserManagement />;
        case 'Panelists':
          return <PanelistManagement />;
        case 'Room Availability':
        case 'Rooms':
          return <RoomManagement />;
        case 'Capstone Titles':
          return <CapstoneTitleManagement />;
        case 'Title History':
          return <TitleHistoryManagement />;
        case 'Reports & Analytics':
        case 'Reports':
          return <ReportsView />;
        case 'User Management':
          return <UserManagement />;
        case 'Settings':
          return <SettingsView />;
        default:
          return <AdminDashboard />;
      }
    }

    return <StudentDashboard />;
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Header
        isLoggedIn={true}
        onOpenLogin={handleSignOut}
        onSignOut={handleSignOut}
      />

      <div className="flex-1 flex">
        <Sidebar
          isMobileOpen={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />

        <main className="flex-1 lg:pl-64 flex flex-col min-w-0">
          {/* Mobile sub-bar */}
          <div className="lg:hidden bg-white border-b border-slate-200 px-3 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsMobileSidebarOpen(true)}
                className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
              >
                <Menu className="w-4 h-4 text-[#005696]" />
                <span>Menu</span>
              </button>
              {activeTab !== 'Dashboard' && (
                <BackButton label="Back" variant="subtle" />
              )}
            </div>

            <div className="flex items-center gap-1 text-xs text-slate-600 font-medium">
              <span className="capitalize text-slate-500">{currentRole}</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-bold text-slate-900 truncate max-w-[140px]">{activeTab}</span>
            </div>
          </div>

          {/* Desktop breadcrumb bar */}
          <div className="hidden lg:flex items-center justify-between px-8 py-2.5 bg-white border-b border-slate-200 text-xs">
            <div className="flex items-center gap-3">
              {activeTab !== 'Dashboard' && (
                <BackButton label="Back" toDashboard={false} />
              )}
              <div className="flex items-center gap-2 text-slate-500">
                <button
                  type="button"
                  onClick={() => setActiveTab('Dashboard')}
                  className={`font-semibold capitalize hover:text-[#005696] cursor-pointer transition-colors ${
                    activeTab === 'Dashboard' ? 'text-slate-900 font-bold' : 'text-slate-500'
                  }`}
                >
                  {currentRole} Portal
                </button>
                {activeTab !== 'Dashboard' && (
                  <>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                    <span className="font-semibold text-[#005696]">{activeTab}</span>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleSignOut}
                className="text-xs text-rose-600 hover:text-rose-800 font-semibold cursor-pointer hover:underline"
              >
                Sign Out
              </button>
              <span className="text-slate-300">·</span>
              <span className="text-xs text-slate-400">
                STI College Global City
              </span>
            </div>
          </div>

          <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}

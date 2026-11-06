import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  CalendarDays,
  FileText,
  History,
  Bell,
  UserCheck,
  Clock,
  Users,
  GraduationCap,
  Building2,
  FolderKanban,
  BarChart3,
  UserCog,
  Settings,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';

interface SidebarProps {
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isMobileOpen, onCloseMobile }) => {
  const {
    currentRole,
    activeTab,
    setActiveTab,
    notifications,
    titles,
    schedules,
    currentUser
  } = useApp();

  const unreadNotifs = notifications.filter(
    n => !n.isRead && (n.userId === 'all' || n.userId === currentUser.id || n.roleTarget === currentRole)
  ).length;

  const pendingTitlesCount = titles.filter(t => t.status === 'Pending').length;
  const upcomingDefensesCount = schedules.filter(
    s => s.status === 'Scheduled' || s.status === 'Upcoming' || s.status === 'Ongoing'
  ).length;

  const getNavItems = () => {
    switch (currentRole) {
      case 'student':
        return [
          { name: 'Dashboard', icon: LayoutDashboard },
          { name: 'Notifications', icon: Bell, badge: unreadNotifs > 0 ? `${unreadNotifs}` : undefined },
          { name: 'Capstone Titles', icon: FileText },
          { name: 'Defense Schedule', icon: CalendarDays },
          { name: 'Defense Status', icon: ShieldCheck },
          { name: 'Profile', icon: UserCheck }
        ];

      case 'panelist':
        return [
          { name: 'Dashboard', icon: LayoutDashboard },
          { name: 'Notifications', icon: Bell, badge: unreadNotifs > 0 ? `${unreadNotifs}` : undefined },
          { name: 'Defense Schedule', icon: CalendarDays },
          { name: 'Availability', icon: Clock },
          { name: 'Assigned Defense', icon: Users },
          { name: 'Defense History', icon: History },
          { name: 'Profile', icon: UserCheck }
        ];

      case 'adviser':
        return [
          { name: 'Dashboard', icon: LayoutDashboard },
          { name: 'Notifications', icon: Bell, badge: unreadNotifs > 0 ? `${unreadNotifs}` : undefined },
          { name: 'Defense Schedule', icon: CalendarDays },
          { name: 'Handled Groups', icon: Users },
          { name: 'Capstone Titles', icon: FileText },
          { name: 'Defense History', icon: History },
          { name: 'Profile', icon: UserCheck }
        ];

      case 'admin':
        return [
          { name: 'Dashboard', icon: LayoutDashboard },
          { name: 'Notifications', icon: Bell, badge: unreadNotifs > 0 ? `${unreadNotifs}` : undefined },
          {
            name: 'Defense Schedule',
            icon: CalendarDays,
            badge: upcomingDefensesCount > 0 ? `${upcomingDefensesCount}` : undefined
          },
          { name: 'Students / Programs', icon: FolderKanban },
          { name: 'Advisers', icon: GraduationCap },
          { name: 'Panelists', icon: UserCheck },
          { name: 'Room Availability', icon: Building2 },
          {
            name: 'Capstone Titles',
            icon: FileText,
            badge: pendingTitlesCount > 0 ? `${pendingTitlesCount}` : undefined
          },
          { name: 'Reports & Analytics', icon: BarChart3 },
          { name: 'User Management', icon: UserCog },
          { name: 'Settings', icon: Settings }
        ];

      default:
        return [];
    }
  };

  const navItems = getNavItems();

  const roleLabels: Record<string, { title: string; subtitle: string }> = {
    student: { title: 'Student Portal', subtitle: 'Capstone Candidate' },
    panelist: { title: 'Panelist Console', subtitle: 'Defense Evaluation' },
    adviser: { title: 'Adviser Center', subtitle: 'Faculty Supervision' },
    admin: { title: 'Admin Directorate', subtitle: 'Coordinator Console' }
  };

  const currentRoleInfo = roleLabels[currentRole] || { title: 'Portal', subtitle: '' };

  const scheduleAliases = ['Defense Schedule', 'Defense Schedules', 'Defense Calendar', 'My Defense', 'My Schedule'];
  const studentProgramAliases = ['Students / Programs', 'Students & Programs', 'Students', 'Programs'];
  const roomAliases = ['Room Availability', 'Rooms'];
  const reportAliases = ['Reports & Analytics', 'Reports'];
  const handledGroupsAliases = ['Handled Groups', 'My Students'];
  const assignedDefenseAliases = ['Assigned Defense', 'Assigned Students'];
  const studentTitleAliases = ['Capstone Titles', 'My Title', 'Title History'];

  const checkIsActive = (itemName: string) => {
    if (activeTab === itemName) return true;
    if (itemName === 'Defense Schedule' && scheduleAliases.includes(activeTab)) return true;
    if (itemName === 'Students / Programs' && studentProgramAliases.includes(activeTab)) return true;
    if (itemName === 'Room Availability' && roomAliases.includes(activeTab)) return true;
    if (itemName === 'Reports & Analytics' && reportAliases.includes(activeTab)) return true;
    if (itemName === 'Handled Groups' && handledGroupsAliases.includes(activeTab)) return true;
    if (itemName === 'Assigned Defense' && assignedDefenseAliases.includes(activeTab)) return true;
    if (currentRole === 'student' && itemName === 'Capstone Titles' && studentTitleAliases.includes(activeTab)) {
      return true;
    }
    return false;
  };

  return (
    <>
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed top-16 bottom-0 left-0 z-40 w-64 bg-[#002847] text-slate-200 border-r border-slate-800 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="px-5 py-4 bg-[#001d34] border-b border-white/10">
          <div className="text-xs font-bold tracking-wide text-[#FED100]">
            {currentRoleInfo.title}
          </div>
          <div className="text-xs text-slate-300 font-medium truncate mt-0.5">
            {currentRoleInfo.subtitle}
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = checkIsActive(item.name);

            return (
              <button
                key={item.name}
                onClick={() => {
                  setActiveTab(item.name);
                  onCloseMobile();
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-colors cursor-pointer group ${
                  isActive
                    ? 'bg-[#005696] text-white font-semibold shadow-2xs'
                    : 'text-slate-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-colors ${
                      isActive ? 'text-[#FED100]' : 'text-slate-400 group-hover:text-slate-200'
                    }`}
                  />
                  <span className="truncate">{item.name}</span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  {item.badge && (
                    <span
                      className={`px-1.5 py-0.5 text-[10px] tabular-nums rounded font-bold ${
                        isActive
                          ? 'bg-[#FED100] text-slate-950'
                          : 'bg-white/15 text-slate-200'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                  {isActive && <ChevronRight className="w-3.5 h-3.5 text-[#FED100]" />}
                </div>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10 bg-[#001d34] text-[11px] text-slate-400">
          <p className="font-semibold text-slate-200">STI College Global City</p>
          <p className="text-[10px] text-slate-400 mt-0.5">
            University Parkway, BGC Taguig
          </p>
        </div>
      </aside>
    </>
  );
};

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import { BackButton } from './BackButton';
import { formatStandardTime } from '../../utils/timeFormat';
import {
  Bell,
  Calendar,
  FileText,
  Building2,
  AlertCircle,
  Megaphone,
  Check,
  Search,
  Send,
  Plus,
  X
} from 'lucide-react';

export const NotificationsView: React.FC = () => {
  const {
    notifications,
    currentUser,
    currentRole,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    sendAnnouncement,
    setActiveTab
  } = useApp();

  const [filterType, setFilterType] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');

  // Admin announcement form state
  const [showPostForm, setShowPostForm] = useState(currentRole === 'admin');
  const [noteTitle, setNoteTitle] = useState('');
  const [noteMessage, setNoteMessage] = useState('');
  const [targetAudience, setTargetAudience] = useState<UserRole | 'all'>('all');
  const [postedBanner, setPostedBanner] = useState('');

  const userNotifs =
    currentRole === 'admin'
      ? notifications
      : notifications.filter(
          n => n.userId === 'all' || n.userId === currentUser.id || n.roleTarget === currentRole
        );

  const filtered = userNotifs.filter(n => {
    const matchesSearch =
      n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'All' || n.type === filterType;
    return matchesSearch && matchesType;
  });

  const unreadCount = userNotifs.filter(n => !n.isRead).length;

  const handlePostAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteTitle.trim() || !noteMessage.trim()) return;
    sendAnnouncement(noteTitle.trim(), noteMessage.trim(), targetAudience);
    setNoteTitle('');
    setNoteMessage('');
    setPostedBanner('Important note / update posted to selected recipients.');
    setTimeout(() => setPostedBanner(''), 3500);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'defense':
        return <Calendar className="w-4 h-4 text-blue-600" />;
      case 'title':
        return <FileText className="w-4 h-4 text-emerald-600" />;
      case 'room':
        return <Building2 className="w-4 h-4 text-purple-600" />;
      case 'announcement':
        return <Megaphone className="w-4 h-4 text-amber-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-[#005696]" />;
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-4">
        <BackButton label="Back to Dashboard" variant="subtle" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-[#005696]" />
              <h1 className="text-xl font-bold text-slate-900">Notifications & Updates</h1>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Important notes, defense schedule updates, and capstone announcements.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {currentRole === 'admin' && (
              <button
                type="button"
                onClick={() => setShowPostForm(v => !v)}
                className="px-3.5 py-2 text-xs font-semibold bg-[#005696] text-white hover:bg-[#004478] rounded-lg flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                {showPostForm ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                <span>{showPostForm ? 'Hide Post Form' : 'Post Important Note'}</span>
              </button>
            )}
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllNotificationsAsRead}
                className="px-3 py-2 text-xs font-semibold text-[#005696] hover:bg-blue-50 rounded-lg flex items-center gap-1.5 border border-blue-200 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Mark All Read ({unreadCount})</span>
              </button>
            )}
          </div>
        </div>

        {/* Admin Post Important Note / Update Form */}
        {currentRole === 'admin' && showPostForm && (
          <form
            onSubmit={handlePostAnnouncement}
            className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                <Megaphone className="w-4 h-4 text-[#005696]" />
                <span>Post Important Note, Reminder, or Update</span>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-[11px] font-medium text-slate-600">Audience:</label>
                <select
                  value={targetAudience}
                  onChange={e => setTargetAudience(e.target.value as UserRole | 'all')}
                  className="px-2.5 py-1 text-xs rounded-lg border border-slate-300 bg-white font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#005696]"
                >
                  <option value="all">All Portal Users</option>
                  <option value="student">Students Only</option>
                  <option value="adviser">Advisers Only</option>
                  <option value="panelist">Panelists Only</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <input
                type="text"
                required
                value={noteTitle}
                onChange={e => setNoteTitle(e.target.value)}
                placeholder="Subject / Title (e.g., Manuscript Submission Deadline or Room Advisory)"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#005696]"
              />
              <textarea
                rows={3}
                required
                value={noteMessage}
                onChange={e => setNoteMessage(e.target.value)}
                placeholder="Write important notes, instructions, or schedule updates here..."
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#005696]"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              {postedBanner ? (
                <span className="text-xs font-medium text-emerald-700">{postedBanner}</span>
              ) : (
                <span className="text-[11px] text-slate-500">
                  Delivered immediately to the selected portal role(s).
                </span>
              )}
              <button
                type="submit"
                className="px-4 py-2 bg-[#005696] hover:bg-[#004478] text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Publish Note</span>
              </button>
            </div>
          </form>
        )}

        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search notes and notifications..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#005696]"
            />
          </div>

          <div className="flex gap-1 p-1 bg-slate-100 rounded-lg self-start sm:self-auto">
            {['All', 'announcement', 'defense', 'title'].map(t => (
              <button
                key={t}
                type="button"
                onClick={() => setFilterType(t)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md capitalize transition-colors cursor-pointer ${
                  filterType === t
                    ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t === 'announcement' ? 'Notes & Updates' : t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400">
            <Bell className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold">No notifications match your filter.</p>
          </div>
        ) : (
          filtered.map(notif => (
            <div
              key={notif.id}
              onClick={() => {
                markNotificationAsRead(notif.id);
                if (notif.linkTab && notif.linkTab !== 'Notifications') {
                  setActiveTab(notif.linkTab);
                }
              }}
              className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                !notif.isRead
                  ? 'bg-blue-50/40 border-blue-200'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-slate-50 border border-slate-200/60 shrink-0 mt-0.5">
                  {getIcon(notif.type)}
                </div>

                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-xs font-bold text-slate-900">{notif.title}</h3>
                    {currentRole === 'admin' && notif.roleTarget && (
                      <span className="text-[11px] text-slate-500">
                        · Target: <span className="capitalize font-medium">{notif.roleTarget}</span>
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{notif.message}</p>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 tabular-nums pt-1">
                    <span>{notif.date}</span>
                    <span>·</span>
                    <span>{formatStandardTime(notif.time)}</span>
                  </div>
                </div>
              </div>

              {!notif.isRead && (
                <button
                  type="button"
                  onClick={e => {
                    e.stopPropagation();
                    markNotificationAsRead(notif.id);
                  }}
                  className="text-[11px] text-[#005696] hover:underline font-semibold shrink-0 cursor-pointer"
                >
                  Mark read
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

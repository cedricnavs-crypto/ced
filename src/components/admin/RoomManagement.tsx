import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Room } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { BackButton } from '../common/BackButton';
import { resolveScheduleGroupName } from '../../utils/studentGroups';
import { formatTimeRange } from '../../utils/timeFormat';
import {
  Building2,
  Plus,
  Search,
  Edit2,
  Calendar,
  X
} from 'lucide-react';

export const RoomManagement: React.FC = () => {
  const { rooms, schedules, students, addRoom, updateRoom, toggleRoomAvailability } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [inspectRoomSchedule, setInspectRoomSchedule] = useState<Room | null>(null);

  const [name, setName] = useState('');

  const filtered = rooms.filter(r =>
    r.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenAdd = () => {
    setEditingRoom(null);
    setName('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (r: Room) => {
    setEditingRoom(r);
    setName(r.name);
    setIsModalOpen(true);
  };

  const handleSaveRoom = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) return;

    if (editingRoom) {
      updateRoom(editingRoom.id, { name: trimmedName });
    } else {
      addRoom({
        name: trimmedName,
        location: '',
        capacity: 0,
        facilities: [],
        isAvailable: true
      });
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-4">
        <BackButton label="Back to Dashboard" variant="subtle" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-[#005696]" />
              <h1 className="text-xl font-bold text-slate-900">Room Availability</h1>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Manage defense rooms, current defense occupancy, status toggles, and room timetables.
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenAdd}
            className="px-4 py-2 text-xs font-semibold text-white bg-[#005696] hover:bg-[#004478] rounded-lg flex items-center gap-1.5 self-start sm:self-auto cursor-pointer transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Defense Room</span>
          </button>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search defense room by name..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#005696]"
          />
        </div>
      </div>

      {/* Rooms Grid (Location & Facilities omitted per design constraint; shows Occupancy & Timetable) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(room => {
          const activeRoomSchedules = schedules.filter(
            s => s.roomId === room.id && s.status !== 'Cancelled' && s.status !== 'Completed'
          );

          return (
            <div
              key={room.id}
              className="bg-white rounded-xl border border-slate-200 p-5 space-y-4 flex flex-col justify-between hover:border-[#005696] transition-colors"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <StatusBadge status={room.isAvailable ? 'Available' : 'Unavailable'} size="sm" />
                  <button
                    type="button"
                    onClick={() => toggleRoomAvailability(room.id)}
                    className="text-xs font-semibold text-slate-600 hover:text-slate-900 underline cursor-pointer"
                  >
                    Toggle Status
                  </button>
                </div>

                <div className="flex items-center gap-2.5 pt-1">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                    <Building2 className="w-4 h-4 text-[#005696]" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 leading-snug">{room.name}</h3>
                </div>

                <div className="flex items-center justify-between text-xs pt-1 text-slate-600">
                  <span>Current Defense Occupancy:</span>
                  <span className="font-bold text-[#005696] tabular-nums">
                    {activeRoomSchedules.length} scheduled session{activeRoomSchedules.length !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setInspectRoomSchedule(room)}
                  className="px-3 py-1.5 text-xs font-semibold text-[#005696] hover:bg-blue-50 rounded-lg flex items-center gap-1.5 cursor-pointer"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>View Room Timetable</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleOpenEdit(room)}
                  className="p-1.5 text-slate-600 hover:text-[#005696] hover:bg-slate-100 rounded-lg cursor-pointer"
                  title="Edit Defense Room"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Room Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {editingRoom ? 'Edit Defense Room' : 'Add Defense Room'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRoom} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Room Name / Number *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g., Lab 401 - Systems Dev Lab"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#005696]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 font-semibold text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-semibold text-white bg-[#005696] hover:bg-[#004478] rounded-lg cursor-pointer"
                >
                  {editingRoom ? 'Save Changes' : 'Add Room'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Room Timetable Modal */}
      {inspectRoomSchedule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {inspectRoomSchedule.name} — Timetable
                </h3>
                <p className="text-xs text-slate-500">Scheduled group defense sessions in this room</p>
              </div>
              <button
                type="button"
                onClick={() => setInspectRoomSchedule(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2.5 max-h-80 overflow-y-auto">
              {schedules.filter(s => s.roomId === inspectRoomSchedule.id && s.status !== 'Cancelled')
                .length === 0 ? (
                <p className="text-xs text-slate-400 py-8 text-center">
                  No defense sessions scheduled in this room.
                </p>
              ) : (
                schedules
                  .filter(s => s.roomId === inspectRoomSchedule.id && s.status !== 'Cancelled')
                  .sort((a, b) => `${a.date} ${a.startTime}`.localeCompare(`${b.date} ${b.startTime}`))
                  .map(sch => {
                    const grp = resolveScheduleGroupName(sch, students);
                    return (
                      <div
                        key={sch.id}
                        className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900">{grp}</span>
                          <StatusBadge status={sch.status} size="sm" />
                        </div>
                        <div className="font-medium text-[#005696] tabular-nums">
                          {sch.date} · {formatTimeRange(sch.startTime, sch.endTime)}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {sch.program} · Adviser: {sch.adviserName}
                        </div>
                      </div>
                    );
                  })
              )}
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setInspectRoomSchedule(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

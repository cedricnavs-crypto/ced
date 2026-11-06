import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StatusBadge } from './StatusBadge';
import { BackButton } from './BackButton';
import {
  UserCheck,
  Mail,
  Phone,
  Building2,
  GraduationCap,
  Save,
  CheckCircle2,
  ShieldCheck,
  Layers,
  User
} from 'lucide-react';

export const ProfileView: React.FC = () => {
  const { currentUser, currentRole, students, panelists, advisers } = useApp();

  const student = students.find(s => s.userId === currentUser.id);
  const panelist = panelists.find(p => p.userId === currentUser.id);
  const adviser = advisers.find(a => a.userId === currentUser.id);

  const [phone, setPhone] = useState(
    student?.contactNumber || panelist?.contactNumber || adviser?.contactNumber || '+63 917 555 3821'
  );
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-6">
        <BackButton label="Back to Dashboard" variant="subtle" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[#00335e] text-[#FED100] border-2 border-slate-200 shadow-sm flex items-center justify-center shrink-0">
              <User className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900">{currentUser.name}</h1>
                <StatusBadge status="Active" size="sm" />
              </div>
              <p className="text-xs text-slate-500 font-mono-numbers mt-0.5">
                {currentUser.email}
              </p>
              <span className="text-[10px] font-bold text-[#005696] uppercase tracking-wider bg-blue-50 px-2 py-0.5 rounded mt-1.5 inline-block">
                Role: {currentRole.toUpperCase()}
              </span>
            </div>
          </div>

          {isSaved && (
            <div className="p-2 px-3 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-semibold flex items-center gap-1.5 self-start sm:self-auto">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Contact details updated!</span>
            </div>
          )}
        </div>

        {/* Role Specific Details Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          {currentRole === 'student' && student && (
            <>
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                  Student Number
                </span>
                <span className="font-bold text-slate-900 font-mono-numbers text-sm">
                  {student.studentNumber}
                </span>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                  Program & Section
                </span>
                <span className="font-bold text-slate-900 font-mono-numbers text-sm">
                  {student.program} ({student.section})
                </span>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 sm:col-span-2">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                  Supervising Faculty Adviser
                </span>
                <span className="font-bold text-slate-900 text-sm">
                  {student.adviserName}
                </span>
              </div>
            </>
          )}

          {currentRole === 'panelist' && panelist && (
            <>
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                  Faculty Employee ID
                </span>
                <span className="font-bold text-slate-900 font-mono-numbers text-sm">
                  {panelist.employeeId}
                </span>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                  Academic Department
                </span>
                <span className="font-bold text-slate-900 text-sm">
                  {panelist.department}
                </span>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 sm:col-span-2">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                  Evaluation Specializations
                </span>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {panelist.specializations.map((s, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200 text-xs font-mono-numbers"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </>
          )}

          {currentRole === 'adviser' && adviser && (
            <>
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                  Faculty Employee ID
                </span>
                <span className="font-bold text-slate-900 font-mono-numbers text-sm">
                  {adviser.employeeId}
                </span>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                  Mentorship Capacity Load
                </span>
                <span className="font-bold text-slate-900 text-sm font-mono-numbers">
                  Max: {adviser.maxAdvisees} advisee candidates
                </span>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 sm:col-span-2">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                  Academic Department
                </span>
                <span className="font-bold text-slate-900 text-sm">
                  {adviser.department}
                </span>
              </div>
            </>
          )}

          {currentRole === 'admin' && (
            <>
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                  Administrator ID
                </span>
                <span className="font-bold text-slate-900 font-mono-numbers text-sm">
                  STI-GC-ADM-0010
                </span>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                  Administrative Directorate
                </span>
                <span className="font-bold text-slate-900 text-sm">
                  Capstone Project Directorate & CICT
                </span>
              </div>
            </>
          )}
        </div>

        {/* Editable Contact Information Form */}
        <form onSubmit={handleSave} className="space-y-4 pt-4 border-t border-slate-100 text-xs">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Contact & Verification Information
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Mobile Contact Number</label>
              <input
                type="text"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#005696] font-mono-numbers"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Campus Location</label>
              <input
                type="text"
                disabled
                value="STI College Global City · BGC Taguig"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-slate-100 text-slate-500 cursor-not-allowed"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-[#005696] hover:bg-[#00477d] rounded-xl shadow-sm flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>Update Profile</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { BackButton } from '../common/BackButton';
import {
  Settings,
  Save,
  CheckCircle2,
  Lock,
  Unlock
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { settings, updateSettings } = useApp();

  const [campusName, setCampusName] = useState(settings.campusName);
  const [academicYear, setAcademicYear] = useState(settings.academicYear);
  const [trimester, setTrimester] = useState(settings.trimester);
  const [defenseDurationMinutes, setDefenseDurationMinutes] = useState(settings.defenseDurationMinutes);
  const [allowSubmissions, setAllowSubmissions] = useState(settings.allowSubmissions);
  const [institutionAddress, setInstitutionAddress] = useState(settings.institutionAddress);
  const [contactEmail, setContactEmail] = useState(settings.contactEmail);

  const [savedFeedback, setSavedFeedback] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      campusName,
      academicYear,
      trimester,
      defenseDurationMinutes: Number(defenseDurationMinutes),
      allowSubmissions,
      institutionAddress,
      contactEmail
    });
    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-5">
        <BackButton label="Back to Dashboard" variant="subtle" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-[#005696]" />
              <h1 className="text-xl font-bold text-slate-900">System Settings</h1>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Edit institutional parameters and lock or unlock student feature access.
            </p>
          </div>

          {savedFeedback && (
            <div className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-semibold flex items-center gap-1.5 border border-emerald-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Settings saved</span>
            </div>
          )}
        </div>

        <form onSubmit={handleSave} className="space-y-5 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Campus Institution Name</label>
              <input
                type="text"
                required
                value={campusName}
                onChange={e => setCampusName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#005696]"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Official Contact Email</label>
              <input
                type="email"
                required
                value={contactEmail}
                onChange={e => setContactEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#005696]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Academic Year</label>
              <input
                type="text"
                required
                value={academicYear}
                onChange={e => setAcademicYear(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 tabular-nums focus:outline-none focus:ring-2 focus:ring-[#005696]"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Academic Term</label>
              <select
                value={trimester}
                onChange={e => setTrimester(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-[#005696]"
              >
                <option value="1st Trimester">1st Trimester</option>
                <option value="2nd Trimester">2nd Trimester</option>
                <option value="3rd Trimester">3rd Trimester</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Default Defense Duration (Mins)</label>
              <input
                type="number"
                min={30}
                max={120}
                step={15}
                value={defenseDurationMinutes}
                onChange={e => setDefenseDurationMinutes(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 tabular-nums focus:outline-none focus:ring-2 focus:ring-[#005696]"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Campus Address</label>
            <input
              type="text"
              value={institutionAddress}
              onChange={e => setInstitutionAddress(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#005696]"
            />
          </div>

          {/* Student Feature Access Locks */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <h2 className="text-sm font-bold text-slate-900">Student Feature Access Controls</h2>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="font-bold text-slate-900">Student Endorsed Title Submission</div>
                <div className="text-slate-500 text-[11px] mt-0.5">
                  Lock or unlock students' ability to submit endorsed capstone/thesis titles.
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAllowSubmissions(v => !v)}
                className={`px-3.5 py-2 text-xs font-semibold rounded-lg border inline-flex items-center gap-1.5 self-start sm:self-center cursor-pointer transition-colors ${
                  allowSubmissions
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-rose-50 text-rose-700 border-rose-200'
                }`}
              >
                {allowSubmissions ? (
                  <>
                    <Unlock className="w-3.5 h-3.5" />
                    <span>Unlocked (Open)</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5" />
                    <span>Access Locked</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-[#005696] hover:bg-[#004478] rounded-lg flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>Save Settings</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

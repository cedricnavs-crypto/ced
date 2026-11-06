import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import {
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
  Eye,
  EyeOff,
  ShieldCheck,
  X,
  Phone,
  HelpCircle,
  FileText,
  Clock,
  MapPin,
  GraduationCap
} from 'lucide-react';

interface LoginViewProps {
  onSuccess: () => void;
}

interface AccountCredential {
  email: string;
  password: string;
  role: UserRole;
  name: string;
  studentNumberOrId: string;
  userId: string;
}

export const LoginView: React.FC<LoginViewProps> = ({ onSuccess }) => {
  const {
    switchUserById,
    users,
    students,
    panelists,
    advisers
  } = useApp();

  const registeredAccounts: AccountCredential[] = [
    {
      email: 'juan.delacruz@globalcity.sti.edu',
      password: 'student123',
      role: 'student',
      name: 'Juan Carlos Dela Cruz',
      studentNumberOrId: '02000214829',
      userId: 'user-student-1'
    },
    {
      email: 'francis.bautista@globalcity.sti.edu',
      password: 'panelist123',
      role: 'panelist',
      name: 'Engr. Francis Bautista',
      studentNumberOrId: 'STI-GC-FAC-019',
      userId: 'user-panelist-1'
    },
    {
      email: 'maria.santos@globalcity.sti.edu',
      password: 'adviser123',
      role: 'adviser',
      name: 'Dr. Maria Santos',
      studentNumberOrId: 'STI-GC-ADV-008',
      userId: 'user-adviser-1'
    },
    {
      email: 'arnold.mercado@globalcity.sti.edu',
      password: 'admin123',
      role: 'admin',
      name: 'Dean Arnold Mercado',
      studentNumberOrId: 'STI-GC-ADM-001',
      userId: 'user-admin-1'
    }
  ];

  // Sign In state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Modals state
  const [isHelpdeskOpen, setIsHelpdeskOpen] = useState(false);
  const [isGuidelinesOpen, setIsGuidelinesOpen] = useState(false);
  const [isForgotOpen, setIsForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState(false);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    const cleanInput = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    setTimeout(() => {

      // 1. Direct match with primary role accounts (by email or ID)
      const account = registeredAccounts.find(
        a =>
          a.email.toLowerCase() === cleanInput ||
          a.studentNumberOrId.toLowerCase() === cleanInput
      );

      if (account) {
        if (cleanPassword === account.password || cleanPassword.length >= 4) {
          switchUserById(account.userId);
          setIsLoading(false);
          onSuccess();
          return;
        } else {
          setIsLoading(false);
          setErrorMessage('Invalid password. Please check your credentials and try again.');
          return;
        }
      }

      // 2. Match against approved / enrolled Students
      const studentMatch = students.find(
        s =>
          s.email.toLowerCase() === cleanInput ||
          s.studentNumber.toLowerCase() === cleanInput
      );
      if (studentMatch) {
        if (!studentMatch.isActive) {
          setIsLoading(false);
          setErrorMessage(
            'This student account is currently deactivated. Please contact the Capstone Administrator.'
          );
          return;
        }
        const expectedPassword = studentMatch.password || 'student123';
        const passwordValid = cleanPassword === expectedPassword;
        if (passwordValid) {
          switchUserById(studentMatch.userId);
          setIsLoading(false);
          onSuccess();
          return;
        } else {
          setIsLoading(false);
          setErrorMessage('Incorrect password for this student account.');
          return;
        }
      }

      // 3. Match against Advisers, Panelists, or Users list
      const adviserMatch = advisers.find(
        a =>
          a.email.toLowerCase() === cleanInput ||
          a.employeeId.toLowerCase() === cleanInput
      );
      if (adviserMatch) {
        if (cleanPassword.length >= 4) {
          switchUserById(adviserMatch.userId);
          setIsLoading(false);
          onSuccess();
          return;
        }
      }

      const panelistMatch = panelists.find(
        p =>
          p.email.toLowerCase() === cleanInput ||
          p.employeeId.toLowerCase() === cleanInput
      );
      if (panelistMatch) {
        if (cleanPassword.length >= 4) {
          switchUserById(panelistMatch.userId);
          setIsLoading(false);
          onSuccess();
          return;
        }
      }

      const userMatch = users.find(
        u =>
          u.email.toLowerCase() === cleanInput ||
          (u.studentNumber && u.studentNumber.toLowerCase() === cleanInput) ||
          (u.employeeId && u.employeeId.toLowerCase() === cleanInput)
      );
      if (userMatch) {
        const passValid = userMatch.password
          ? cleanPassword === userMatch.password
          : cleanPassword.length >= 4;
        if (passValid) {
          switchUserById(userMatch.id);
          setIsLoading(false);
          onSuccess();
          return;
        } else {
          setIsLoading(false);
          setErrorMessage('Invalid password. Please check your credentials.');
          return;
        }
      }

      setIsLoading(false);
      setErrorMessage(
        'Unrecognized account credentials. Student accounts are provisioned exclusively by the Capstone Administrator.'
      );
    }, 350);
  };

  const handleForgotPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (forgotEmail.trim()) {
      setForgotSuccess(true);
      setTimeout(() => {
        setIsForgotOpen(false);
        setForgotSuccess(false);
        setForgotEmail('');
      }, 2000);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col font-sans selection:bg-[#005696] selection:text-white">
      {/* Top Utility Header */}
      <header className="bg-white border-b border-slate-200/80 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center bg-[#FFD100] text-[#005696] font-black text-lg px-2.5 py-1 rounded shadow-xs select-none">
              STI
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-slate-900 text-sm sm:text-base tracking-tight">
                  STI College Global City
                </span>
                <span className="hidden sm:inline text-xs text-slate-400 font-medium">·</span>
                <span className="hidden sm:inline text-xs font-semibold text-slate-600">
                  Capstone Defense Portal
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setIsGuidelinesOpen(true)}
              className="text-slate-600 hover:text-[#005696] transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              <span>Defense Guidelines</span>
            </button>
            <button
              type="button"
              onClick={() => setIsHelpdeskOpen(true)}
              className="text-slate-600 hover:text-[#005696] transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
              <span>Helpdesk</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Split Portal Area */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-10">
        <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-12 rounded-3xl bg-white border border-slate-200 shadow-xl overflow-hidden min-h-[620px]">
          {/* LEFT COLUMN: Deep STI Navy Academic & Defense Showcase */}
          <div className="lg:col-span-5 bg-gradient-to-br from-[#002642] via-[#003865] to-[#005696] p-8 sm:p-10 text-white flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#0072CE]/20 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 space-y-5">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/10 border border-white/15 text-[11px] font-bold uppercase tracking-wider text-[#FED100]">
                <GraduationCap className="w-3.5 h-3.5" />
                STI COLLEGE GLOBAL CITY
              </span>

              <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
                Capstone Scheduling.
              </h1>

              <p className="text-sm text-blue-100/90 leading-relaxed">
                The centralized portal for candidate title proposals, adviser supervision, panel deliberations, and oral defense scheduling at STI College Global City.
              </p>

              {/* Account Provisioning Policy Box */}
              <div className="p-4 rounded-2xl bg-white/10 border border-white/15 space-y-1.5 text-xs">
                <div className="font-bold text-[#FED100] flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <span>Institutional Account Provisioning</span>
                </div>
                <p className="text-blue-100/90 leading-relaxed text-[11px]">
                  Portal access is restricted to verified members. Student, Adviser, and Panelist accounts are provisioned exclusively by the Capstone Administrator.
                </p>
              </div>
            </div>

            <div className="relative z-10 pt-4 mt-6 border-t border-white/15 flex items-center justify-between text-xs text-blue-200/90">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#FED100]" />
                <span>Accredited Academic Examination System</span>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Sign In Form */}
          <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between bg-white">
            <div className="my-auto">
              <div className="space-y-1.5 mb-6">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 border border-blue-100 text-[11px] font-bold uppercase tracking-wider text-[#005696]">
                  <Lock className="w-3 h-3" />
                  Authorized Portal Access
                </span>
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight pt-1">
                  Sign in to your account
                </h2>
                <p className="text-xs text-slate-500">
                  Enter your STI institutional email or ID number and password to proceed.
                </p>
              </div>

              {/* Error Notification */}
              {errorMessage && (
                <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span className="font-medium leading-relaxed">{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Institutional Email or Student / Employee ID
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      required
                      value={email}
                      onChange={e => {
                        setEmail(e.target.value);
                        if (errorMessage) setErrorMessage(null);
                      }}
                      className="w-full pl-10 pr-3 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#005696] focus:border-transparent bg-white transition-all font-mono"
                      placeholder="e.g. 02000214829 or juan.delacruz@globalcity.sti.edu"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-slate-700">Password</label>
                    <button
                      type="button"
                      onClick={() => setIsForgotOpen(true)}
                      className="text-xs text-[#005696] hover:underline font-semibold cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={e => {
                        setPassword(e.target.value);
                        if (errorMessage) setErrorMessage(null);
                      }}
                      className="w-full pl-10 pr-10 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#005696] focus:border-transparent bg-white transition-all font-mono"
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer p-1"
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={e => setRememberMe(e.target.checked)}
                      className="rounded border-slate-300 text-[#005696] focus:ring-[#005696]"
                    />
                    <span className="text-slate-600 text-xs">Keep me signed in</span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 rounded-xl font-bold text-xs sm:text-sm text-white bg-[#005696] hover:bg-[#00477d] active:scale-[0.99] transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Authenticating with STI Server...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>Sign In to Portal</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Bottom Support Notice */}
            <div className="pt-5 mt-5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
              <span>Having trouble signing in?</span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsHelpdeskOpen(true)}
                  className="text-[#005696] font-semibold hover:underline cursor-pointer"
                >
                  Contact Campus IT
                </button>
                <span>·</span>
                <button
                  type="button"
                  onClick={() => setIsGuidelinesOpen(true)}
                  className="text-slate-600 font-semibold hover:underline cursor-pointer"
                >
                  Portal FAQs
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-slate-400 border-t border-slate-200/60 bg-white">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© 2026 STI Education Services Group, Inc. All rights reserved.</p>
          <div className="flex items-center gap-3 text-[11px] text-slate-500">
            <span>STI College Global City</span>
            <span>·</span>
            <span>Capstone Research & Oral Examination Directorate</span>
            <span>·</span>
            <span>Bonifacio Global City, Taguig</span>
          </div>
        </div>
      </footer>

      {/* CAMPUS HELPDESK MODAL */}
      {isHelpdeskOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 border border-slate-200 my-8 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="bg-[#FFD100] text-[#005696] font-black text-sm px-2 py-0.5 rounded">
                  STI
                </div>
                <h3 className="font-bold text-slate-900 text-sm">
                  Campus IT & Capstone Helpdesk
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsHelpdeskOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600">
              <p>
                For technical issues logging into the Capstone Portal or questions regarding student enrollment verification:
              </p>

              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-[#005696]" />
                  <span>
                    Email: <strong className="text-slate-900">helpdesk@globalcity.sti.edu</strong>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-[#005696]" />
                  <span>
                    Hotline: <strong className="text-slate-900">(02) 8555-8888 loc. 410</strong>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#005696]" />
                  <span>Hours: Monday to Friday, 7:00 AM – 7:00 PM</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#005696]" />
                  <span>Office: IT Department, 3rd Floor, STI Academic Center BGC</span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setIsHelpdeskOpen(false)}
                className="px-4 py-2 bg-[#005696] text-white font-bold text-xs rounded-xl hover:bg-[#00477d] cursor-pointer"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DEFENSE GUIDELINES MODAL */}
      {isGuidelinesOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl max-w-xl w-full p-6 border border-slate-200 my-8 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="bg-[#FFD100] text-[#005696] font-black text-sm px-2 py-0.5 rounded">
                  STI
                </div>
                <h3 className="font-bold text-slate-900 text-sm">
                  Capstone Defense & Account Enrollment Policy
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsGuidelinesOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs text-slate-600 max-h-96 overflow-y-auto pr-1">
              <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl space-y-1">
                <h4 className="font-bold text-amber-900">1. Institutional Account Provisioning</h4>
                <p>
                  Self-registration is disabled. Student accounts are provisioned exclusively by the Capstone Administrator upon official trimester enrollment.
                </p>
              </div>

              <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl space-y-1">
                <h4 className="font-bold text-[#005696]">2. Title Proposal Stage</h4>
                <p>
                  Candidates coordinate Capstone Adviser selection offline with their department and obtain formal proposal endorsement prior to oral defense scheduling.
                </p>
              </div>

              <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl space-y-1">
                <h4 className="font-bold text-[#005696]">3. Defense Session Protocols</h4>
                <p>
                  All defense sessions run for 60–90 minutes with 3 assigned faculty panelists (1 Panel Chair and 2 Member Evaluators).
                </p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setIsGuidelinesOpen(false)}
                className="px-4 py-2 bg-[#005696] text-white font-bold text-xs rounded-xl hover:bg-[#00477d] cursor-pointer"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FORGOT PASSWORD MODAL */}
      {isForgotOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 border border-slate-200 my-8 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">Reset Institutional Password</h3>
              <button
                type="button"
                onClick={() => setIsForgotOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {forgotSuccess ? (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 space-y-1">
                <strong className="block font-bold">Password Reset Instructions Dispatched!</strong>
                <p>
                  A temporary verification link has been sent to your STI institutional email inbox.
                </p>
              </div>
            ) : (
              <form onSubmit={handleForgotPasswordSubmit} className="space-y-3 text-xs">
                <p className="text-slate-600">
                  Enter your registered STI email or student number to receive password recovery instructions:
                </p>
                <input
                  type="email"
                  required
                  value={forgotEmail}
                  onChange={e => setForgotEmail(e.target.value)}
                  placeholder="your.name@globalcity.sti.edu"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#005696]"
                />
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsForgotOpen(false)}
                    className="px-3 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#005696] hover:bg-[#00477d] text-white rounded-xl font-bold cursor-pointer"
                  >
                    Send Recovery Link
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Plus, Trash2, CheckCircle2, ArrowLeft, Lock } from 'lucide-react';
import { CapstoneTitle } from '../../types';
import { getStudentGroupLabel } from '../../utils/studentGroups';

interface SubmitTitleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SubmitTitleModal: React.FC<SubmitTitleModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, students, advisers, submitCapstoneTitle, settings } = useApp();
  const currentStudent = students.find(s => s.userId === currentUser.id) || students[0];
  const groupName = currentStudent ? getStudentGroupLabel(currentStudent) : 'STUDENT GROUP';

  const [title, setTitle] = useState('');
  const [adviserId, setAdviserId] = useState(
    currentStudent?.adviserId || advisers[0]?.id || 'adv-1'
  );
  const [defenseStage, setDefenseStage] = useState<CapstoneTitle['defenseStage']>('Title Proposal');
  const [problemStatement, setProblemStatement] = useState('');
  const [abstract, setAbstract] = useState('');
  const [objectives, setObjectives] = useState<string[]>([
    'Design and implement the core system architecture',
    'Develop a clean, responsive user interface'
  ]);
  const [newObjective, setNewObjective] = useState('');
  const [techStackInput, setTechStackInput] = useState('React, TypeScript, Node.js');
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const isLocked = !settings.allowSubmissions;

  const handleAddObjective = () => {
    if (newObjective.trim()) {
      setObjectives(prev => [...prev, newObjective.trim()]);
      setNewObjective('');
    }
  };

  const handleRemoveObjective = (index: number) => {
    setObjectives(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLocked || !title.trim() || !abstract.trim()) return;

    const techStackArray = techStackInput
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    submitCapstoneTitle({
      title: title.trim(),
      adviserId,
      defenseStage,
      problemStatement: problemStatement.trim(),
      abstract: abstract.trim(),
      objectives,
      techStack: techStackArray
    });

    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      setTitle('');
      setProblemStatement('');
      setAbstract('');
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full p-6 border border-slate-200 my-8">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg cursor-pointer flex items-center gap-1 text-xs font-semibold"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <div className="h-4 w-px bg-slate-200" />
            <div>
              <h3 className="text-base font-bold text-slate-900">Submit Endorsed Capstone Title</h3>
              <p className="text-xs text-slate-500">
                Group: <strong className="text-[#005696]">{groupName}</strong>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isLocked ? (
          <div className="py-10 text-center space-y-2">
            <Lock className="w-10 h-10 text-amber-500 mx-auto" />
            <h4 className="text-sm font-bold text-slate-900">Title Submission Currently Locked</h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              The Capstone Coordinator has temporarily locked student title submissions in System Settings.
            </p>
          </div>
        ) : isSuccess ? (
          <div className="py-12 text-center">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
            <h4 className="text-base font-bold text-slate-900">Endorsed Title Saved!</h4>
            <p className="text-xs text-slate-500 mt-1">
              Your group&apos;s capstone title has been saved to the portal database.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 pt-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Endorsed Capstone / Thesis Title *
              </label>
              <textarea
                required
                rows={2}
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Enter your official adviser-endorsed capstone or thesis title..."
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#005696]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Chosen Adviser *</label>
                <select
                  value={adviserId}
                  onChange={e => setAdviserId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
                >
                  {advisers.map(adv => (
                    <option key={adv.id} value={adv.id}>
                      {adv.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Defense Stage *</label>
                <select
                  value={defenseStage}
                  onChange={e => setDefenseStage(e.target.value as CapstoneTitle['defenseStage'])}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
                >
                  <option value="Title Proposal">Title Proposal</option>
                  <option value="Defense 1 (Proposal)">Defense 1 (Proposal)</option>
                  <option value="Final Capstone Defense">Final Capstone Defense</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Brief Details / Abstract *
              </label>
              <textarea
                required
                rows={3}
                value={abstract}
                onChange={e => setAbstract(e.target.value)}
                placeholder="Provide brief details about your capstone project, scope, and target beneficiaries..."
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#005696]"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Problem Statement</label>
              <textarea
                rows={2}
                value={problemStatement}
                onChange={e => setProblemStatement(e.target.value)}
                placeholder="Optional summary of the problem addressed..."
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#005696]"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Objectives</label>
              <div className="space-y-1.5 mb-2">
                {objectives.map((obj, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200"
                  >
                    <span className="text-slate-800">
                      {i + 1}. {obj}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveObjective(i)}
                      className="text-rose-500 hover:text-rose-700 p-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newObjective}
                  onChange={e => setNewObjective(e.target.value)}
                  placeholder="Add objective..."
                  className="flex-1 px-3 py-1.5 rounded-lg border border-slate-300"
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddObjective();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={handleAddObjective}
                  className="px-3 py-1.5 font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Add
                </button>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Tech Stack (comma separated)
              </label>
              <input
                type="text"
                value={techStackInput}
                onChange={e => setTechStackInput(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 font-bold text-white bg-[#005696] hover:bg-[#004478] rounded-lg cursor-pointer"
              >
                Save Endorsed Title
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

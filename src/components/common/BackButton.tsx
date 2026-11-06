import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export interface BackButtonProps {
  label?: string;
  onClick?: () => void;
  toDashboard?: boolean;
  variant?: 'default' | 'pill' | 'subtle' | 'minimal';
  className?: string;
  iconOnly?: boolean;
}

export const BackButton: React.FC<BackButtonProps> = ({
  label = 'Back',
  onClick,
  toDashboard = false,
  variant = 'default',
  className = '',
  iconOnly = false
}) => {
  const { goBack, setActiveTab } = useApp();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (toDashboard) {
      setActiveTab('Dashboard');
    } else {
      goBack();
    }
  };

  const baseStyles = 'inline-flex items-center gap-1.5 font-bold transition-all duration-150 cursor-pointer group select-none';

  const variants = {
    default: 'px-3 py-1.5 rounded-xl text-xs text-slate-700 hover:text-[#005696] bg-white hover:bg-blue-50/70 border border-slate-200/90 hover:border-blue-200 shadow-2xs hover:shadow-xs active:scale-[0.98]',
    pill: 'px-3.5 py-1.5 rounded-full text-xs text-[#005696] hover:text-white bg-blue-50/80 hover:bg-[#005696] border border-blue-200/80 shadow-2xs active:scale-[0.98]',
    subtle: 'px-2.5 py-1 rounded-lg text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent active:scale-[0.98]',
    minimal: 'text-xs text-slate-500 hover:text-[#005696] p-1 rounded hover:bg-slate-100'
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`${baseStyles} ${variants[variant]} ${className}`}
      title={label}
      aria-label={label}
    >
      <ArrowLeft className="w-3.5 h-3.5 shrink-0 transition-transform duration-150 group-hover:-translate-x-0.5 text-slate-500 group-hover:text-[#005696]" />
      {!iconOnly && <span>{label}</span>}
    </button>
  );
};

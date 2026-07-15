import { X } from 'lucide-react';
import { ReactNode } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  maxWidth?: string;
}

export default function Modal({ isOpen, onClose, title, children, maxWidth = "max-w-2xl" }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className={`bg-[#0f172a] border border-[#1e293b] rounded-xl shadow-2xl flex flex-col w-full ${maxWidth} max-h-[90vh] overflow-hidden`}>
        <div className="flex items-center justify-between p-4 border-b border-[#1e293b] shrink-0">
          <h3 className="text-lg font-bold text-slate-100">{title}</h3>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-[#1e293b] text-slate-400 hover:text-slate-100 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-4 overflow-y-auto custom-scrollbar flex-1 relative">
          {children}
        </div>
      </div>
    </div>
  );
}

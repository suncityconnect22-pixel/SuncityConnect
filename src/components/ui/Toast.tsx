'use client';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  onClose: () => void;
}

export default function Toast({ message, type = 'info', onClose }: ToastProps) {
  const colors = {
    success: 'bg-green-600',
    error: 'bg-red-600',
    info: 'bg-blue-600',
  };

  return (
    <div className="fixed bottom-24 left-4 right-4 z-50 flex justify-center toast-enter">
      <div className={`${colors[type]} text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-3 max-w-sm w-full`}>
        <span className="text-sm font-medium flex-1">{message}</span>
        <button onClick={onClose} className="text-white/80 hover:text-white shrink-0">
          ✕
        </button>
      </div>
    </div>
  );
}

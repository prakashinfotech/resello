import { useEffect, useRef, useState } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  /** aria-labelledby value */
  labelId?: string;
}

/**
 * Shared modal wrapper with fade + scale transition.
 * Handles delayed unmount so the exit animation plays fully.
 */
const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, labelId }) => {
  const [visible, setVisible] = useState(isOpen);
  const [show, setShow] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setVisible(true);
      timerRef.current = setTimeout(() => setShow(true), 10);
    } else {
      setShow(false);
      timerRef.current = setTimeout(() => setVisible(false), 200);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isOpen]);

  if (!visible) return null;

  const handleBackdropMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    // Close only when the click is outside the modal content box
    if (contentRef.current && !contentRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={labelId}
      className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-200 ${
        show ? 'bg-black/30 backdrop-blur-sm' : 'bg-black/0 backdrop-blur-none'
      }`}
      onMouseDown={handleBackdropMouseDown}
    >
      <div
        ref={contentRef}
        className={`transition-all duration-200 w-full flex items-center justify-center ${
          show ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}
      >
        {children}
      </div>
    </div>
  );
};

export default Modal;

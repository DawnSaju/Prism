import React from "react";
import { AlertTriangle, X } from "lucide-react";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "info";
}

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger",
}: ConfirmationModalProps) {
  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const variantStyles = {
    danger: {
      icon: "text-red-500",
      button: "bg-red-600 hover:bg-red-700 border-red-500",
    },
    warning: {
      icon: "text-yellow-500",
      button: "bg-yellow-600 hover:bg-yellow-700 border-yellow-500",
    },
    info: {
      icon: "text-blue-500",
      button: "bg-blue-600 hover:bg-blue-700 border-blue-500",
    },
  };

  const styles = variantStyles[variant];

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="bg-[rgb(25,25,25)] border border-[rgb(50,50,50)] rounded-xl shadow-2xl max-w-md w-full mx-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between p-6 border-b border-[rgb(40,40,40)]">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl bg-[rgb(30,30,30)] border border-[rgb(50,50,50)] flex items-center justify-center ${styles.icon}`}
            >
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h2
              className="text-white text-[18px]"
              style={{
                fontFamily:
                  '"2 TT_Firs_Neue_DemiBold Unspecified", "2 TT_Firs_Neue_DemiBold Unspecified Placeholder", sans-serif',
              }}
            >
              {title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[rgb(160,160,160)] hover:bg-[rgb(30,30,30)] hover:text-[rgb(200,200,200)] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6">
          <p
            className="text-[rgb(180,180,180)] text-[14px] leading-relaxed"
            style={{
              fontFamily:
                '"3 TT_Firs_Neue_Regular Unspecified", "3 TT_Firs_Neue_Regular Unspecified Placeholder", sans-serif',
            }}
          >
            {message}
          </p>
        </div>
        <div className="flex items-center justify-end gap-3 p-6 border-t border-[rgb(40,40,40)] bg-[rgb(20,20,20)]">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-lg bg-[rgb(30,30,30)] border border-[rgb(50,50,50)] text-[rgb(200,200,200)] hover:bg-[rgb(35,35,35)] hover:text-white transition-colors text-[14px]"
            style={{
              fontFamily:
                '"3 TT_Firs_Neue_Regular Unspecified", "3 TT_Firs_Neue_Regular Unspecified Placeholder", sans-serif',
            }}
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            className={`px-6 py-2.5 rounded-lg border text-white transition-colors text-[14px] ${styles.button}`}
            style={{
              fontFamily:
                '"2 TT_Firs_Neue_DemiBold Unspecified", "2 TT_Firs_Neue_DemiBold Unspecified Placeholder", sans-serif',
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

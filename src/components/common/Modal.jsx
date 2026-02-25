import React from "react";
import { X } from "lucide-react";

const Modal = ({ isOpen, onClose, title, children, onConfirm, confirmText = "تأكيد", cancelText = "إلغاء", isLoading = false }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-bold text-gray-800">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 text-gray-600">
          {children}
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-4 bg-gray-50 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-200 rounded-lg transition"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition disabled:opacity-50"
          >
            {isLoading ? "جاري المعالجة..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
/**
 * Modal — centered overlay with dark backdrop
 * Props: open, onClose, title, children, footer
 */
import { X } from "lucide-react";

export default function Modal({ open, onClose, title, children, footer }) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.45)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="bg-white w-full max-w-lg flex flex-col"
        style={{
          borderRadius: 16,
          boxShadow: "0 8px 24px rgba(0,0,0,0.09), 0 4px 8px rgba(0,0,0,0.05)",
          maxHeight: "90vh",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 border-b"
          style={{ borderColor: "#E5E7EB" }}
        >
          <h2 className="font-bold text-text-primary" style={{ fontSize: 17 }}>
            {title}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X size={16} className="text-text-secondary" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>

        {/* Footer */}
        {footer && (
          <div
            className="flex items-center justify-end gap-3 px-6 py-4 border-t"
            style={{ borderColor: "#E5E7EB" }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}


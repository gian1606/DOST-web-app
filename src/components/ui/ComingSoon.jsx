/**
 * ComingSoon — placeholder shell for unimplemented pages
 */
import { Clock } from "lucide-react";

export default function ComingSoon({ title, description }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <div
        className="flex items-center justify-center rounded-2xl"
        style={{ width: 72, height: 72, background: "#E8F5E9" }}
      >
        <Clock size={36} color="#2E7D32" />
      </div>
      <div className="text-center">
        <h2 className="font-bold text-text-primary" style={{ fontSize: 22 }}>
          {title ?? "Coming Soon"}
        </h2>
        <p className="text-text-secondary mt-1" style={{ fontSize: 14, maxWidth: 360 }}>
          {description ??
            "This module is currently under development and will be available in a future update."}
        </p>
      </div>
      <span
        className="rounded-full px-4 py-1.5 font-semibold"
        style={{ fontSize: 13, background: "#F3F4F6", color: "#9CA3AF" }}
      >
        Coming Soon
      </span>
    </div>
  );
}


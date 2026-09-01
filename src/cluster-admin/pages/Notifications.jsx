import { useState } from "react";
import { Plus, Bell, Route, FileText, Megaphone, AlertTriangle } from "lucide-react";
import Modal from "../../components/ui/Modal";
import { NOTIFICATIONS, BARANGAYS, COLLECTORS } from "../mock/data";

const TYPE_CONFIG = {
  announcement: { icon: Megaphone, color: "#2E7D32", bg: "#E8F5E9" },
  route:        { icon: Route,     color: "#1976D2", bg: "#E3F2FD" },
  report:       { icon: FileText,  color: "#6B7280", bg: "#F3F4F6" },
  task:         { icon: Bell,      color: "#D97706", bg: "#FFF3E0" },
};

const EMPTY_FORM = { title: "", body: "", target: "all", priority: "normal" };

export default function Notifications() {
  const [notifications, setNotifications] = useState(NOTIFICATIONS);
  const [tab, setTab] = useState("inbox");
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});

  function validateForm() {
    const e = {};
    if (!form.title.trim()) e.title = "Title is required.";
    if (!form.body.trim()) e.body = "Message body is required.";
    return e;
  }

  function handleSend() {
    const e = validateForm();
    if (Object.keys(e).length) { setFormErrors(e); return; }
    setNotifications((prev) => [
      {
        id: `n${Date.now()}`,
        type: "announcement",
        title: form.title,
        body: form.body,
        target: form.target,
        priority: form.priority,
        sentAt: new Date().toISOString(),
        read: true,
        from: "Cluster Admin",
      },
      ...prev,
    ]);
    setModalOpen(false);
    setForm(EMPTY_FORM);
  }

  function getTargetLabel(target) {
    if (target === "all") return "All in Cluster";
    const br = BARANGAYS.find((b) => b.id === target);
    if (br) return br.name;
    const col = COLLECTORS.find((c) => c.id === target);
    if (col) return col.name;
    return target;
  }

  function formatTime(ts) {
    return new Date(ts).toLocaleString("en-PH", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  }

  // Split inbox (from Super Admin) vs sent (from this admin)
  const inbox = notifications.filter((n) => n.from === "Super Admin");
  const sent  = notifications.filter((n) => n.from === "Cluster Admin");
  const displayed = tab === "inbox" ? inbox : sent;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="font-bold text-text-primary" style={{ fontSize: 28 }}>Notifications</h1>
        <button
          onClick={() => { setModalOpen(true); setForm(EMPTY_FORM); setFormErrors({}); }}
          className="flex items-center gap-2 rounded-lg px-4 py-2.5 font-semibold text-white hover:opacity-90 transition-opacity"
          style={{ fontSize: 14, background: "#2E7D32" }}
        >
          <Plus size={15} />
          Send Notification
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b" style={{ borderColor: "#E5E7EB" }}>
        {[
          { key: "inbox", label: `Inbox (${inbox.filter((n) => !n.read).length} unread)` },
          { key: "sent",  label: "Sent" },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className="px-5 py-2.5 font-medium transition-colors"
            style={{
              fontSize: 14,
              color: tab === t.key ? "#2E7D32" : "#6B7280",
              borderBottom: tab === t.key ? "2px solid #2E7D32" : "2px solid transparent",
              marginBottom: -1,
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* List */}
      <div
        className="bg-white rounded-xl overflow-hidden"
        style={{ border: "1px solid #E5E7EB", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}
      >
        {displayed.length === 0 ? (
          <div className="text-center text-text-muted py-12" style={{ fontSize: 14 }}>No notifications.</div>
        ) : (
          displayed.map((n) => {
            const cfg = TYPE_CONFIG[n.type] ?? TYPE_CONFIG.announcement;
            const Icon = cfg.icon;
            return (
              <div
                key={n.id}
                className="flex items-start gap-4 px-5 py-4 border-b last:border-0 transition-colors hover:bg-gray-50"
                style={{ borderColor: "#F3F4F6", background: !n.read ? "#FAFFFE" : undefined }}
              >
                <div
                  className="flex-shrink-0 flex items-center justify-center rounded-lg mt-0.5"
                  style={{ width: 36, height: 36, background: cfg.bg }}
                >
                  <Icon size={17} color={cfg.color} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-semibold text-text-primary" style={{ fontSize: 14 }}>{n.title}</span>
                    {!n.read && (
                      <span className="rounded-full" style={{ width: 7, height: 7, background: "#2E7D32", display: "inline-block", flexShrink: 0 }} />
                    )}
                    {n.priority === "urgent" && (
                      <span className="flex items-center gap-1 rounded-full px-2 py-0.5 font-semibold" style={{ fontSize: 11, background: "#FFEBEE", color: "#DC2626" }}>
                        <AlertTriangle size={10} />
                        Urgent
                      </span>
                    )}
                  </div>
                  <p className="text-text-secondary truncate" style={{ fontSize: 13 }}>{n.body}</p>
                  {tab === "inbox" && (
                    <span className="text-text-muted" style={{ fontSize: 11 }}>From: {n.from}</span>
                  )}
                </div>
                <div className="flex-shrink-0 flex flex-col items-end gap-1.5">
                  <span className="text-text-muted" style={{ fontSize: 11 }}>{formatTime(n.sentAt)}</span>
                  {tab === "sent" && (
                    <span className="rounded-full px-2.5 py-0.5 font-medium" style={{ fontSize: 11, background: "#E8F5E9", color: "#2E7D32" }}>
                      Delivered
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Send Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Send Notification"
        footer={
          <>
            <button onClick={() => setModalOpen(false)} className="rounded-lg px-4 py-2 font-medium" style={{ fontSize: 14, border: "1.5px solid #E5E7EB", color: "#6B7280" }}>
              Cancel
            </button>
            <button onClick={handleSend} className="rounded-lg px-5 py-2 font-semibold text-white hover:opacity-90" style={{ fontSize: 14, background: "#2E7D32" }}>
              Send
            </button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <FormField label="Title" value={form.title} onChange={(v) => setForm((p) => ({ ...p, title: v }))} error={formErrors.title} placeholder="e.g. Collection reminder" />
          <div className="flex flex-col gap-1">
            <label className="font-medium text-text-primary" style={{ fontSize: 13 }}>Message Body</label>
            <textarea
              value={form.body}
              onChange={(e) => setForm((p) => ({ ...p, body: e.target.value }))}
              placeholder="Write your message here…"
              rows={4}
              className="rounded-lg px-3 py-2.5 outline-none resize-none"
              style={{ fontSize: 14, border: formErrors.body ? "1.5px solid #DC2626" : "1.5px solid #E5E7EB", background: "#F9FAFB" }}
            />
            {formErrors.body && <span style={{ fontSize: 12, color: "#DC2626" }}>{formErrors.body}</span>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="font-medium text-text-primary" style={{ fontSize: 13 }}>Target</label>
              <select
                value={form.target}
                onChange={(e) => setForm((p) => ({ ...p, target: e.target.value }))}
                className="rounded-lg px-3 py-2.5 outline-none"
                style={{ fontSize: 14, border: "1.5px solid #E5E7EB", background: "#F9FAFB", color: "#1A1A1A" }}
              >
                <option value="all">All in Cluster</option>
                {BARANGAYS.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                {COLLECTORS.map((c) => <option key={c.id} value={c.id}>{c.name} (Collector)</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="font-medium text-text-primary" style={{ fontSize: 13 }}>Priority</label>
              <select
                value={form.priority}
                onChange={(e) => setForm((p) => ({ ...p, priority: e.target.value }))}
                className="rounded-lg px-3 py-2.5 outline-none"
                style={{ fontSize: 14, border: "1.5px solid #E5E7EB", background: "#F9FAFB", color: "#1A1A1A" }}
              >
                <option value="normal">Normal</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function FormField({ label, type = "text", value, onChange, error, placeholder }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="font-medium text-text-primary" style={{ fontSize: 13 }}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="rounded-lg px-3 py-2.5 outline-none"
        style={{ fontSize: 14, border: error ? "1.5px solid #DC2626" : "1.5px solid #E5E7EB", background: "#F9FAFB" }}
      />
      {error && <span style={{ fontSize: 12, color: "#DC2626" }}>{error}</span>}
    </div>
  );
}


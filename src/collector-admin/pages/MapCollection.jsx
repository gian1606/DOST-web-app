import { useState } from "react";
import { CheckCircle, Send, Truck, Clock, Ruler, Cpu, MapPin, Calendar } from "lucide-react";
import MapView from "../../components/ui/MapView";
import Modal from "../../components/ui/Modal";
import StatusBadge from "../../components/ui/StatusBadge";
import { BINS, COLLECTOR_UNITS, CA_INCOMING_ROUTE } from "../../mock/data";

export default function CAMapCollection() {
  const [scheduled, setScheduled] = useState(false);
  const [scheduling, setScheduling] = useState(false);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState("");
  const [scheduleDate, setScheduleDate] = useState(new Date().toISOString().split("T")[0]);
  const [scheduleTime, setScheduleTime] = useState("07:00");
  const [formError, setFormError] = useState("");

  const route = CA_INCOMING_ROUTE;
  const clusterBins = BINS;
  const sentAt = new Date(route.sentAt).toLocaleString("en-PH", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  const optimizedAt = new Date(route.optimizedAt).toLocaleTimeString("en-PH", { hour: "2-digit", minute: "2-digit" });

  function handleScheduleConfirm() {
    if (!selectedUnit) { setFormError("Please select a collector unit."); return; }
    setFormError(""); setScheduling(true);
    setTimeout(() => { setScheduling(false); setScheduleModalOpen(false); setScheduled(true); }, 700);
  }

  const assignedUnit = COLLECTOR_UNITS.find((u) => u.id === selectedUnit);

  if (scheduled) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-6">
        <div className="flex items-center justify-center rounded-full" style={{ width: 88, height: 88, background: "#E8F5E9" }}><CheckCircle size={48} color="#2E7D32" /></div>
        <div className="text-center">
          <h1 className="font-bold text-text-primary" style={{ fontSize: 24 }}>Collection Scheduled!</h1>
          <p className="text-text-secondary mt-1" style={{ fontSize: 14 }}>Route {route.routeId} has been scheduled. {assignedUnit?.name ?? "The assigned unit"} will be notified on the mobile app.</p>
        </div>
        <div className="bg-white rounded-xl p-5 w-full" style={{ maxWidth: 480, border: "1px solid #E5E7EB", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
          <h3 className="font-semibold text-text-primary mb-4" style={{ fontSize: 15 }}>Schedule Summary</h3>
          <div className="flex flex-col gap-3">
            {[["Route ID", route.routeId], ["Assigned Unit", assignedUnit?.name ?? "—"], ["Plate Number", assignedUnit?.plateNumber ?? "—"], ["Scheduled Date", scheduleDate], ["Scheduled Time", scheduleTime], ["Bins", `${route.bins.length} bins`], ["Distance", `${route.distanceKm} km`]].map(([l, v]) => (
              <div key={l} className="flex items-center justify-between"><span className="text-text-secondary" style={{ fontSize: 13 }}>{l}</span><span className="font-semibold text-text-primary" style={{ fontSize: 13 }}>{v}</span></div>
            ))}
            <div className="flex items-center justify-between"><span className="text-text-secondary" style={{ fontSize: 13 }}>Status</span><StatusBadge status="in_progress" customLabel="Scheduled" /></div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <a href="/ca/dashboard" className="rounded-lg px-5 py-2.5 font-semibold transition-colors" style={{ fontSize: 14, border: "1.5px solid #E5E7EB", color: "#6B7280", background: "#fff" }}>Back to Dashboard</a>
          <a href="/ca/units" className="rounded-lg px-5 py-2.5 font-semibold text-white hover:opacity-90 transition-opacity" style={{ fontSize: 14, background: "#2E7D32" }}>View Collector Units</a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-3 rounded-xl px-4 py-3" style={{ background: "#E8F5E9", border: "1px solid #A5D6A7" }}>
        <CheckCircle size={18} color="#2E7D32" />
        <span className="font-semibold text-primary" style={{ fontSize: 14 }}>Optimized Route Received from Super Admin</span>
        <span className="text-text-secondary" style={{ fontSize: 13 }}>— {route.routeId} · {route.bins.length} bins · {route.distanceKm} km · Sent {sentAt}</span>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bold text-text-primary" style={{ fontSize: 28 }}>Map &amp; Collection</h1>
          <p className="text-text-secondary mt-0.5" style={{ fontSize: 14 }}>{route.bins.length} bins · Est. {route.estimatedMinutes} min · {route.distanceKm} km</p>
        </div>
        <button onClick={() => setScheduleModalOpen(true)} className="flex items-center gap-2 rounded-lg px-4 py-2.5 font-semibold text-white hover:opacity-90 transition-opacity" style={{ fontSize: 14, background: "#2E7D32" }}><Send size={15} />Schedule Collection</button>
      </div>

      <div className="grid gap-4" style={{ gridTemplateColumns: "1fr 380px" }}>
        <div className="bg-white rounded-xl p-4" style={{ border: "1px solid #E5E7EB", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
          <MapView bins={clusterBins} trucks={COLLECTOR_UNITS.map((u) => ({ id: u.id, label: u.name, status: u.status, posX: u.posX, posY: u.posY }))} mrfs={[]} routeOrder={route.order} showRoute={true} height={500} />
        </div>
        <div className="bg-white rounded-xl p-5 flex flex-col gap-4" style={{ border: "1px solid #E5E7EB", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-text-primary" style={{ fontSize: 17 }}>Route Details</h2>
            <StatusBadge status={route.status} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[[<Ruler size={14} color="#6B7280" />, "Total Distance", `${route.distanceKm} km`], [<Clock size={14} color="#6B7280" />, "Est. Time", `${route.estimatedMinutes} min`], [<MapPin size={14} color="#6B7280" />, "Bins to Collect", route.bins.length], [<Cpu size={14} color="#6B7280" />, "Algorithm", "Nearest Neighbor"]].map(([icon, label, value], i) => (
              <div key={i} className="rounded-lg p-3 flex flex-col gap-1" style={{ background: "#F9FAFB", border: "1px solid #F3F4F6" }}>
                <div className="flex items-center gap-1.5">{icon}<span className="text-text-muted" style={{ fontSize: 11 }}>{label}</span></div>
                <div className="font-semibold text-text-primary" style={{ fontSize: 14 }}>{value}</div>
              </div>
            ))}
          </div>
          <div className="text-text-muted" style={{ fontSize: 12 }}>Optimized at {optimizedAt} · Sent by {route.sentBy}</div>
          <div>
            <h3 className="font-semibold text-text-primary mb-3" style={{ fontSize: 14 }}>Collection Order</h3>
            <div className="flex flex-col gap-2">
              {route.order.map((stop, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="flex-shrink-0 flex items-center justify-center rounded-full font-bold text-white" style={{ width: 26, height: 26, fontSize: 11, background: stop.type === "depot" ? "#D97706" : "#2E7D32" }}>{stop.type === "depot" ? "D" : i}</div>
                  <div>
                    <div className="font-semibold text-text-primary" style={{ fontSize: 13 }}>{stop.label}</div>
                    {stop.street && <div className="text-text-muted" style={{ fontSize: 11 }}>{stop.street}</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <button onClick={() => setScheduleModalOpen(true)} className="w-full rounded-lg py-2.5 font-semibold text-white mt-auto hover:opacity-90 transition-opacity" style={{ fontSize: 14, background: "#2E7D32" }}>Schedule Collection</button>
        </div>
      </div>

      <Modal open={scheduleModalOpen} onClose={() => { setScheduleModalOpen(false); setFormError(""); }} title="Schedule Collection"
        footer={<>
          <button onClick={() => { setScheduleModalOpen(false); setFormError(""); }} className="rounded-lg px-4 py-2 font-medium" style={{ fontSize: 14, border: "1.5px solid #E5E7EB", color: "#6B7280" }}>Cancel</button>
          <button onClick={handleScheduleConfirm} disabled={scheduling} className="rounded-lg px-5 py-2 font-semibold text-white hover:opacity-90 transition-opacity" style={{ fontSize: 14, background: "#2E7D32", opacity: scheduling ? 0.7 : 1 }}>{scheduling ? "Scheduling…" : "Deploy Route"}</button>
        </>}
      >
        <div className="flex flex-col gap-4">
          <div className="rounded-lg p-3 flex flex-col gap-1.5" style={{ background: "#F9FAFB", border: "1px solid #E5E7EB" }}>
            <div className="font-semibold text-text-primary" style={{ fontSize: 13 }}>{route.routeId}</div>
            <div className="text-text-secondary" style={{ fontSize: 12 }}>{route.bins.length} bins · {route.distanceKm} km · Est. {route.estimatedMinutes} min</div>
          </div>
          <div className="flex flex-col gap-1">
            <label className="font-medium text-text-primary" style={{ fontSize: 13 }}>Assign Collector Unit</label>
            <select value={selectedUnit} onChange={(e) => { setSelectedUnit(e.target.value); setFormError(""); }} className="rounded-lg px-3 py-2.5 outline-none" style={{ fontSize: 14, border: formError ? "1.5px solid #DC2626" : "1.5px solid #E5E7EB", background: "#F9FAFB", color: "#1A1A1A" }}>
              <option value="">Select a unit…</option>
              {COLLECTOR_UNITS.map((u) => <option key={u.id} value={u.id}>{u.name} ({u.plateNumber}) — {u.status.replace("_", " ")}</option>)}
            </select>
            {formError && <span style={{ fontSize: 12, color: "#DC2626" }}>{formError}</span>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="font-medium text-text-primary" style={{ fontSize: 13 }}><Calendar size={12} className="inline mr-1" />Date</label>
              <input type="date" value={scheduleDate} onChange={(e) => setScheduleDate(e.target.value)} className="rounded-lg px-3 py-2.5 outline-none" style={{ fontSize: 14, border: "1.5px solid #E5E7EB", background: "#F9FAFB" }} />
            </div>
            <div className="flex flex-col gap-1">
              <label className="font-medium text-text-primary" style={{ fontSize: 13 }}><Clock size={12} className="inline mr-1" />Time</label>
              <input type="time" value={scheduleTime} onChange={(e) => setScheduleTime(e.target.value)} className="rounded-lg px-3 py-2.5 outline-none" style={{ fontSize: 14, border: "1.5px solid #E5E7EB", background: "#F9FAFB" }} />
            </div>
          </div>
          <p className="text-text-muted" style={{ fontSize: 12 }}>The assigned collector unit will receive a notification on the mobile app with the full route details.</p>
        </div>
      </Modal>
    </div>
  );
}


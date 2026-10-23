/**
 * MapView — styled placeholder map with percentage-based markers.
 * Wrap in this component so a real map library can replace it later.
 *
 * Props:
 *   bins        — array of bin objects with posX, posY, status
 *   trucks      — array of truck objects with posX, posY, status
 *   mrfs        — array of MRF objects with posX, posY, status
 *   routeOrder  — array of ordered stops for route line (posX, posY)
 *   showRoute   — boolean, draw dashed route line
 *   height      — CSS height string (default "100%")
 */
import { STATUS_COLORS } from "../../constants/index.js";
import { colors, MAP_PLACEHOLDER_BG } from "../../theme/colors.js";

// Simple SVG polyline connecting route stops
function RouteLine({ stops }) {
  if (!stops || stops.length < 2) return null;
  const points = stops.map((s) => `${s.posX * 100},${s.posY * 100}`).join(" ");
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
    >
      <polyline
        points={points}
        fill="none"
        stroke={colors.recyclable}
        strokeWidth="0.6"
        strokeDasharray="2,1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {stops.slice(0, -1).map((stop, i) => {
        const next = stops[i + 1];
        const mx = ((stop.posX + next.posX) / 2) * 100;
        const my = ((stop.posY + next.posY) / 2) * 100;
        return (
          <circle key={i} cx={mx} cy={my} r="0.8" fill={colors.recyclable} opacity="0.7" />
        );
      })}
    </svg>
  );
}

export default function MapView({
  bins = [],
  trucks = [],
  mrfs = [],
  routeOrder = [],
  showRoute = false,
  height = "100%",
}) {
  return (
    <div
      className="relative overflow-hidden rounded-xl"
      style={{ height, background: MAP_PLACEHOLDER_BG, minHeight: 280 }}
    >
      {/* Grid lines */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none opacity-20"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        {[10, 20, 30, 40, 50, 60, 70, 80, 90].map((v) => (
          <g key={v}>
            <line x1={v} y1="0" x2={v} y2="100" stroke={colors.primary} strokeWidth="0.3" />
            <line x1="0" y1={v} x2="100" y2={v} stroke={colors.primary} strokeWidth="0.3" />
          </g>
        ))}
      </svg>

      {/* Map label */}
      <div
        className="absolute top-3 left-3 font-semibold rounded-md px-2 py-1 text-primary"
        style={{ fontSize: 11, background: "rgba(255,255,255,0.85)" }}
      >
        Batangas City
      </div>

      {showRoute && <RouteLine stops={routeOrder} />}

      {/* MRF markers */}
      {mrfs.map((m) => (
        <div
          key={m.id}
          className="absolute flex items-center justify-center rounded-md font-bold shadow-sm text-white"
          style={{
            left: `calc(${m.posX * 100}% - 10px)`,
            top: `calc(${m.posY * 100}% - 10px)`,
            width: 20,
            height: 20,
            background: colors.recyclable,
            fontSize: 10,
            zIndex: 2,
          }}
          title={m.name}
        >
          M
        </div>
      ))}

      {/* Bin markers */}
      {bins.map((b) => (
        <div
          key={b.id}
          className="absolute rounded-full shadow-sm border-2 border-white"
          style={{
            left: `calc(${b.posX * 100}% - 7px)`,
            top: `calc(${b.posY * 100}% - 7px)`,
            width: 14,
            height: 14,
            background: STATUS_COLORS[b.status] ?? colors.gray500,
            zIndex: 3,
          }}
          title={`${b.name} — ${b.status}`}
        />
      ))}

      {/* Truck markers */}
      {trucks.map((t) => (
        <div
          key={t.id}
          className="absolute flex items-center justify-center rounded-full shadow-md border-2 border-white"
          style={{
            left: `calc(${t.posX * 100}% - 10px)`,
            top: `calc(${t.posY * 100}% - 10px)`,
            width: 20,
            height: 20,
            background: colors.warning,
            fontSize: 10,
            zIndex: 4,
          }}
          title={t.label}
        >
          🚛
        </div>
      ))}

      {/* Route order numbers */}
      {showRoute &&
        routeOrder.map((stop, i) => (
          <div
            key={i}
            className="absolute flex items-center justify-center rounded-full font-bold border-2 border-white shadow text-white"
            style={{
              left: `calc(${stop.posX * 100}% - 11px)`,
              top: `calc(${stop.posY * 100}% - 11px)`,
              width: 22,
              height: 22,
              background: stop.type === "depot" ? colors.warning : colors.primary,
              fontSize: 10,
              zIndex: 5,
            }}
            title={stop.label}
          >
            {stop.type === "depot" ? "D" : i}
          </div>
        ))}

      {/* Legend */}
      <div
        className="absolute top-3 right-3 rounded-lg p-2 flex flex-col gap-1.5"
        style={{ background: "rgba(255,255,255,0.92)", fontSize: 11 }}
      >
        <LegendItem color={colors.error}      label="Full" />
        <LegendItem color={colors.primary}    label="OK / Collected" />
        <LegendItem color={colors.warning}    label="Truck" shape="circle" />
        <LegendItem color={colors.recyclable} label="MRF"  shape="square" />
      </div>

      {/* Zoom controls */}
      <div className="absolute bottom-3 right-3 flex flex-col gap-1">
        {["+", "−"].map((s) => (
          <button
            key={s}
            className="flex items-center justify-center rounded font-bold shadow text-primary border border-gray-200 bg-white"
            style={{ width: 28, height: 28, fontSize: 16 }}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Satellite toggle */}
      <div className="absolute bottom-3 left-3">
        <button
          className="rounded-lg px-2.5 py-1 font-medium shadow bg-white text-text-muted border border-gray-200"
          style={{ fontSize: 11 }}
        >
          Satellite
        </button>
      </div>
    </div>
  );
}

function LegendItem({ color, label, shape = "circle" }) {
  return (
    <div className="flex items-center gap-1.5">
      <div
        style={{
          width: 10,
          height: 10,
          background: color,
          borderRadius: shape === "circle" ? "50%" : 2,
          flexShrink: 0,
        }}
      />
      <span className="text-text-muted">{label}</span>
    </div>
  );
}

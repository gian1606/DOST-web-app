import { colors } from "../../../theme/colors.js";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import {
  Trash2,
  CheckCircle,
  Activity,
  RefreshCw,
  Trophy,
  TrendingUp,
  AlertTriangle,
  Home,
  Building2,
} from "lucide-react";
import StatCard from "../../../components/ui/StatCard";
import AlertRow from "../../../components/ui/AlertRow";
import ActivityRow from "../../../components/ui/ActivityRow";
import MapView from "../../../components/ui/MapView";
import {
  BINS,
  TRUCKS,
  MRF_LOCATIONS,
  RECENT_ACTIVITY,
  LEADERBOARD,
} from "../../../mock/data";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { ROUTES } from "../../../constants/index.js";
import { fetchAllBarangays, fetchMyClusterInfo } from "../../../services/superAdmin.js";

// Weekly collection trend (mock analytics data)
const WEEKLY_DATA = [
  { day: "Mon", collected: 14, full: 8 },
  { day: "Tue", collected: 19, full: 11 },
  { day: "Wed", collected: 22, full: 6 },
  { day: "Thu", collected: 17, full: 9 },
  { day: "Fri", collected: 25, full: 4 },
  { day: "Sat", collected: 12, full: 13 },
  { day: "Sun", collected: 8,  full: 5 },
];

export default function PBDashboard() {
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  
  const [clusterInfo, setClusterInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  // Get barangay name from logged-in user
  const barangayName = user?.barangay || "Unknown";

  // Force refresh user data on mount to get latest barangay name
  useEffect(() => {
    async function initialize() {
      try {
        await refreshUser(); // Refresh user data from database
      } catch (error) {
        console.error("Failed to refresh user on mount:", error);
      }
    }
    initialize();
  }, []); // Run once on mount

  // Fetch cluster information for this barangay
  useEffect(() => {
    async function loadClusterInfo() {
      try {
        const clusterLabel = await fetchMyClusterInfo();
        console.log('Cluster label from API:', clusterLabel);
        setClusterInfo(clusterLabel);
      } catch (error) {
        console.error("Failed to load cluster info:", error);
      } finally {
        setLoading(false);
      }
    }
    
    if (barangayName && barangayName !== "Unknown") {
      loadClusterInfo();
    } else {
      setLoading(false);
    }
  }, [barangayName]);

  // Refresh user data AND cluster info when window gains focus (in case barangay was renamed)
  useEffect(() => {
    async function handleFocus() {
      try {
        // Refresh user data from database first
        await refreshUser();
        
        // Then refresh cluster info
        if (barangayName && barangayName !== "Unknown") {
          const clusterLabel = await fetchMyClusterInfo();
          setClusterInfo(clusterLabel);
        }
      } catch (error) {
        console.error("Failed to refresh data:", error);
      }
    }
    
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [barangayName, refreshUser]);

  // Listen for barangay updates from Super Admin
  useEffect(() => {
    async function handleBarangayUpdated() {
      try {
        // Refresh user data to get the new barangay name
        await refreshUser();
      } catch (error) {
        console.error("Failed to refresh after barangay update:", error);
      }
    }
    
    window.addEventListener('barangayUpdated', handleBarangayUpdated);
    return () => window.removeEventListener('barangayUpdated', handleBarangayUpdated);
  }, [refreshUser]);

  // Listen for cluster updates from Super Admin
  useEffect(() => {
    async function handleClusterUpdated() {
      try {
        // Refresh cluster info when Super Admin edits cluster name or assignments
        if (barangayName && barangayName !== "Unknown") {
          const clusterLabel = await fetchMyClusterInfo();
          setClusterInfo(clusterLabel);
        }
      } catch (error) {
        console.error("Failed to refresh after cluster update:", error);
      }
    }
    
    window.addEventListener('clusterUpdated', handleClusterUpdated);
    return () => window.removeEventListener('clusterUpdated', handleClusterUpdated);
  }, [barangayName]);

  // Show only bins within this barangay
  const filteredBins = BINS.filter((b) => b.barangay === barangayName);
  const filteredTrucks = TRUCKS;
  const filteredMRFs = MRF_LOCATIONS.filter((m) => m.barangay === barangayName);
  const fullBins = filteredBins.filter((b) => b.status === "full");

  const stats = {
    totalBins: filteredBins.length,
    fullBins: fullBins.length,
    collectedToday: filteredBins.filter((b) => b.status === "collected").length,
  };

  const today = new Date().toLocaleDateString("en-PH", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Top 3 households for leaderboard preview
  const topHouseholds = LEADERBOARD.slice(0, 3);

  return (
    <div className="flex flex-col gap-6">
      {/* Page header */}
      <div
        className="flex items-center justify-between rounded-xl px-5 py-4"
        style={{
          background: colors.white,
          border: "1px solid " + colors.gray200,
          boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
        }}
      >
        <div>
          <h1 className="font-bold text-text-primary" style={{ fontSize: 28 }}>
            Barangay {barangayName} Dashboard
          </h1>
          <div className="flex items-center gap-3 mt-1">
            <p className="text-text-secondary" style={{ fontSize: 14 }}>
              {today}
            </p>
            {!loading && (
              <>
                <span
                  className="rounded-full"
                  style={{
                    width: 4,
                    height: 4,
                    background: colors.gray300,
                  }}
                />
                <div className="flex items-center gap-1.5">
                  <Building2 size={14} color={clusterInfo ? colors.primary : colors.gray400} />
                  <span 
                    className="font-medium" 
                    style={{ 
                      fontSize: 14, 
                      color: clusterInfo ? colors.primary : colors.gray500 
                    }}>
                    {clusterInfo || "Not assigned to a cluster"}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
        <button
          className="flex items-center gap-2 rounded-lg px-4 py-2 font-medium transition-colors"
          style={{
            fontSize: 13,
            border: "1.5px solid " + colors.gray200,
            background: colors.white,
            color: colors.gray500,
          }}
        >
          <RefreshCw size={14} />
          Refresh
        </button>
      </div>

      {/* Stats row — 3 primary KPIs */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard
          icon={<Trash2 size={18} color={colors.gray500} />}
          value={stats.totalBins}
          label="Total Bins"
          subLabel={`Brgy. ${barangayName}`}
        />
        <StatCard
          icon={<Trash2 size={18} color={colors.error} />}
          value={stats.fullBins}
          label="Full Bins"
          subLabel={stats.fullBins > 0 ? "Needs collection" : "All clear"}
          subLabelColor={stats.fullBins > 0 ? colors.error : colors.primary}
        />
        <StatCard
          icon={<CheckCircle size={18} color={colors.primary} />}
          value={stats.collectedToday}
          label="Bins Collected Today"
          subLabel={`${Math.round(
            (stats.collectedToday / Math.max(stats.totalBins, 1)) * 100
          )}% of target`}
          subLabelColor={colors.primary}
        />
      </div>

      {/* 70/30 main layout */}
      <div
        className="grid gap-4"
        style={{ gridTemplateColumns: "1fr 380px" }}
      >
        {/* ── LEFT COLUMN (70%) ── */}
        <div className="flex flex-col gap-4">
          {/* Live Map */}
          <div
            className="bg-white rounded-xl p-4 flex flex-col gap-3"
            style={{ border: "1px solid " + colors.gray200, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}
          >
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-text-primary" style={{ fontSize: 17 }}>
                Live Monitoring Map
              </h2>
              <span
                className="flex items-center gap-1.5 rounded-full px-2.5 py-1 font-medium"
                style={{ fontSize: 11, background: colors.accentSoft, color: colors.primary }}
              >
                <span
                  className="rounded-full"
                  style={{
                    width: 6,
                    height: 6,
                    background: colors.primary,
                    display: "inline-block",
                  }}
                />
                Live
              </span>
            </div>
            <MapView
              bins={filteredBins}
              trucks={filteredTrucks}
              mrfs={filteredMRFs}
              height={380}
            />
          </div>

          {/* Embedded Analytics — Weekly Collection Trend */}
          <div
            className="bg-white rounded-xl p-5 flex flex-col gap-4"
            style={{ border: "1px solid " + colors.gray200, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp size={17} color={colors.primary} />
                <h2 className="font-semibold text-text-primary" style={{ fontSize: 17 }}>
                  Weekly Collection Trend
                </h2>
              </div>
              <span className="text-text-muted" style={{ fontSize: 12 }}>
                May 12 – 18, 2025
              </span>
            </div>

            {/* Summary chips */}
            <div className="flex items-center gap-3">
              <div
                className="rounded-lg px-3 py-2 flex flex-col"
                style={{ background: colors.accentSoft, minWidth: 100 }}
              >
                <span className="font-bold text-primary" style={{ fontSize: 22 }}>
                  {WEEKLY_DATA.reduce((s, d) => s + d.collected, 0)}
                </span>
                <span style={{ fontSize: 11, color: colors.primary }}>Bins Collected</span>
              </div>
              <div
                className="rounded-lg px-3 py-2 flex flex-col"
                style={{ background: colors.errorSoft, minWidth: 100 }}
              >
                <span className="font-bold" style={{ fontSize: 22, color: colors.error }}>
                  {WEEKLY_DATA.reduce((s, d) => s + d.full, 0)}
                </span>
                <span style={{ fontSize: 11, color: colors.error }}>Full Reports</span>
              </div>
              <div
                className="rounded-lg px-3 py-2 flex flex-col"
                style={{ background: colors.gray100, minWidth: 100 }}
              >
                <span className="font-bold text-text-primary" style={{ fontSize: 22 }}>
                  {Math.round(
                    (WEEKLY_DATA.reduce((s, d) => s + d.collected, 0) /
                      Math.max(
                        WEEKLY_DATA.reduce((s, d) => s + d.collected + d.full, 0),
                        1
                      )) *
                      100
                  )}
                  %
                </span>
                <span style={{ fontSize: 11, color: colors.gray500 }}>Collection Rate</span>
              </div>
            </div>

            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={WEEKLY_DATA} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke={colors.gray100} vertical={false} />
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 12, fill: colors.textMuted }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: colors.textMuted }}
                  axisLine={false}
                  tickLine={false}
                  width={28}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 10,
                    border: "1px solid " + colors.gray200,
                    fontSize: 13,
                  }}
                />
                <Bar dataKey="collected" name="Collected" fill={colors.primary} radius={[4, 4, 0, 0]} />
                <Bar dataKey="full" name="Full Reports" fill={colors.errorBorder} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ── RIGHT COLUMN (30%) ── */}
        <div className="flex flex-col gap-4">
          {/* Full Bin Alerts */}
          <div
            className="bg-white rounded-xl p-4 flex flex-col gap-2"
            style={{ border: "1px solid " + colors.gray200, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <AlertTriangle size={16} color={colors.error} />
                <h2 className="font-semibold text-text-primary" style={{ fontSize: 17 }}>
                  Full Bin Alerts
                </h2>
              </div>
              <span
                className="rounded-full px-2.5 py-0.5 font-semibold"
                style={{ fontSize: 12, background: colors.errorSoft, color: colors.error }}
              >
                {fullBins.length}
              </span>
            </div>

            <div className="overflow-y-auto" style={{ maxHeight: 200 }}>
              {fullBins.length === 0 ? (
                <p className="text-text-muted text-center py-6" style={{ fontSize: 13 }}>
                  No full bins reported.
                </p>
              ) : (
                fullBins.map((b) => (
                  <AlertRow
                    key={b.id}
                    name={b.name}
                    description={`${b.street}, ${b.barangay}`}
                    timeReported={b.timeReported}
                  />
                ))
              )}
            </div>
          </div>

          {/* Leaderboard Preview */}
          <div
            className="bg-white rounded-xl p-4 flex flex-col gap-3"
            style={{ border: "1px solid " + colors.gray200, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Trophy size={16} color={colors.warning} />
                <h2 className="font-semibold text-text-primary" style={{ fontSize: 17 }}>
                  Top Households
                </h2>
              </div>
              <button
                onClick={() => navigate(ROUTES.PB.LEADERBOARD)}
                className="font-medium transition-colors hover:underline"
                style={{ fontSize: 12, color: colors.primary }}
              >
                View All
              </button>
            </div>

            <div className="flex flex-col gap-2">
              {topHouseholds.map((r) => (
                <div
                  key={r.residentId}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5"
                  style={{ background: colors.gray50, border: "1px solid #F3F4F6" }}
                >
                  {/* Rank badge */}
                  <div
                    className="flex-shrink-0 flex items-center justify-center rounded-full font-bold text-white"
                    style={{
                      width: 28,
                      height: 28,
                      fontSize: 12,
                      background:
                        r.rank === 1 ? colors.rankGoldText : r.rank === 2 ? colors.textMuted : colors.rankBronzeText,
                    }}
                  >
                    {r.rank}
                  </div>
                  <div
                    className="flex-shrink-0 flex items-center justify-center rounded-full"
                    style={{ width: 26, height: 26, background: colors.accentSoft }}
                  >
                    <Home size={13} color={colors.primary} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div
                      className="font-semibold text-text-primary truncate"
                      style={{ fontSize: 13 }}
                    >
                      {r.name}
                    </div>
                    <div className="text-text-muted truncate" style={{ fontSize: 11 }}>
                      {r.street}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="font-bold text-primary" style={{ fontSize: 14 }}>
                      {r.pointsEarned}
                    </div>
                    <div className="text-text-muted" style={{ fontSize: 10 }}>
                      pts
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div
            className="bg-white rounded-xl p-4 flex flex-col gap-2 flex-1"
            style={{ border: "1px solid " + colors.gray200, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}
          >
            <div className="flex items-center gap-2 mb-1">
              <Activity size={16} color={colors.gray500} />
              <h2 className="font-semibold text-text-primary" style={{ fontSize: 17 }}>
                Recent Activity
              </h2>
            </div>
            <div className="overflow-y-auto" style={{ maxHeight: 200 }}>
              {RECENT_ACTIVITY.map((a) => (
                <ActivityRow
                  key={a.id}
                  event={a.event}
                  description={a.description}
                  timestamp={a.timestamp}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


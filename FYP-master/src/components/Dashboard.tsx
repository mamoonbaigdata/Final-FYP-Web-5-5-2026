import { useEffect, useState, useMemo } from "react";
import { ref, onValue } from "firebase/database";
import { database, firebaseEnabled } from "@/lib/firebase";
import { Droplets, Thermometer, Beaker, Activity, Waves, ShieldCheck, AlertTriangle } from "lucide-react";
import { predictKNN } from "@/lib/ml";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import { useWaterData } from "@/providers/WaterDataProvider";
import NaegleriaRiskCard from "./NaegleriaRiskCard";
import WaterQualityOrb from "./WaterQualityOrb";

/* ── Glassmorphism card helper ── */
const GlassCard = ({ children, className = "", ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={`rounded-2xl border border-white/15 backdrop-blur-xl shadow-lg transition-all duration-300 hover:shadow-xl hover:border-white/25 ${className}`}
    style={{ background: "rgba(255,255,255,0.07)" }}
    {...props}
  >
    {children}
  </div>
);

/* ── Small stat card (like Wins / Losses / Winning% in the reference) ── */
const StatMini = ({ icon, label, value, unit, color }: { icon: React.ReactNode; label: string; value: string; unit: string; color: string }) => (
  <GlassCard className="p-4 flex flex-col items-center gap-1.5 text-center">
    <div className="p-2 rounded-xl" style={{ background: `${color}25` }}>
      <span className="[&>svg]:size-5" style={{ color }}>{icon}</span>
    </div>
    <span className="text-[11px] font-medium text-white/50 uppercase tracking-wider">{label}</span>
    <span className="text-2xl font-bold text-white tracking-tight">{value}</span>
    <span className="text-[10px] text-white/40">{unit}</span>
  </GlassCard>
);

/* ── Info row (like Height / Weight / Age / Country) ── */
const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <GlassCard className="px-4 py-3 flex items-center justify-between">
    <span className="text-xs text-white/50 font-medium">{label}</span>
    <span className="text-sm font-bold text-white">{value}</span>
  </GlassCard>
);

const Dashboard = () => {
  const { data, isConnected, lastUpdate } = useWaterData();

  const [storedSeries, setStoredSeries] = useState<Array<{ time: string; temp?: number; ph?: number; chlorine?: number; level?: number }>>([]);
  const [todayAvgTemp, setTodayAvgTemp] = useState<number | null>(null);

  const mlPrediction = useMemo(() => {
    if (data.pH == null || data.chlorine == null || data.waterTemperature == null) return { status: "Unknown", label: "No Data", color: "#6b7280" };
    const pred = predictKNN(data.pH, data.chlorine, data.waterTemperature);
    if (pred === "Clean") return { status: "Clean", label: "Optimal Condition", color: "#22c55e" };
    if (pred === "Needs Attention") return { status: "Needs Attention", label: "Monitor Closely", color: "#f59e0b" };
    if (pred === "Dirty") return { status: "Dirty", label: "Action Required", color: "#ef4444" };
    return { status: "Unknown", label: "No Data", color: "#6b7280" };
  }, [data.pH, data.chlorine, data.waterTemperature]);



  /* ── Firebase daily history ── */
  useEffect(() => {
    if (!firebaseEnabled || !database) return;
    const historyRef = ref(database, 'waterQualityHistory');
    const unsub = onValue(historyRef, (snap) => {
      const val = snap.val();
      if (!val || typeof val !== 'object') { setTodayAvgTemp(null); return; }
      const entries = Object.entries(val) as Array<[string, any]>;
      const dayAverages = entries.map(([date, list]) => {
        const arr = Array.isArray(list) ? list : list && typeof list === 'object' ? Object.values(list) : [];
        const temps = arr.map((it: any) => typeof it?.waterTemperature === 'number' ? it.waterTemperature : parseFloat(String(it?.waterTemperature ?? 'NaN'))).filter((n: number) => Number.isFinite(n));
        const avgT = temps.length ? temps.reduce((a: number, b: number) => a + b, 0) / temps.length : NaN;
        return { date, temp: avgT };
      });
      const todayStr = new Date().toISOString().slice(0, 10);
      const today = dayAverages.find(d => d.date === todayStr);
      setTodayAvgTemp(today && Number.isFinite(today.temp) ? today.temp : null);
    });
    return () => unsub();
  }, [firebaseEnabled, database]);

  /* ── 10-min stored averages for trend charts ── */
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/kpi?limit=72');
        const json = await res.json();
        const items: Array<any> = Array.isArray(json?.items) ? json.items : [];
        const cleaned = items
          .filter(it => typeof it?.timestamp === 'number')
          .map(it => ({
            ts: it.timestamp as number,
            temp: typeof it?.waterTemperature === 'number' ? it.waterTemperature : parseFloat(String(it?.waterTemperature ?? 'NaN')),
            ph: typeof it?.pH === 'number' ? it.pH : parseFloat(String(it?.pH ?? 'NaN')),
            chlorine: typeof it?.chlorine === 'number' ? it.chlorine : parseFloat(String(it?.chlorine ?? 'NaN')),
            level: typeof it?.waterLevel === 'number' ? it.waterLevel : parseFloat(String(it?.waterLevel ?? 'NaN')),
          }))
          .filter(it => [it.temp, it.ph, it.chlorine, it.level].some(n => Number.isFinite(n as number)));
        cleaned.sort((a, b) => a.ts - b.ts);
        const last72 = cleaned.slice(-72);
        const series = last72.map(e => {
          const d = new Date(e.ts);
          return {
            time: `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`,
            temp: Number.isFinite(e.temp) ? e.temp : undefined,
            ph: Number.isFinite(e.ph) ? e.ph : undefined,
            chlorine: Number.isFinite(e.chlorine) ? e.chlorine : undefined,
            level: Number.isFinite(e.level) ? e.level : undefined,
          };
        });
        setStoredSeries(series);

        const todayStr = new Date().toISOString().slice(0, 10);
        const todays = items.filter(it => it?.date === todayStr && Number.isFinite(parseFloat(String(it?.waterTemperature ?? 'NaN'))));
        const tvals = todays.map(it => typeof it?.waterTemperature === 'number' ? it.waterTemperature : parseFloat(String(it?.waterTemperature))).filter(n => Number.isFinite(n));
        const avgToday = tvals.length ? tvals.reduce((a, b) => a + b, 0) / tvals.length : NaN;
        setTodayAvgTemp(Number.isFinite(avgToday) ? avgToday : null);
      } catch { }
    };
    load();
    const intId = setInterval(load, 15000);
    return () => clearInterval(intId);
  }, []);

  /* ── Status helper ── */
  const getStatus = (val: number, tMin: number, tMax: number) => {
    if (val >= tMin && val <= tMax) return { label: "Optimal", color: "#22c55e" };
    return { label: "Warning", color: "#f59e0b" };
  };
  const phStatus = getStatus(data.pH, 7.4, 7.6);
  const clStatus = getStatus(data.chlorine, 1.5, 2.0);
  const tempStatus = getStatus(data.waterTemperature, 26, 28);
  const lvlStatus = getStatus(data.waterLevel, 80, 95);

  return (
    <div
      className="min-h-screen p-4 md:p-6 lg:p-8"
      style={{
        background: "linear-gradient(135deg, #0f2942 0%, #134163 30%, #1a5276 50%, #134163 70%, #0f2942 100%)",
      }}
    >
      <div className="max-w-[1400px] mx-auto">

        {/* ════════════════════════ TOP BAR ════════════════════════ */}
        <div className="flex items-center justify-end mb-8">
          <div className="flex items-center gap-3">
            <div className={`w-2.5 h-2.5 rounded-full ${isConnected ? 'bg-green-400 animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.6)]' : 'bg-red-500'}`} />
            <span className="text-sm text-white/60">{isConnected ? 'Live' : 'Disconnected'}</span>
            {lastUpdate && <span className="text-xs text-white/40 hidden sm:inline">· {lastUpdate.toLocaleTimeString()}</span>}
          </div>
        </div>

        {/* ════════════════════════ HERO SECTION (2-column) ════════════════════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">

          {/* ── LEFT: 3D Water Quality Orb ── */}
          <div className="lg:col-span-5">
            <GlassCard className="relative overflow-hidden h-full min-h-[420px]">
              <WaterQualityOrb
                pH={data.pH}
                chlorine={data.chlorine}
                waterTemperature={data.waterTemperature}
                waterLevel={data.waterLevel}
                status={mlPrediction.status as "Clean" | "Needs Attention" | "Dirty" | "Unknown"}
              />
            </GlassCard>
          </div>

          {/* ── RIGHT: Title + Stat Cards + Info Rows ── */}
          <div className="lg:col-span-7 flex flex-col gap-5">
            {/* Title */}
            <div>
              <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight whitespace-nowrap">
                Water Quality Monitor
              </h1>
              <div className="flex items-center gap-2 mt-2">
                <Waves className="w-5 h-5 text-sky-400" />
                <span className="text-white/50 text-sm font-medium">Smart Pool Monitoring System</span>
              </div>
            </div>

            {/* 4 stat cards in a row (like Wins/Losses/Winning%) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <StatMini icon={<Droplets />} label="pH Level" value={data.pH.toFixed(1)} unit="Target: 7.4–7.6" color="#818cf8" />
              <StatMini icon={<Beaker />} label="Chlorine" value={data.chlorine.toFixed(2)} unit="Target: 1.5–2.0 ppm" color="#34d399" />
              <StatMini icon={<Thermometer />} label="Temp" value={`${data.waterTemperature.toFixed(1)}°`} unit="Target: 26–28°C" color="#fb923c" />
              <StatMini icon={<Activity />} label="Level" value={`${data.waterLevel.toFixed(0)}`} unit="Target: 80–95 cm" color="#60a5fa" />
            </div>

            {/* Info rows (like Height/Weight/Age/Country) */}
            <div className="grid grid-cols-2 gap-3">
              <InfoRow label="pH Status" value={phStatus.label} />
              <InfoRow label="Chlorine Status" value={clStatus.label} />
              <InfoRow label="Temp Status" value={tempStatus.label} />
              <InfoRow label="Water Level" value={lvlStatus.label} />
            </div>

            {/* ML Prediction + Naegleria row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* ML Prediction card */}
              <GlassCard className="p-5 flex flex-col items-center text-center gap-3">
                <div className="p-2.5 rounded-xl" style={{ background: `${mlPrediction.color}25` }}>
                  <ShieldCheck className="w-6 h-6" style={{ color: mlPrediction.color }} />
                </div>
                <span className="text-[11px] text-white/50 uppercase tracking-wider font-medium">ML Prediction</span>
                <span
                  className="px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border"
                  style={{ borderColor: `${mlPrediction.color}40`, background: `${mlPrediction.color}20`, color: mlPrediction.color }}
                >
                  {mlPrediction.status}
                </span>
                <span className="text-sm font-semibold text-white">{mlPrediction.label}</span>
              </GlassCard>

              {/* Connection info card */}
              <GlassCard className="p-5 flex flex-col items-center text-center gap-3">
                <div className="p-2.5 rounded-xl bg-sky-500/20">
                  <AlertTriangle className="w-6 h-6 text-sky-400" />
                </div>
                <span className="text-[11px] text-white/50 uppercase tracking-wider font-medium">System Status</span>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.6)]' : 'bg-red-500'}`} />
                  <span className="text-sm font-bold text-white">{isConnected ? 'All Systems Online' : 'Connection Lost'}</span>
                </div>
                {todayAvgTemp !== null && (
                  <span className="text-xs text-white/40">Avg Temp Today: {todayAvgTemp.toFixed(1)}°C</span>
                )}
              </GlassCard>
            </div>
          </div>
        </div>

        {/* ════════════════════════ NAEGLERIA RISK ════════════════════════ */}
        <div className="mb-8">
          <NaegleriaRiskCard data={data} />
        </div>

        {/* ════════════════════════ TREND CHARTS (Bottom Section) ════════════════════════ */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-sky-400" />
            Recent Trends
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Temperature Trend */}
            <GlassCard className="p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-white flex items-center gap-2">
                  <Thermometer className="w-4 h-4 text-amber-400" /> Temperature
                </span>
                <span className="text-xs text-white/40">Last 12 hrs</span>
              </div>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={storedSeries.map(d => ({ time: d.time, value: typeof d.temp === 'number' ? Number(d.temp.toFixed(2)) : undefined }))} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                    <XAxis dataKey="time" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} axisLine={false} />
                    <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} axisLine={false} />
                    <Tooltip contentStyle={{ background: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#fff', fontSize: 12 }} />
                    <Line type="monotone" dataKey="value" name="Temp (°C)" stroke="#f59e0b" strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </GlassCard>

            {/* pH Trend */}
            <GlassCard className="p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-white flex items-center gap-2">
                  <Droplets className="w-4 h-4 text-indigo-400" /> pH Level
                </span>
                <span className="text-xs text-white/40">Last 12 hrs</span>
              </div>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={storedSeries.map(d => ({ time: d.time, value: typeof d.ph === 'number' ? Number(d.ph.toFixed(2)) : undefined }))} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                    <XAxis dataKey="time" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} axisLine={false} />
                    <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} axisLine={false} />
                    <Tooltip contentStyle={{ background: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#fff', fontSize: 12 }} />
                    <Line type="monotone" dataKey="value" name="pH" stroke="#818cf8" strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </GlassCard>

            {/* Chlorine Trend */}
            <GlassCard className="p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-white flex items-center gap-2">
                  <Beaker className="w-4 h-4 text-teal-400" /> Chlorine
                </span>
                <span className="text-xs text-white/40">Last 12 hrs</span>
              </div>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={storedSeries.map(d => ({ time: d.time, value: typeof d.chlorine === 'number' ? Number(d.chlorine.toFixed(2)) : undefined }))} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                    <XAxis dataKey="time" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} axisLine={false} />
                    <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} axisLine={false} />
                    <Tooltip contentStyle={{ background: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#fff', fontSize: 12 }} />
                    <Line type="monotone" dataKey="value" name="Chlorine (ppm)" stroke="#14b8a6" strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </GlassCard>

            {/* Water Level Trend */}
            <GlassCard className="p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-sky-400" /> Water Level
                </span>
                <span className="text-xs text-white/40">Last 12 hrs</span>
              </div>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={storedSeries.map(d => ({ time: d.time, value: typeof d.level === 'number' ? Number(d.level.toFixed(2)) : undefined }))} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                    <XAxis dataKey="time" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} axisLine={false} />
                    <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} axisLine={false} />
                    <Tooltip contentStyle={{ background: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#fff', fontSize: 12 }} />
                    <Line type="monotone" dataKey="value" name="Level (cm)" stroke="#6366f1" strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </GlassCard>
          </div>
        </div>

        {/* ════════════════════════ FOOTER INFO ════════════════════════ */}
        <GlassCard className="p-5">
          <div className="flex items-start gap-3">
            <Activity className="w-5 h-5 text-sky-400 mt-0.5 flex-shrink-0" />
            <div>
              <h2 className="text-base font-semibold text-white mb-1">Real-time Data</h2>
              <p className="text-xs text-white/40 leading-relaxed">
                pH, Temperature, and Water Level update from Firebase Realtime Database. Chlorine remains app-managed.
                Averaged KPIs are saved every 10 minutes.
              </p>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

export default Dashboard;

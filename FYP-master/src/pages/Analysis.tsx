import { useEffect, useMemo, useState, useRef, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { CalendarDays, FlaskConical, TrendingUp, TrendingDown, Minus, Droplets, Thermometer, Beaker, Waves, Brain, Download, Zap } from "lucide-react";
import { predictKNN } from "@/lib/ml";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

type HistoryEntry = {
  timestamp: number;
  date: string;
  pH?: number;
  chlorine?: number;
  waterTemperature?: number;
  waterLevel?: number;
};

function avg(nums: number[]): number {
  if (!nums.length) return NaN;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

function compliance(nums: number[], min: number, max: number): number {
  if (!nums.length) return 0;
  const ok = nums.filter((n) => n >= min && n <= max).length;
  return Math.round((ok / nums.length) * 100);
}

/* ─── Count-Up Animation Hook ─── */
function useCountUp(target: number, duration = 1200): number {
  const [value, setValue] = useState(0);
  const ref = useRef<number>(0);
  useEffect(() => {
    if (!Number.isFinite(target)) { setValue(0); return; }
    const start = ref.current;
    const diff = target - start;
    const startTime = performance.now();
    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = start + diff * eased;
      setValue(current);
      if (progress < 1) requestAnimationFrame(tick);
      else ref.current = target;
    };
    requestAnimationFrame(tick);
  }, [target, duration]);
  return value;
}

/* ─── Radial Gauge Component ─── */
function RadialGauge({ value, label, color, icon }: { value: number; label: string; color: string; icon: React.ReactNode }) {
  const animatedValue = useCountUp(value);
  const r = 54;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (animatedValue / 100) * circumference;
  const glowColor = color === "#38bdf8" ? "rgba(56,189,248,0.4)" : color === "#fb923c" ? "rgba(251,146,60,0.4)" : "rgba(52,211,153,0.4)";
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-[140px] h-[140px]">
        <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
          <circle cx="60" cy="60" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" />
          <circle
            cx="60" cy="60" r={r} fill="none"
            stroke={color} strokeWidth="8" strokeLinecap="round"
            strokeDasharray={circumference} strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.22,1,0.36,1)", filter: `drop-shadow(0 0 6px ${glowColor})` }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-white">{Math.round(animatedValue)}%</span>
          <div className="mt-0.5">{icon}</div>
        </div>
      </div>
      <span className="text-xs text-white/60 font-medium text-center">{label}</span>
    </div>
  );
}

/* ─── KPI Stat Card ─── */
function KpiCard({ title, value, unit, trend, trendLabel, icon, color }: {
  title: string; value: number; unit: string; trend: number; trendLabel: string; icon: React.ReactNode; color: string;
}) {
  const animatedValue = useCountUp(value);
  const isUp = trend > 0;
  const isDown = trend < 0;
  const trendColor = isUp ? "text-emerald-400" : isDown ? "text-red-400" : "text-white/40";
  const TrendIcon = isUp ? TrendingUp : isDown ? TrendingDown : Minus;
  const glowColor = color === "#38bdf8" ? "0 0 30px rgba(56,189,248,0.15)" : color === "#fb923c" ? "0 0 30px rgba(251,146,60,0.15)" : color === "#34d399" ? "0 0 30px rgba(52,211,153,0.15)" : "0 0 30px rgba(167,139,250,0.15)";
  return (
    <div
      className="relative rounded-2xl border border-white/15 backdrop-blur-xl p-5 overflow-hidden group hover:border-white/25 transition-all duration-300"
      style={{ background: "rgba(255,255,255,0.06)", boxShadow: glowColor }}
    >
      <div className="absolute top-0 right-0 w-20 h-20 rounded-full opacity-10" style={{ background: color, filter: "blur(20px)", transform: "translate(30%, -30%)" }} />
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${color}20` }}>
          {icon}
        </div>
        <div className={`flex items-center gap-1 text-xs font-medium ${trendColor}`}>
          <TrendIcon className="w-3.5 h-3.5" />
          <span>{Math.abs(trend).toFixed(1)}%</span>
        </div>
      </div>
      <div className="text-3xl font-bold text-white tracking-tight">
        {Number.isFinite(value) ? animatedValue.toFixed(2) : "—"}
        <span className="text-sm font-normal text-white/40 ml-1">{unit}</span>
      </div>
      <div className="text-xs text-white/50 mt-1">{title}</div>
      <div className="text-[10px] text-white/30 mt-0.5">{trendLabel}</div>
    </div>
  );
}

/* ─── Mini Sparkline SVG ─── */
function Sparkline({ data, color }: { data: number[]; color: string }) {
  if (data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const w = 80;
  const h = 24;
  const points = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * h}`).join(" ");
  return (
    <svg width={w} height={h} className="inline-block ml-2 align-middle">
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ─── Heatmap Calendar ─── */
function HeatmapCalendar({ data }: { data: Array<{ date: string; score: number }> }) {
  const scoreMap = useMemo(() => {
    const m: Record<string, number> = {};
    data.forEach(d => { m[d.date] = d.score; });
    return m;
  }, [data]);

  const weeks = useMemo(() => {
    const today = new Date();
    const days: Array<{ date: string; score: number }> = [];
    for (let i = 59; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const ds = d.toISOString().slice(0, 10);
      days.push({ date: ds, score: scoreMap[ds] ?? -1 });
    }
    // Group by weeks
    const w: Array<Array<{ date: string; score: number }>> = [];
    let current: typeof days = [];
    days.forEach((d, i) => {
      current.push(d);
      if (current.length === 7 || i === days.length - 1) {
        w.push(current);
        current = [];
      }
    });
    return w;
  }, [scoreMap]);

  const getColor = (score: number) => {
    if (score < 0) return "rgba(255,255,255,0.04)";
    if (score >= 85) return "#22c55e";
    if (score >= 60) return "#eab308";
    if (score >= 40) return "#f97316";
    return "#ef4444";
  };

  return (
    <div className="flex gap-1 flex-wrap">
      {weeks.map((week, wi) => (
        <div key={wi} className="flex flex-col gap-1">
          {week.map((day) => (
            <div
              key={day.date}
              className="w-3.5 h-3.5 rounded-sm transition-colors"
              style={{ background: getColor(day.score), opacity: day.score < 0 ? 0.3 : 0.85 }}
              title={`${day.date}: ${day.score < 0 ? "No data" : `${day.score}% quality`}`}
            />
          ))}
        </div>
      ))}
    </div>
  );
}


const Analysis = () => {
  const [history, setHistory] = useState<Record<string, HistoryEntry[]>>({});
  const [openReport, setOpenReport] = useState(false);
  const [fromDate, setFromDate] = useState<string | null>(null);
  const [toDate, setToDate] = useState<string | null>(null);
  const [preset, setPreset] = useState<"7" | "30" | "60" | "all">("30");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/kpi?limit=10000&excludeGranularity=raw');
        const json = await res.json();
        const items: Array<any> = Array.isArray(json?.items) ? json.items : [];
        const byDate: Record<string, HistoryEntry[]> = {};
        for (const it of items) {
          const ts = typeof it?.timestamp === 'number' ? it.timestamp : Date.now();
          const dstr = typeof it?.date === 'string' ? it.date : new Date(ts).toISOString().slice(0, 10);
          const entry: HistoryEntry = {
            timestamp: ts,
            date: dstr,
            pH: typeof it?.pH === 'number' ? it.pH : undefined,
            chlorine: typeof it?.chlorine === 'number' ? it.chlorine : undefined,
            waterTemperature: typeof it?.waterTemperature === 'number' ? it.waterTemperature : undefined,
            waterLevel: typeof it?.waterLevel === 'number' ? it.waterLevel : undefined,
          };
          if (!byDate[dstr]) byDate[dstr] = [];
          byDate[dstr].push(entry);
        }
        setHistory(byDate);
      } catch { }
    };
    load();
    const intId = setInterval(load, 20000);
    return () => clearInterval(intId);
  }, []);

  /* ─── Computed Data ─── */
  const last30 = useMemo(() => {
    const dates = Object.keys(history).sort();
    const take = dates.slice(-30);
    return take.map((d) => {
      const entries = history[d] || [];
      const pH = entries.map((e) => e.pH).filter((n): n is number => typeof n === "number");
      const chlorine = entries.map((e) => e.chlorine).filter((n): n is number => typeof n === "number");
      const temp = entries.map((e) => e.waterTemperature).filter((n): n is number => typeof n === "number");
      const level = entries.map((e) => e.waterLevel).filter((n): n is number => typeof n === "number");
      const times = entries.map((e) => e.timestamp).filter((n): n is number => typeof n === "number").sort((a, b) => a - b);
      const startTs = times[0];
      const endTs = times[times.length - 1];
      const toTime = (ts?: number) => ts ? new Date(ts).toLocaleTimeString() : "—";
      return { date: d, pH, chlorine, temp, level, samples: entries.length, startTime: toTime(startTs), endTime: toTime(endTs) };
    });
  }, [history]);

  const avgPH = useMemo(() => avg(last30.flatMap((d) => d.pH)), [last30]);
  const avgChlorine = useMemo(() => avg(last30.flatMap((d) => d.chlorine)), [last30]);
  const avgTemp = useMemo(() => avg(last30.flatMap((d) => d.temp)), [last30]);
  const avgLevel = useMemo(() => avg(last30.flatMap((d) => d.level)), [last30]);
  const phCompliance = useMemo(() => compliance(last30.flatMap((d) => d.pH), 7.2, 7.6), [last30]);
  const chlorineCompliance = useMemo(() => compliance(last30.flatMap((d) => d.chlorine), 1.0, 3.0), [last30]);
  const tempCompliance = useMemo(() => compliance(last30.flatMap((d) => d.temp), 26, 30), [last30]);

  // Week-over-week trends
  const trends = useMemo(() => {
    const last7 = last30.slice(-7);
    const prev7 = last30.slice(-14, -7);
    const trendFor = (getter: (d: typeof last30[0]) => number[]) => {
      const cur = avg(last7.flatMap(getter));
      const prev = avg(prev7.flatMap(getter));
      if (!Number.isFinite(cur) || !Number.isFinite(prev) || prev === 0) return 0;
      return ((cur - prev) / prev) * 100;
    };
    return {
      ph: trendFor(d => d.pH),
      chlorine: trendFor(d => d.chlorine),
      temp: trendFor(d => d.temp),
      level: trendFor(d => d.level),
    };
  }, [last30]);

  const allDaily = useMemo(() => {
    const dates = Object.keys(history).sort();
    return dates.map((d) => {
      const entries = history[d] || [];
      const pH = entries.map((e) => e.pH).filter((n): n is number => typeof n === "number");
      const chlorine = entries.map((e) => e.chlorine).filter((n): n is number => typeof n === "number");
      const temp = entries.map((e) => e.waterTemperature).filter((n): n is number => typeof n === "number");
      const level = entries.map((e) => e.waterLevel).filter((n): n is number => typeof n === "number");
      return { date: d, ph: avg(pH), chlorine: avg(chlorine), temp: avg(temp), level: avg(level) };
    });
  }, [history]);

  const filteredDaily = useMemo(() => {
    let base = allDaily;
    if (preset !== "all" && !fromDate && !toDate) {
      const n = Number(preset);
      base = allDaily.slice(-n);
    }
    const from = fromDate ? new Date(fromDate) : null;
    const to = toDate ? new Date(toDate) : null;
    if (from || to) {
      base = base.filter((d) => {
        const dd = new Date(d.date);
        const okFrom = from ? dd >= new Date(from.getFullYear(), from.getMonth(), from.getDate()) : true;
        const okTo = to ? dd <= new Date(to.getFullYear(), to.getMonth(), to.getDate()) : true;
        return okFrom && okTo;
      });
    }
    return base;
  }, [allDaily, fromDate, toDate, preset]);

  /* ─── Heatmap Data ─── */
  const heatmapData = useMemo(() => {
    return allDaily.map(d => {
      let score = 0;
      let count = 0;
      if (Number.isFinite(d.ph)) { score += (d.ph >= 7.2 && d.ph <= 7.6) ? 100 : (d.ph >= 7.0 && d.ph <= 7.8) ? 60 : 20; count++; }
      if (Number.isFinite(d.chlorine)) { score += (d.chlorine >= 1.0 && d.chlorine <= 3.0) ? 100 : 30; count++; }
      if (Number.isFinite(d.temp)) { score += (d.temp >= 26 && d.temp <= 30) ? 100 : 40; count++; }
      return { date: d.date, score: count > 0 ? Math.round(score / count) : -1 };
    });
  }, [allDaily]);

  /* ─── AI Insights ─── */
  const insights = useMemo(() => {
    const result: Array<{ text: string; type: "success" | "warning" | "danger"; sparkData: number[] }> = [];
    const phData = last30.map(d => avg(d.pH)).filter(Number.isFinite);
    const clData = last30.map(d => avg(d.chlorine)).filter(Number.isFinite);
    const tempData = last30.map(d => avg(d.temp)).filter(Number.isFinite);

    if (phData.length >= 7) {
      const recent = phData.slice(-7);
      const first3 = avg(recent.slice(0, 3));
      const last3 = avg(recent.slice(-3));
      if (last3 < first3 - 0.05)
        result.push({ text: "pH trending downward over last 7 days — consider alkalinity adjustment", type: "warning", sparkData: recent });
      else if (last3 > first3 + 0.05)
        result.push({ text: "pH trending upward — monitor for scaling potential", type: "warning", sparkData: recent });
      else
        result.push({ text: "pH levels remain stable and within optimal range", type: "success", sparkData: recent });
    }

    if (clData.length >= 7) {
      const recent = clData.slice(-7);
      const latestCl = recent[recent.length - 1];
      if (latestCl < 1.0)
        result.push({ text: "Chlorine levels below safe threshold — immediate dosing recommended", type: "danger", sparkData: recent });
      else if (latestCl > 2.5)
        result.push({ text: "Chlorine levels elevated — reduce dosage to prevent irritation", type: "warning", sparkData: recent });
      else
        result.push({ text: "Chlorine concentration optimal — maintaining safe disinfection levels", type: "success", sparkData: recent });
    }

    if (tempData.length >= 7) {
      const recent = tempData.slice(-7);
      const avgRecent = avg(recent);
      if (avgRecent > 30)
        result.push({ text: `Water temperature averaging ${avgRecent.toFixed(1)}°C — potential Naegleria risk zone`, type: "danger", sparkData: recent });
      else if (avgRecent < 26)
        result.push({ text: "Water temperature below optimal — heater efficiency check recommended", type: "warning", sparkData: recent });
      else
        result.push({ text: "Temperature consistent within safe range (26-30°C)", type: "success", sparkData: recent });
    }

    if (phCompliance >= 90 && chlorineCompliance >= 90 && tempCompliance >= 80)
      result.push({ text: "Overall water quality is excellent — all metrics within healthy ranges", type: "success", sparkData: phData.slice(-7) });

    return result;
  }, [last30, phCompliance, chlorineCompliance, tempCompliance]);

  /* ─── CSV Download ─── */
  const downloadCsv = () => {
    const header = ["Date", "Avg pH", "Avg Chlorine (mg/L)", "Avg Temp (°C)", "Predicted Cleanliness"];
    const rows = last30.map((d) => {
      const avgP = avg(d.pH);
      const avgC = avg(d.chlorine);
      const avgT = avg(d.temp);
      const prediction = predictKNN(avgP, avgC, avgT);
      return [d.date, avgP.toFixed(2), avgC.toFixed(2), avgT.toFixed(2), prediction];
    });
    const csv = [header, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `chemical-usage-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const tooltipStyle = {
    contentStyle: { background: "rgba(15,41,66,0.95)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "12px", color: "#fff", fontSize: "12px" },
    labelStyle: { color: "rgba(255,255,255,0.6)" },
  };

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8">
      <div className="max-w-[1400px] mx-auto space-y-6">

        {/* ─── Header ─── */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight text-white">Historical Reports & Analysis</h1>
          <div className="flex gap-2">
            <button onClick={() => setOpenReport(true)} className="inline-flex items-center gap-2 rounded-xl bg-sky-500 px-4 py-2 text-white text-sm font-medium hover:bg-sky-600 transition-colors shadow-lg shadow-sky-900/30">
              <CalendarDays className="w-4 h-4" /> View Report
            </button>
            <button onClick={downloadCsv} className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-white text-sm font-medium hover:bg-white/10 transition-colors border border-white/20" style={{ background: "rgba(255,255,255,0.06)" }}>
              <Download className="w-4 h-4" /> Export CSV
            </button>
          </div>
        </div>

        {/* ─── ⚡ Animated KPI Stat Cards ─── */}
        <div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard title="Average pH Level" value={avgPH} unit="" trend={trends.ph} trendLabel="vs last week" icon={<Droplets className="w-5 h-5" style={{ color: "#38bdf8" }} />} color="#38bdf8" />
            <KpiCard title="Average Chlorine" value={avgChlorine} unit="mg/L" trend={trends.chlorine} trendLabel="vs last week" icon={<Beaker className="w-5 h-5" style={{ color: "#fb923c" }} />} color="#fb923c" />
            <KpiCard title="Average Temperature" value={avgTemp} unit="°C" trend={trends.temp} trendLabel="vs last week" icon={<Thermometer className="w-5 h-5" style={{ color: "#34d399" }} />} color="#34d399" />
            <KpiCard title="Average Water Level" value={avgLevel} unit="cm" trend={trends.level} trendLabel="vs last week" icon={<Waves className="w-5 h-5" style={{ color: "#a78bfa" }} />} color="#a78bfa" />
          </div>
        </div>

        {/* ─── 📊 Radial Gauges + 🧠 AI Insights ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Gauges */}
          <div className="rounded-2xl border border-white/15 backdrop-blur-xl p-6 overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
            <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <Zap className="w-5 h-5 text-sky-400" />
              Compliance Metrics (30-Day)
            </h3>
            <div className="flex items-center justify-around">
              <RadialGauge value={phCompliance} label="pH Compliance" color="#38bdf8" icon={<Droplets className="w-4 h-4 text-sky-400" />} />
              <RadialGauge value={chlorineCompliance} label="Chlorine Safe Zone" color="#fb923c" icon={<Beaker className="w-4 h-4 text-orange-400" />} />
              <RadialGauge value={tempCompliance} label="Temp Consistency" color="#34d399" icon={<Thermometer className="w-4 h-4 text-emerald-400" />} />
            </div>
          </div>

          {/* AI Insights */}
          <div className="rounded-2xl border border-white/15 backdrop-blur-xl p-6 overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Brain className="w-5 h-5 text-violet-400" />
              AI-Driven Insights
            </h3>
            <div className="space-y-3">
              {insights.map((insight, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 rounded-xl p-3 border transition-colors"
                  style={{
                    background: insight.type === "success" ? "rgba(34,197,94,0.08)" : insight.type === "warning" ? "rgba(234,179,8,0.08)" : "rgba(239,68,68,0.08)",
                    borderColor: insight.type === "success" ? "rgba(34,197,94,0.2)" : insight.type === "warning" ? "rgba(234,179,8,0.2)" : "rgba(239,68,68,0.2)",
                  }}
                >
                  <div className="mt-0.5 shrink-0">
                    {insight.type === "success" ? (
                      <div className="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_6px_rgba(34,197,94,0.6)]" />
                    ) : insight.type === "warning" ? (
                      <div className="w-2 h-2 rounded-full bg-yellow-400 shadow-[0_0_6px_rgba(234,179,8,0.6)]" />
                    ) : (
                      <div className="w-2 h-2 rounded-full bg-red-400 shadow-[0_0_6px_rgba(239,68,68,0.6)] animate-pulse" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white/80 leading-relaxed">
                      {insight.text}
                      <Sparkline
                        data={insight.sparkData}
                        color={insight.type === "success" ? "#22c55e" : insight.type === "warning" ? "#eab308" : "#ef4444"}
                      />
                    </p>
                  </div>
                </div>
              ))}
              {insights.length === 0 && (
                <p className="text-sm text-white/40 text-center py-4">Collecting data for AI analysis...</p>
              )}
            </div>
          </div>
        </div>

        {/* ─── 📈 Gradient Area Chart ─── */}
        <div className="my-2">
          <div
            className="rounded-2xl border border-white/15 backdrop-blur-xl overflow-hidden"
            style={{
              background: "rgba(255,255,255,0.06)",
            }}
          >
            <div className="p-6 pb-3 flex flex-wrap items-end justify-between gap-4">
              <h3 className="text-lg font-semibold text-white">Daily KPI Trends</h3>
              <div className="flex flex-wrap items-end gap-2">
                <div className="grid gap-1">
                  <span className="text-xs text-white/50">From</span>
                  <Input type="date" value={fromDate ?? ""} onChange={(e) => setFromDate(e.target.value || null)} className="w-36 h-8 text-xs bg-white/10 border-white/15 text-white" />
                </div>
                <div className="grid gap-1">
                  <span className="text-xs text-white/50">To</span>
                  <Input type="date" value={toDate ?? ""} onChange={(e) => setToDate(e.target.value || null)} className="w-36 h-8 text-xs bg-white/10 border-white/15 text-white" />
                </div>
                <div className="grid gap-1">
                  <span className="text-xs text-white/50">Preset</span>
                  <div className="flex gap-1">
                    {(["7", "30", "60", "all"] as const).map(p => (
                      <button
                        key={p}
                        onClick={() => { setPreset(p); setFromDate(null); setToDate(null); }}
                        className={`h-8 px-3 rounded-lg text-xs font-medium transition-all ${preset === p ? "bg-sky-600 text-white shadow-lg shadow-sky-900/30" : "text-white border border-white/20 hover:bg-white/10"}`}
                        style={preset !== p ? { background: "rgba(255,255,255,0.05)" } : {}}
                      >
                        {p === "all" ? "All" : `Last ${p}d`}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="px-6 pb-6 h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={filteredDaily} margin={{ top: 10, right: 10, bottom: 0, left: -10 }}>
                  <defs>
                    <linearGradient id="gradPH" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.5} />
                      <stop offset="100%" stopColor="#38bdf8" stopOpacity={0.02} />
                    </linearGradient>
                    <linearGradient id="gradCl" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f87171" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#f87171" stopOpacity={0.02} />
                    </linearGradient>
                    <linearGradient id="gradTemp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#34d399" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#34d399" stopOpacity={0.02} />
                    </linearGradient>
                    <linearGradient id="gradLevel" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#a78bfa" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#a78bfa" stopOpacity={0.02} />
                    </linearGradient>
                    <filter id="glow3d">
                      <feGaussianBlur stdDeviation="3" result="blur" />
                      <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>
                  <CartesianGrid stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10 }} stroke="rgba(255,255,255,0.1)" />
                  <YAxis tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10 }} stroke="rgba(255,255,255,0.1)" />
                  <Tooltip {...tooltipStyle} />
                  <Legend wrapperStyle={{ color: "rgba(255,255,255,0.6)", fontSize: "12px" }} />
                  <Area type="monotone" dataKey="ph" name="pH" stroke="#38bdf8" strokeWidth={2.5} fill="url(#gradPH)" dot={false} style={{ filter: "drop-shadow(0 0 6px rgba(56,189,248,0.5))" }} />
                  <Area type="monotone" dataKey="chlorine" name="Chlorine" stroke="#f87171" strokeWidth={2.5} fill="url(#gradCl)" dot={false} style={{ filter: "drop-shadow(0 0 6px rgba(248,113,113,0.5))" }} />
                  <Area type="monotone" dataKey="temp" name="Temp (°C)" stroke="#34d399" strokeWidth={2.5} fill="url(#gradTemp)" dot={false} style={{ filter: "drop-shadow(0 0 6px rgba(52,211,153,0.5))" }} />
                  <Area type="monotone" dataKey="level" name="Level (cm)" stroke="#a78bfa" strokeWidth={2.5} fill="url(#gradLevel)" dot={false} style={{ filter: "drop-shadow(0 0 6px rgba(167,139,250,0.5))" }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
          {/* ── 3D Floor Reflection ── */}
          <div
            className="mx-auto rounded-full"
            style={{
              width: "80%",
              height: "20px",
              background: "radial-gradient(ellipse at center, rgba(56,189,248,0.12) 0%, transparent 70%)",
              filter: "blur(8px)",
              marginTop: "-6px",
            }}
          />
        </div>

        {/* ─── 📅 Heatmap + Summary ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Heatmap */}
          <div className="rounded-2xl border border-white/15 backdrop-blur-xl p-6 overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
            <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-sky-400" />
              Water Quality Heatmap (60 Days)
            </h3>
            <p className="text-xs text-white/40 mb-4">Daily composite quality score based on pH, chlorine, and temperature</p>
            <HeatmapCalendar data={heatmapData} />
            <div className="flex items-center gap-3 mt-4">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm" style={{ background: "rgba(255,255,255,0.05)" }} />
                <span className="text-[10px] text-white/40">No data</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm bg-red-500" />
                <span className="text-[10px] text-white/40">&lt;40%</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm bg-orange-500" />
                <span className="text-[10px] text-white/40">40-60%</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm bg-yellow-500" />
                <span className="text-[10px] text-white/40">60-85%</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm bg-green-500" />
                <span className="text-[10px] text-white/40">&gt;85%</span>
              </div>
            </div>
          </div>

          {/* Chemical Usage Summary */}
          <div className="rounded-2xl border border-white/15 backdrop-blur-xl p-6 overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <FlaskConical className="w-5 h-5 text-amber-400" />
              30-Day Health Summary
            </h3>
            <div className="space-y-4">
              <div className="rounded-xl p-4 border border-white/10" style={{ background: "rgba(255,255,255,0.04)" }}>
                <div className="text-xs text-white/40 uppercase tracking-wider mb-2">pH Analysis</div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-white">{Number.isFinite(avgPH) ? avgPH.toFixed(2) : "—"}</span>
                  <span className="text-xs text-white/40">avg</span>
                  <span className={`ml-auto text-xs px-2 py-0.5 rounded-full ${phCompliance >= 80 ? "bg-green-500/20 text-green-400" : "bg-amber-500/20 text-amber-400"}`}>
                    {phCompliance}% in range
                  </span>
                </div>
              </div>
              <div className="rounded-xl p-4 border border-white/10" style={{ background: "rgba(255,255,255,0.04)" }}>
                <div className="text-xs text-white/40 uppercase tracking-wider mb-2">Chlorine Analysis</div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-white">{Number.isFinite(avgChlorine) ? avgChlorine.toFixed(2) : "—"}</span>
                  <span className="text-xs text-white/40">mg/L avg</span>
                  <span className={`ml-auto text-xs px-2 py-0.5 rounded-full ${chlorineCompliance >= 80 ? "bg-green-500/20 text-green-400" : "bg-amber-500/20 text-amber-400"}`}>
                    {chlorineCompliance}% safe
                  </span>
                </div>
              </div>
              <div className="rounded-xl p-4 border border-white/10" style={{ background: "rgba(255,255,255,0.04)" }}>
                <div className="text-xs text-white/40 uppercase tracking-wider mb-2">Temperature Analysis</div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-white">{Number.isFinite(avgTemp) ? avgTemp.toFixed(1) : "—"}</span>
                  <span className="text-xs text-white/40">°C avg</span>
                  <span className={`ml-auto text-xs px-2 py-0.5 rounded-full ${tempCompliance >= 80 ? "bg-green-500/20 text-green-400" : "bg-amber-500/20 text-amber-400"}`}>
                    {tempCompliance}% optimal
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Detailed Report Dialog ─── */}
        <Dialog open={openReport} onOpenChange={setOpenReport}>
          <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col p-0 gap-0 overflow-hidden border-white/15" style={{ background: "linear-gradient(135deg, #0f2942, #1a5276)" }}>
            <DialogHeader className="p-6 pb-2">
              <DialogTitle className="text-white">30-Day Daily Averages</DialogTitle>
              <DialogDescription className="text-white/50">Daily averaged pH, chlorine, temperature, and water level with time range</DialogDescription>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto p-6 pt-0">
              <div className="border border-white/15 rounded-xl overflow-hidden">
                <table className="min-w-full text-sm">
                  <thead className="backdrop-blur-sm sticky top-0 z-10" style={{ background: "rgba(255,255,255,0.08)" }}>
                    <tr className="border-b border-white/10">
                      <th className="text-left font-medium px-4 py-3 text-white/60">Date</th>
                      <th className="text-left font-medium px-4 py-3 text-white/60">Start</th>
                      <th className="text-left font-medium px-4 py-3 text-white/60">End</th>
                      <th className="text-left font-medium px-4 py-3 text-white/60">Avg pH</th>
                      <th className="text-left font-medium px-4 py-3 text-white/60">Avg Chlorine</th>
                      <th className="text-left font-medium px-4 py-3 text-white/60">Avg Temp</th>
                      <th className="text-left font-medium px-4 py-3 text-white/60">Avg Level</th>
                      <th className="text-left font-medium px-4 py-3 text-white/60">Samples</th>
                    </tr>
                  </thead>
                  <tbody>
                    {last30.map((d, i) => (
                      <tr key={d.date} className={`border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors ${i % 2 === 0 ? '' : 'bg-white/[0.03]'}`}>
                        <td className="px-4 py-3 text-white font-medium">{d.date}</td>
                        <td className="px-4 py-3 text-white/50 text-xs">{d.startTime}</td>
                        <td className="px-4 py-3 text-white/50 text-xs">{d.endTime}</td>
                        <td className="px-4 py-3 text-white">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${avg(d.pH) >= 7.2 && avg(d.pH) <= 7.8 ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400'}`}>
                            {Number.isFinite(avg(d.pH)) ? avg(d.pH).toFixed(2) : "—"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-white/80">{Number.isFinite(avg(d.chlorine)) ? avg(d.chlorine).toFixed(2) : "—"} mg/L</td>
                        <td className="px-4 py-3 text-white/80">{Number.isFinite(avg(d.temp)) ? avg(d.temp).toFixed(2) : "—"} °C</td>
                        <td className="px-4 py-3 text-white/80">{Number.isFinite(avg(d.level)) ? avg(d.level).toFixed(2) : "—"} %</td>
                        <td className="px-4 py-3 text-white/50 text-xs">{d.samples}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </DialogContent>
        </Dialog>

      </div>
    </div>
  );
};

export default Analysis;

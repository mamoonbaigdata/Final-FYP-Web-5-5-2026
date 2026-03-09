import { useMemo } from "react";
import { Thermometer, Droplets, Beaker, Waves, ShieldCheck, ShieldAlert, ShieldX } from "lucide-react";

type HUDProps = {
    temperature: number | null;
    pH: number | null;
    chlorine: number | null;
    waterLevel: number | null;
    overallStatus: "Clean" | "Needs Attention" | "Dirty" | "Unknown";
};

const HolographicHUD = ({ temperature, pH, chlorine, waterLevel, overallStatus }: HUDProps) => {
    const theme = useMemo(() => {
        switch (overallStatus) {
            case "Clean":
                return { color: "#4ade80", glow: "rgba(74,222,128,0.4)", label: "ALL SYSTEMS NOMINAL", icon: <ShieldCheck size={28} /> };
            case "Needs Attention":
                return { color: "#fbbf24", glow: "rgba(251,191,36,0.4)", label: "ATTENTION REQUIRED", icon: <ShieldAlert size={28} /> };
            case "Dirty":
                return { color: "#f87171", glow: "rgba(248,113,113,0.4)", label: "CRITICAL ALERT", icon: <ShieldX size={28} /> };
            default:
                return { color: "#94a3b8", glow: "rgba(148,163,184,0.4)", label: "INITIALIZING...", icon: <ShieldCheck size={28} /> };
        }
    }, [overallStatus]);

    const statusFor = (n: number | null, min: number, max: number) => {
        if (n === null) return { color: "#64748b", status: "N/A" };
        if (n < min || n > max) return { color: "#f87171", status: "CRIT" };
        const border = 0.1 * (max - min);
        if (n < min + border || n > max - border) return { color: "#fbbf24", status: "WARN" };
        return { color: "#4ade80", status: "OK" };
    };

    const metrics = [
        { label: "TEMP", value: temperature, fmt: temperature !== null ? `${temperature.toFixed(1)}°` : "—", ...statusFor(temperature, 26, 30), icon: <Thermometer size={16} />, angle: -60 },
        { label: "PH", value: pH, fmt: pH !== null ? pH.toFixed(2) : "—", ...statusFor(pH, 7.2, 7.6), icon: <Droplets size={16} />, angle: 0 },
        { label: "CL₂", value: chlorine, fmt: chlorine !== null ? `${chlorine.toFixed(1)}` : "—", ...statusFor(chlorine, 1, 3), icon: <Beaker size={16} />, angle: 60 },
        { label: "LEVEL", value: waterLevel, fmt: waterLevel !== null ? `${waterLevel.toFixed(0)}%` : "—", ...statusFor(waterLevel, 80, 95), icon: <Waves size={16} />, angle: 120 },
    ];

    return (
        <div className="hud-container" style={{ "--hud-color": theme.color, "--hud-glow": theme.glow } as React.CSSProperties}>
            {/* Background grid */}
            <div className="hud-grid-bg" />

            {/* Scanning line */}
            <div className="hud-scan-line" />

            {/* Outer ring */}
            <div className="hud-ring hud-ring-outer">
                <svg viewBox="0 0 400 400" className="hud-ring-svg">
                    <circle cx="200" cy="200" r="175" fill="none" stroke={theme.color} strokeWidth="1" opacity="0.2" />
                    <circle cx="200" cy="200" r="175" fill="none" stroke={theme.color} strokeWidth="2"
                        strokeDasharray="20 10 5 10" opacity="0.5" className="hud-ring-dashed" />
                </svg>
            </div>

            {/* Middle ring */}
            <div className="hud-ring hud-ring-middle">
                <svg viewBox="0 0 320 320" className="hud-ring-svg">
                    <circle cx="160" cy="160" r="140" fill="none" stroke={theme.color} strokeWidth="1" opacity="0.15" />
                    <circle cx="160" cy="160" r="140" fill="none" stroke={theme.color} strokeWidth="1.5"
                        strokeDasharray="8 16" opacity="0.4" className="hud-ring-dashed-reverse" />
                </svg>
            </div>

            {/* Inner ring */}
            <div className="hud-ring hud-ring-inner">
                <svg viewBox="0 0 240 240" className="hud-ring-svg">
                    <circle cx="120" cy="120" r="100" fill="none" stroke={theme.color} strokeWidth="1" opacity="0.1" />
                    <circle cx="120" cy="120" r="100" fill="none" stroke={theme.color} strokeWidth="2"
                        strokeDasharray="3 12" opacity="0.3" className="hud-ring-dashed" />
                </svg>
            </div>

            {/* Radar sweep */}
            <div className="hud-radar-sweep" style={{
                background: `conic-gradient(from 0deg, transparent 0deg, ${theme.glow} 30deg, transparent 60deg)`,
            }} />

            {/* Center core */}
            <div className="hud-core">
                <div className="hud-core-glow" style={{ background: `radial-gradient(circle, ${theme.glow}, transparent 70%)` }} />
                <div className="hud-core-icon" style={{ color: theme.color }}>
                    {theme.icon}
                </div>
                <div className="hud-core-status" style={{ color: theme.color }}>
                    {theme.label}
                </div>
            </div>

            {/* Floating metric panels */}
            {metrics.map((m, i) => {
                const rad = (m.angle * Math.PI) / 180;
                const dist = 160;
                const x = Math.cos(rad) * dist;
                const y = Math.sin(rad) * dist;

                return (
                    <div
                        key={i}
                        className="hud-metric-panel"
                        style={{
                            transform: `translate(${x}px, ${y}px)`,
                            "--metric-color": m.color,
                            animationDelay: `${i * 0.15}s`,
                        } as React.CSSProperties}
                    >
                        <div className="hud-metric-connector" style={{
                            width: `${dist * 0.35}px`,
                            left: x < 0 ? "auto" : "-40%",
                            right: x >= 0 ? "auto" : "-40%",
                            background: `linear-gradient(${x >= 0 ? "to left" : "to right"}, ${m.color}40, transparent)`,
                        }} />
                        <div className="hud-metric-dot" style={{ background: m.color, boxShadow: `0 0 8px ${m.color}` }} />
                        <div className="hud-metric-icon" style={{ color: m.color }}>{m.icon}</div>
                        <span className="hud-metric-label">{m.label}</span>
                        <span className="hud-metric-value">{m.fmt}</span>
                        <span className="hud-metric-status" style={{ color: m.color }}>[{m.status}]</span>
                    </div>
                );
            })}

            {/* Corner brackets */}
            <div className="hud-bracket hud-bracket-tl" style={{ borderColor: `${theme.color}30` }} />
            <div className="hud-bracket hud-bracket-tr" style={{ borderColor: `${theme.color}30` }} />
            <div className="hud-bracket hud-bracket-bl" style={{ borderColor: `${theme.color}30` }} />
            <div className="hud-bracket hud-bracket-br" style={{ borderColor: `${theme.color}30` }} />

            {/* Top-left info */}
            <div className="hud-info hud-info-tl">
                <span style={{ color: `${theme.color}90`, fontSize: "0.6rem", letterSpacing: "0.15em" }}>SYS.STATUS</span>
                <span style={{ color: theme.color, fontSize: "0.75rem", fontWeight: 700 }}>{overallStatus.toUpperCase()}</span>
            </div>

            {/* Bottom-right timestamp */}
            <div className="hud-info hud-info-br">
                <span style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.55rem", letterSpacing: "0.1em", fontFamily: "monospace" }}>
                    AQUAINTEL HUD v2.0
                </span>
            </div>
        </div>
    );
};

export default HolographicHUD;

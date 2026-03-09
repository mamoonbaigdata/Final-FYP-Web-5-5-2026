import { useMemo } from "react";

type WaterQualityOrbProps = {
    pH: number;
    chlorine: number;
    waterTemperature: number;
    waterLevel: number;
    status: "Clean" | "Needs Attention" | "Dirty" | "Unknown";
};

const WaterQualityOrb = ({ pH, chlorine, waterTemperature, waterLevel, status }: WaterQualityOrbProps) => {
    const theme = useMemo(() => {
        switch (status) {
            case "Clean":
                return {
                    primary: "#38bdf8",
                    secondary: "#0ea5e9",
                    glow: "rgba(56, 189, 248, 0.6)",
                    glowOuter: "rgba(14, 165, 233, 0.2)",
                    gradient1: "#0c4a6e",
                    gradient2: "#0369a1",
                    gradient3: "#38bdf8",
                    ripple: "rgba(56, 189, 248, 0.3)",
                    label: "Optimal",
                    animClass: "orb-clean",
                };
            case "Needs Attention":
                return {
                    primary: "#fbbf24",
                    secondary: "#f59e0b",
                    glow: "rgba(251, 191, 36, 0.6)",
                    glowOuter: "rgba(245, 158, 11, 0.2)",
                    gradient1: "#78350f",
                    gradient2: "#b45309",
                    gradient3: "#fbbf24",
                    ripple: "rgba(251, 191, 36, 0.3)",
                    label: "Caution",
                    animClass: "orb-warning",
                };
            case "Dirty":
                return {
                    primary: "#f87171",
                    secondary: "#ef4444",
                    glow: "rgba(248, 113, 113, 0.6)",
                    glowOuter: "rgba(239, 68, 68, 0.2)",
                    gradient1: "#7f1d1d",
                    gradient2: "#dc2626",
                    gradient3: "#f87171",
                    ripple: "rgba(248, 113, 113, 0.3)",
                    label: "Critical",
                    animClass: "orb-dirty",
                };
            default:
                return {
                    primary: "#94a3b8",
                    secondary: "#64748b",
                    glow: "rgba(148, 163, 184, 0.4)",
                    glowOuter: "rgba(100, 116, 139, 0.2)",
                    gradient1: "#1e293b",
                    gradient2: "#475569",
                    gradient3: "#94a3b8",
                    ripple: "rgba(148, 163, 184, 0.3)",
                    label: "Unknown",
                    animClass: "orb-unknown",
                };
        }
    }, [status]);

    return (
        <div className="orb-container">
            {/* Background ambient glow */}
            <div
                className="orb-ambient"
                style={{
                    background: `radial-gradient(circle, ${theme.glowOuter} 0%, transparent 70%)`,
                }}
            />

            {/* Ripple rings */}
            <div className="orb-ripple orb-ripple-1" style={{ borderColor: theme.ripple }} />
            <div className="orb-ripple orb-ripple-2" style={{ borderColor: theme.ripple }} />
            <div className="orb-ripple orb-ripple-3" style={{ borderColor: theme.ripple }} />

            {/* Main orb */}
            <div className={`orb-sphere ${theme.animClass}`}>
                {/* Outer glow layer */}
                <div
                    className="orb-glow-outer"
                    style={{
                        boxShadow: `0 0 60px 20px ${theme.glowOuter}, 0 0 120px 60px ${theme.glowOuter}`,
                    }}
                />

                {/* Main sphere body */}
                <div
                    className="orb-body"
                    style={{
                        background: `
              radial-gradient(circle at 35% 30%, ${theme.gradient3}44 0%, transparent 50%),
              radial-gradient(circle at 65% 70%, ${theme.gradient2}33 0%, transparent 40%),
              radial-gradient(circle at 50% 50%, ${theme.gradient2} 0%, ${theme.gradient1} 100%)
            `,
                        boxShadow: `
              inset 0 -20px 40px rgba(0,0,0,0.4),
              inset 0 20px 40px ${theme.gradient3}33,
              0 0 40px ${theme.glow},
              0 0 80px ${theme.glowOuter}
            `,
                    }}
                >
                    {/* Specular highlight */}
                    <div className="orb-highlight" />

                    {/* Inner water surface effect */}
                    <div
                        className="orb-water-surface"
                        style={{
                            background: `linear-gradient(180deg, transparent 40%, ${theme.primary}15 50%, ${theme.primary}25 60%, transparent 80%)`,
                        }}
                    />

                    {/* Bubble particles inside orb */}
                    <div className="orb-bubble orb-bubble-1" style={{ background: `${theme.primary}40` }} />
                    <div className="orb-bubble orb-bubble-2" style={{ background: `${theme.primary}30` }} />
                    <div className="orb-bubble orb-bubble-3" style={{ background: `${theme.primary}50` }} />
                    <div className="orb-bubble orb-bubble-4" style={{ background: `${theme.primary}25` }} />
                    <div className="orb-bubble orb-bubble-5" style={{ background: `${theme.primary}35` }} />

                    {/* Center status text */}
                    <div className="orb-center-label">
                        <span className="orb-status-text" style={{ color: theme.primary }}>
                            {theme.label}
                        </span>
                    </div>
                </div>
            </div>

            {/* Floating metric labels */}
            <div className="orb-metric orb-metric-ph">
                <div className="orb-metric-inner">
                    <span className="orb-metric-label">pH</span>
                    <span className="orb-metric-value">{pH.toFixed(1)}</span>
                </div>
                <div className="orb-metric-line orb-metric-line-ph" style={{ background: `linear-gradient(to right, ${theme.primary}60, transparent)` }} />
            </div>

            <div className="orb-metric orb-metric-chlorine">
                <div className="orb-metric-inner">
                    <span className="orb-metric-label">Chlorine</span>
                    <span className="orb-metric-value">{chlorine.toFixed(2)}<span className="orb-metric-unit">ppm</span></span>
                </div>
                <div className="orb-metric-line orb-metric-line-chlorine" style={{ background: `linear-gradient(to left, ${theme.primary}60, transparent)` }} />
            </div>

            <div className="orb-metric orb-metric-temp">
                <div className="orb-metric-inner">
                    <span className="orb-metric-label">Temperature</span>
                    <span className="orb-metric-value">{waterTemperature.toFixed(1)}<span className="orb-metric-unit">°C</span></span>
                </div>
                <div className="orb-metric-line orb-metric-line-temp" style={{ background: `linear-gradient(to right, ${theme.primary}60, transparent)` }} />
            </div>

            <div className="orb-metric orb-metric-level">
                <div className="orb-metric-inner">
                    <span className="orb-metric-label">Water Level</span>
                    <span className="orb-metric-value">{waterLevel.toFixed(0)}<span className="orb-metric-unit">cm</span></span>
                </div>
                <div className="orb-metric-line orb-metric-line-level" style={{ background: `linear-gradient(to left, ${theme.primary}60, transparent)` }} />
            </div>

            {/* Reflection underneath */}
            <div
                className="orb-reflection"
                style={{
                    background: `radial-gradient(ellipse at center, ${theme.primary}20 0%, transparent 70%)`,
                }}
            />
        </div>
    );
};

export default WaterQualityOrb;

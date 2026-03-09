import { useMemo } from "react";

type GaugeDialProps = {
    label: string;
    value: number | null;
    unit: string;
    min: number;
    max: number;
    targetMin: number;
    targetMax: number;
    color: string;
    icon: JSX.Element;
};

const GaugeDial = ({ label, value, unit, min, max, targetMin, targetMax, color, icon }: GaugeDialProps) => {
    const radius = 62;
    const circumference = 2 * Math.PI * radius;
    const arcLength = circumference * 0.75; // 270 degrees

    const { percent, status, statusColor, statusBg } = useMemo(() => {
        if (value === null) return { percent: 0, status: "N/A", statusColor: "rgba(255,255,255,0.5)", statusBg: "rgba(255,255,255,0.08)" };
        const p = Math.max(0, Math.min(1, (value - min) / (max - min)));
        const border = 0.1 * (targetMax - targetMin);
        let s = "Optimal", sc = "#4ade80", sb = "rgba(74,222,128,0.15)";
        if (value < targetMin || value > targetMax) { s = "Critical"; sc = "#f87171"; sb = "rgba(248,113,113,0.15)"; }
        else if (value < targetMin + border || value > targetMax - border) { s = "Borderline"; sc = "#fbbf24"; sb = "rgba(251,191,36,0.15)"; }
        return { percent: p, status: s, statusColor: sc, statusBg: sb };
    }, [value, min, max, targetMin, targetMax]);

    const offset = arcLength - arcLength * percent;

    return (
        <div className="gauge-card">
            <div className="gauge-svg-wrap">
                <div className="gauge-bezel" />
                <svg className="gauge-svg" viewBox="0 0 140 140">
                    <circle cx="70" cy="70" r={radius} className="gauge-track"
                        strokeDasharray={`${arcLength} ${circumference}`}
                        strokeDashoffset={0}
                        transform="rotate(135 70 70)"
                    />
                    <circle cx="70" cy="70" r={radius} className="gauge-glow"
                        stroke={color}
                        strokeDasharray={`${arcLength} ${circumference}`}
                        strokeDashoffset={offset}
                        transform="rotate(135 70 70)"
                        style={{ "--gauge-color": color } as React.CSSProperties}
                    />
                    <circle cx="70" cy="70" r={radius} className="gauge-fill"
                        stroke={color}
                        strokeDasharray={`${arcLength} ${circumference}`}
                        strokeDashoffset={offset}
                        transform="rotate(135 70 70)"
                        style={{ "--gauge-color": color } as React.CSSProperties}
                    />
                </svg>
                <div className="gauge-center">
                    <div style={{ marginBottom: 4 }}>{icon}</div>
                    <span className="gauge-value">{value !== null ? value.toFixed(1) : "—"}</span>
                    <span className="gauge-unit">{unit}</span>
                </div>
            </div>
            <span className="gauge-label">{label}</span>
            <span className="gauge-status" style={{ color: statusColor, background: statusBg }}>{status}</span>
        </div>
    );
};

export default GaugeDial;

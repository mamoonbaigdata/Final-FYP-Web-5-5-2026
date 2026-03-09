import { useMemo } from "react";

type DataBar = {
    label: string;
    value: number | null;
    min: number;
    max: number;
    targetMin: number;
    targetMax: number;
    unit: string;
};

type DataBars3DProps = {
    bars: DataBar[];
};

const DataBars3D = ({ bars }: DataBars3DProps) => {
    const computed = useMemo(() => {
        return bars.map((bar) => {
            const val = bar.value;
            const percent = val !== null ? Math.max(5, Math.min(100, ((val - bar.min) / (bar.max - bar.min)) * 100)) : 20;

            let color = "#4ade80";     // green
            let colorDark = "#16a34a";
            let colorMid = "#22c55e";

            if (val !== null) {
                if (val < bar.targetMin || val > bar.targetMax) {
                    color = "#f87171"; colorDark = "#dc2626"; colorMid = "#ef4444";
                } else {
                    const border = 0.1 * (bar.targetMax - bar.targetMin);
                    if (val < bar.targetMin + border || val > bar.targetMax - border) {
                        color = "#fbbf24"; colorDark = "#d97706"; colorMid = "#f59e0b";
                    }
                }
            }

            return { ...bar, percent, color, colorDark, colorMid };
        });
    }, [bars]);

    return (
        <div className="data-bars-wrapper">
            {computed.map((bar, i) => (
                <div className="data-bar-col" key={i}>
                    <span className="data-bar-value-label">
                        {bar.value !== null ? `${bar.value.toFixed(1)} ${bar.unit}` : "—"}
                    </span>
                    <div
                        className="data-bar-3d"
                        style={{ height: `${bar.percent * 1.8}px` }}
                    >
                        <div className="data-bar-front" style={{
                            background: `linear-gradient(180deg, ${bar.color}, ${bar.colorMid})`,
                        }} />
                        <div className="data-bar-top" style={{
                            background: `linear-gradient(180deg, ${bar.color}dd, ${bar.color})`,
                        }} />
                        <div className="data-bar-side" style={{
                            background: `linear-gradient(90deg, ${bar.colorMid}, ${bar.colorDark})`,
                        }} />
                        <div className="data-bar-glow" style={{
                            boxShadow: `0 0 20px ${bar.color}60, inset 0 0 10px ${bar.color}30`,
                        }} />
                    </div>
                    <span className="data-bar-label">{bar.label}</span>
                </div>
            ))}
        </div>
    );
};

export default DataBars3D;

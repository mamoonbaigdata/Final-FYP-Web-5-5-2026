import { Thermometer } from "lucide-react";

type PoolCrossSectionProps = {
    temperature: number | null;
    pH: number | null;
    chlorine: number | null;
    waterLevel: number | null;
};

const getWaterColor = (pH: number | null, chlorine: number | null): string => {
    if (pH === null && chlorine === null) return "rgba(56, 189, 248, 0.35)";
    let hue = 200; // blue
    if (pH !== null) {
        if (pH < 7.0) hue = 160; // greenish
        else if (pH > 7.8) hue = 220; // deeper blue
    }
    let saturation = 70;
    if (chlorine !== null) {
        if (chlorine < 1.0) { saturation = 40; hue -= 20; } // murky
        else if (chlorine > 3.0) saturation = 85;
    }
    return `hsla(${hue}, ${saturation}%, 55%, 0.45)`;
};

const PoolCrossSection = ({ temperature, pH, chlorine, waterLevel }: PoolCrossSectionProps) => {
    const levelPercent = waterLevel !== null ? Math.max(10, Math.min(90, waterLevel)) : 60;
    const waterColor = getWaterColor(pH, chlorine);
    const tempColor = temperature !== null
        ? temperature > 30 ? "rgba(251, 146, 60, 0.4)" : temperature < 26 ? "rgba(56, 189, 248, 0.3)" : "rgba(251, 191, 36, 0.25)"
        : "transparent";

    return (
        <div className="pool-cross-section">
            {/* Labels */}
            <div className="pool-label-overlay">
                <span className="pool-label-title">Pool Cross-Section</span>
                <span className="pool-label-subtitle">Live visualization</span>
            </div>

            <div className="pool-temp-display">
                <Thermometer className="pool-temp-icon" size={16} />
                <span className="pool-temp-value">{temperature !== null ? `${temperature.toFixed(1)}°C` : "—"}</span>
            </div>

            {/* Pool walls */}
            <div className="pool-wall-left" />
            <div className="pool-wall-right" />
            <div className="pool-floor" />

            {/* Water body */}
            <div className="pool-water" style={{ height: `${levelPercent}%` }}>
                <div className="pool-water-body" style={{ background: waterColor }} />
                <div className="pool-water-surface" />

                {/* Heat waves */}
                <div className="pool-heat-wave">
                    <div className="pool-heat-line" style={{ background: tempColor }} />
                    <div className="pool-heat-line" style={{ background: tempColor }} />
                    <div className="pool-heat-line" style={{ background: tempColor }} />
                </div>

                {/* Bubbles */}
                {[...Array(5)].map((_, i) => <div className="pool-bubble" key={i} />)}
            </div>

            {/* Sensor probes */}
            <div className="pool-sensor-probe" style={{ left: "25%", top: "20%", "--probe-color": "#3b82f6" } as React.CSSProperties}>
                <div className="probe-body">
                    <div className="probe-tip" style={{ background: "radial-gradient(circle, #60a5fa, #3b82f6)" }} />
                </div>
                <span className="probe-label">pH {pH !== null ? pH.toFixed(1) : "—"}</span>
            </div>

            <div className="pool-sensor-probe" style={{ left: "50%", top: "15%", "--probe-color": "#f59e0b" } as React.CSSProperties}>
                <div className="probe-body">
                    <div className="probe-tip" style={{ background: "radial-gradient(circle, #fbbf24, #f59e0b)" }} />
                </div>
                <span className="probe-label">Temp</span>
            </div>

            <div className="pool-sensor-probe" style={{ left: "75%", top: "22%", "--probe-color": "#14b8a6" } as React.CSSProperties}>
                <div className="probe-body">
                    <div className="probe-tip" style={{ background: "radial-gradient(circle, #2dd4bf, #14b8a6)" }} />
                </div>
                <span className="probe-label">Cl {chlorine !== null ? chlorine.toFixed(1) : "—"}</span>
            </div>
        </div>
    );
};

export default PoolCrossSection;

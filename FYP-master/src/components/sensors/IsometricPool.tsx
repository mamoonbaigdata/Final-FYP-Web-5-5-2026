type IsometricPoolProps = {
    temperature: number | null;
    pH: number | null;
    chlorine: number | null;
    waterLevel: number | null;
};

const IsometricPool = ({ temperature, pH, chlorine, waterLevel }: IsometricPoolProps) => {
    const pins = [
        {
            label: "Temperature",
            value: temperature !== null ? `${temperature.toFixed(1)}°C` : "—",
            color: "#fb923c",
            style: { top: "25%", left: "25%" },
        },
        {
            label: "pH",
            value: pH !== null ? pH.toFixed(2) : "—",
            color: "#60a5fa",
            style: { top: "35%", left: "60%" },
        },
        {
            label: "Chlorine",
            value: chlorine !== null ? `${chlorine.toFixed(2)} mg/L` : "—",
            color: "#2dd4bf",
            style: { top: "55%", left: "40%" },
        },
        {
            label: "Water Level",
            value: waterLevel !== null ? `${waterLevel.toFixed(0)}%` : "—",
            color: "#38bdf8",
            style: { top: "45%", right: "20%", left: "auto" as const },
        },
    ];

    return (
        <div className="isometric-pool-wrapper">
            <div className="isometric-scene">
                <div className="iso-pool-base">
                    <div className="iso-deck" />
                    <div className="iso-water">
                        <div className="iso-wave" />
                    </div>

                    {/* Sensor pins */}
                    {pins.map((pin, i) => (
                        <div
                            key={i}
                            className="iso-pin"
                            style={{ ...pin.style, "--pin-color": pin.color } as React.CSSProperties}
                        >
                            <div className="iso-pin-tooltip">
                                {pin.label}: {pin.value}
                            </div>
                            <div className="iso-pin-head" style={{ background: `radial-gradient(circle at 35% 35%, ${pin.color}, ${pin.color}99)` }} />
                            <div className="iso-pin-stick" />
                            <div className="iso-pin-shadow" />
                        </div>
                    ))}

                    <div className="iso-label">Smart Pool — Isometric View</div>
                </div>
            </div>
        </div>
    );
};

export default IsometricPool;

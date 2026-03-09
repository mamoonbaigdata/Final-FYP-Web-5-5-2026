type SensorModelsProps = {
    temperature: number | null;
    pH: number | null;
    chlorine: number | null;
    waterLevel: number | null;
};

const SensorModels = ({ temperature, pH, chlorine, waterLevel }: SensorModelsProps) => {
    // Thermometer mercury height (0-100%)
    const tempPercent = temperature !== null ? Math.max(5, Math.min(95, ((temperature - 20) / 20) * 100)) : 30;
    // Test tube liquid height
    const phPercent = pH !== null ? Math.max(10, Math.min(90, ((pH - 5) / 4) * 100)) : 50;
    // Float bob position (inverted: higher water = lower position value = higher on rod)
    const floatPos = waterLevel !== null ? Math.max(5, Math.min(85, 85 - (waterLevel / 100) * 80)) : 50;

    // pH liquid color
    const phColor = pH !== null
        ? pH < 7.0 ? "linear-gradient(180deg, #fbbf24, #f59e0b)" // acidic - yellow
            : pH > 7.6 ? "linear-gradient(180deg, #a78bfa, #7c3aed)" // basic - purple
                : "linear-gradient(180deg, #34d399, #10b981)" // neutral - green
        : "linear-gradient(180deg, #94a3b8, #64748b)";

    return (
        <div className="sensor-models-grid">
            {/* Thermometer */}
            <div className="sensor-model-card">
                <div className="model-thermometer">
                    <div className="thermo-tube">
                        <div className="thermo-mercury" style={{ height: `${tempPercent}%` }} />
                        <div className="thermo-scale">
                            {[...Array(8)].map((_, i) => <div className="thermo-tick" key={i} />)}
                        </div>
                    </div>
                    <div className="thermo-bulb" />
                </div>
                <span className="sensor-model-label">Temperature</span>
                <span className="sensor-model-reading">{temperature !== null ? `${temperature.toFixed(1)}°C` : "—"}</span>
            </div>

            {/* Test Tube (pH) */}
            <div className="sensor-model-card">
                <div className="model-testtube">
                    <div className="testtube-rim" />
                    <div className="testtube-body">
                        <div className="testtube-liquid" style={{ height: `${phPercent}%`, background: phColor }}>
                            <div className="testtube-liquid-surface" />
                        </div>
                    </div>
                </div>
                <span className="sensor-model-label">pH Level</span>
                <span className="sensor-model-reading">{pH !== null ? pH.toFixed(2) : "—"}</span>
            </div>

            {/* Chemical Dispenser (Chlorine) */}
            <div className="sensor-model-card">
                <div className="model-dispenser">
                    <div className="dispenser-cap" />
                    <div className="dispenser-tank" />
                    <div className="dispenser-nozzle">
                        <div className="dispenser-drip" />
                    </div>
                    <div className="dispenser-particles">
                        <div className="dispenser-particle" style={{ "--drift-x": "-8px" } as React.CSSProperties} />
                        <div className="dispenser-particle" style={{ "--drift-x": "2px" } as React.CSSProperties} />
                        <div className="dispenser-particle" style={{ "--drift-x": "10px" } as React.CSSProperties} />
                    </div>
                </div>
                <span className="sensor-model-label">Chlorine</span>
                <span className="sensor-model-reading">{chlorine !== null ? `${chlorine.toFixed(2)} mg/L` : "—"}</span>
            </div>

            {/* Float Sensor (Water Level) */}
            <div className="sensor-model-card">
                <div className="model-float-sensor">
                    <div className="float-rod">
                        <div className="float-bob" style={{ top: `${floatPos}%` }} />
                        <div className="float-base" />
                        <div className="float-scale">
                            {["100", "75", "50", "25", "0"].map((l, i) => (
                                <div className="float-tick" key={i}>
                                    <span className="float-tick-label">{l}</span>
                                    <div className="float-tick-line" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <span className="sensor-model-label">Water Level</span>
                <span className="sensor-model-reading">{waterLevel !== null ? `${waterLevel.toFixed(0)}%` : "—"}</span>
            </div>
        </div>
    );
};

export default SensorModels;

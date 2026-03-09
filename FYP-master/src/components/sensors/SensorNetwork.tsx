import { useMemo } from "react";
import { Thermometer, Droplets, Beaker, Waves, Cpu } from "lucide-react";

type NetworkProps = {
    temperature: number | null;
    pH: number | null;
    chlorine: number | null;
    waterLevel: number | null;
};

const SensorNetwork = ({ temperature, pH, chlorine, waterLevel }: NetworkProps) => {
    const statusFor = (n: number | null, min: number, max: number) => {
        if (n === null) return { color: "#64748b", pulse: "none" };
        if (n < min || n > max) return { color: "#f87171", pulse: "nodePulseCrit" };
        const border = 0.1 * (max - min);
        if (n < min + border || n > max - border) return { color: "#fbbf24", pulse: "nodePulseWarn" };
        return { color: "#4ade80", pulse: "nodePulseOk" };
    };

    const nodes = useMemo(() => [
        {
            id: "temp", label: "Temperature", value: temperature !== null ? `${temperature.toFixed(1)}°C` : "—",
            icon: <Thermometer size={22} />, x: 15, y: 25, ...statusFor(temperature, 26, 30),
        },
        {
            id: "ph", label: "pH Level", value: pH !== null ? pH.toFixed(2) : "—",
            icon: <Droplets size={22} />, x: 85, y: 20, ...statusFor(pH, 7.2, 7.6),
        },
        {
            id: "cl", label: "Chlorine", value: chlorine !== null ? `${chlorine.toFixed(2)} mg/L` : "—",
            icon: <Beaker size={22} />, x: 20, y: 75, ...statusFor(chlorine, 1, 3),
        },
        {
            id: "level", label: "Water Level", value: waterLevel !== null ? `${waterLevel.toFixed(0)}%` : "—",
            icon: <Waves size={22} />, x: 80, y: 78, ...statusFor(waterLevel, 80, 95),
        },
    ], [temperature, pH, chlorine, waterLevel]);

    // Hub center
    const hub = { x: 50, y: 50 };

    // Connection pairs (all nodes connect to hub)
    const connections = nodes.map(n => ({
        x1: hub.x, y1: hub.y, x2: n.x, y2: n.y, color: n.color, id: n.id,
    }));

    // Cross-connections between adjacent nodes
    const cross = [
        { from: 0, to: 1 }, { from: 1, to: 3 }, { from: 3, to: 2 }, { from: 2, to: 0 },
    ];

    return (
        <div className="sensor-network">
            {/* Background dot grid */}
            <div className="sn-dot-grid" />

            {/* SVG connections */}
            <svg className="sn-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
                <defs>
                    {nodes.map((n, i) => (
                        <linearGradient key={`g-${i}`} id={`conn-grad-${n.id}`}
                            x1={`${hub.x}%`} y1={`${hub.y}%`} x2={`${n.x}%`} y2={`${n.y}%`}>
                            <stop offset="0%" stopColor={n.color} stopOpacity="0.5" />
                            <stop offset="100%" stopColor={n.color} stopOpacity="0.15" />
                        </linearGradient>
                    ))}
                    {cross.map((c, i) => (
                        <linearGradient key={`cg-${i}`} id={`cross-grad-${i}`}
                            x1={`${nodes[c.from].x}%`} y1={`${nodes[c.from].y}%`}
                            x2={`${nodes[c.to].x}%`} y2={`${nodes[c.to].y}%`}>
                            <stop offset="0%" stopColor={nodes[c.from].color} stopOpacity="0.2" />
                            <stop offset="100%" stopColor={nodes[c.to].color} stopOpacity="0.2" />
                        </linearGradient>
                    ))}
                </defs>

                {/* Cross connections (fainter) */}
                {cross.map((c, i) => (
                    <line key={`cl-${i}`}
                        x1={nodes[c.from].x} y1={nodes[c.from].y}
                        x2={nodes[c.to].x} y2={nodes[c.to].y}
                        stroke={`url(#cross-grad-${i})`} strokeWidth="0.15"
                        strokeDasharray="1 1"
                    />
                ))}

                {/* Hub connections */}
                {connections.map((conn, i) => (
                    <g key={`main-${i}`}>
                        <line x1={conn.x1} y1={conn.y1} x2={conn.x2} y2={conn.y2}
                            stroke={`url(#conn-grad-${conn.id})`} strokeWidth="0.25" />
                        {/* Traveling particle */}
                        <circle r="0.6" fill={conn.color} opacity="0.9">
                            <animateMotion
                                dur={`${2.5 + i * 0.4}s`}
                                repeatCount="indefinite"
                                path={`M${conn.x1},${conn.y1} L${conn.x2},${conn.y2}`}
                            />
                        </circle>
                        <circle r="0.4" fill={conn.color} opacity="0.6">
                            <animateMotion
                                dur={`${2.5 + i * 0.4}s`}
                                repeatCount="indefinite"
                                begin={`${1.2 + i * 0.2}s`}
                                path={`M${conn.x2},${conn.y2} L${conn.x1},${conn.y1}`}
                            />
                        </circle>
                    </g>
                ))}

                {/* Cross-connection particles */}
                {cross.map((c, i) => (
                    <circle key={`cp-${i}`} r="0.35" fill="rgba(255,255,255,0.4)">
                        <animateMotion
                            dur={`${3.5 + i * 0.5}s`}
                            repeatCount="indefinite"
                            begin={`${i * 0.8}s`}
                            path={`M${nodes[c.from].x},${nodes[c.from].y} L${nodes[c.to].x},${nodes[c.to].y}`}
                        />
                    </circle>
                ))}
            </svg>

            {/* Central hub node */}
            <div className="sn-hub" style={{ left: `${hub.x}%`, top: `${hub.y}%` }}>
                <div className="sn-hub-ring sn-hub-ring-1" />
                <div className="sn-hub-ring sn-hub-ring-2" />
                <div className="sn-hub-core">
                    <Cpu size={20} strokeWidth={1.5} />
                </div>
                <span className="sn-hub-label">CENTRAL<br />HUB</span>
            </div>

            {/* Sensor nodes */}
            {nodes.map((node, i) => (
                <div
                    key={node.id}
                    className="sn-node"
                    style={{
                        left: `${node.x}%`,
                        top: `${node.y}%`,
                        "--node-color": node.color,
                        animationDelay: `${i * 0.2}s`,
                    } as React.CSSProperties}
                >
                    <div className="sn-node-pulse" style={{ background: `radial-gradient(circle, ${node.color}30, transparent 70%)` }} />
                    <div className="sn-node-ring" style={{ borderColor: `${node.color}50` }} />
                    <div className="sn-node-core" style={{
                        background: `radial-gradient(circle at 35% 35%, ${node.color}40, ${node.color}15)`,
                        borderColor: `${node.color}60`,
                    }}>
                        <div style={{ color: node.color }}>{node.icon}</div>
                    </div>
                    <div className="sn-node-info">
                        <span className="sn-node-label">{node.label}</span>
                        <span className="sn-node-value" style={{ color: node.color }}>{node.value}</span>
                    </div>
                </div>
            ))}

            {/* Title overlay */}
            <div className="sn-title-overlay">
                <span className="sn-title">Sensor Network</span>
                <span className="sn-subtitle">Real-time data flow</span>
            </div>
        </div>
    );
};

export default SensorNetwork;

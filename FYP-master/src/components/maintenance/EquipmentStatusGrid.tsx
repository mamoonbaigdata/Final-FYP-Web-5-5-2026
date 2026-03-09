import { Waves, Wind, Flame, Beaker, Filter } from "lucide-react";

const equipment = [
    { name: "Water Pump", icon: <Waves size={22} />, status: "Healthy", color: "#4ade80", lastMaint: "2025-10-01", nextDue: "2026-04-01" },
    { name: "Sand Filter", icon: <Filter size={22} />, status: "Needs Check", color: "#fbbf24", lastMaint: "2025-09-15", nextDue: "2026-03-15" },
    { name: "Pool Heater", icon: <Flame size={22} />, status: "Healthy", color: "#4ade80", lastMaint: "2025-11-10", nextDue: "2026-05-10" },
    { name: "Chlorinator", icon: <Beaker size={22} />, status: "Warning", color: "#fbbf24", lastMaint: "2025-10-20", nextDue: "2026-01-20" },
    { name: "Skimmer", icon: <Wind size={22} />, status: "Healthy", color: "#4ade80", lastMaint: "2025-11-14", nextDue: "2026-02-14" },
];

const EquipmentStatusGrid = () => {
    return (
        <div className="equipment-grid">
            {equipment.map((eq, i) => {
                const statusBg = eq.status === "Healthy" ? "rgba(74,222,128,0.12)" : eq.status === "Warning" ? "rgba(251,191,36,0.12)" : "rgba(248,113,113,0.12)";
                return (
                    <div className="equipment-card" key={i} style={{ "--equip-color": eq.color } as React.CSSProperties}>
                        <div className="equipment-model">
                            <div className="equipment-model-ring" style={{ borderColor: eq.color }} />
                            <div className="equipment-model-icon" style={{
                                background: `radial-gradient(circle at 35% 35%, ${eq.color}30, ${eq.color}10)`,
                                border: `1.5px solid ${eq.color}50`,
                                color: eq.color,
                            }}>
                                {eq.icon}
                            </div>
                        </div>
                        <span className="equipment-name">{eq.name}</span>
                        <span className="equipment-status" style={{ background: statusBg, color: eq.color }}>
                            {eq.status}
                        </span>
                        <span className="equipment-meta">
                            Last: {eq.lastMaint}<br />Next: {eq.nextDue}
                        </span>
                    </div>
                );
            })}
        </div>
    );
};

export default EquipmentStatusGrid;

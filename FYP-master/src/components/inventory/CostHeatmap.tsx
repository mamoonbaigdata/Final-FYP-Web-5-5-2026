import { useMemo } from "react";
import { InventoryUsageLog } from "@/providers/InventoryProvider";

type Props = { logs: InventoryUsageLog[] };

const CostHeatmap = ({ logs }: Props) => {
    const { cells, maxCost } = useMemo(() => {
        // Build last 12 weeks of data (84 days)
        const today = new Date();
        const dayMap: Record<string, number> = {};

        logs.forEach(log => {
            dayMap[log.date] = (dayMap[log.date] || 0) + log.totalCost;
        });

        const cells: { date: string; cost: number; label: string }[] = [];
        let maxCost = 0;

        for (let i = 83; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(d.getDate() - i);
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
            const cost = dayMap[key] || 0;
            if (cost > maxCost) maxCost = cost;
            const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            cells.push({
                date: `${months[d.getMonth()]} ${d.getDate()}`,
                cost,
                label: cost > 0 ? `$${cost.toFixed(2)} on ${key}` : `No spending on ${key}`,
            });
        }

        return { cells, maxCost: maxCost || 1 };
    }, [logs]);

    const getColor = (cost: number) => {
        if (cost === 0) return "rgba(255,255,255,0.03)";
        const intensity = cost / maxCost;
        if (intensity < 0.25) return "rgba(56,189,248,0.2)";
        if (intensity < 0.5) return "rgba(56,189,248,0.4)";
        if (intensity < 0.75) return "rgba(56,189,248,0.6)";
        return "rgba(56,189,248,0.85)";
    };

    const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

    return (
        <div className="heatmap-container">
            <div className="heatmap-day-labels">
                {dayLabels.map(d => <span className="heatmap-day-label" key={d}>{d}</span>)}
            </div>
            <div className="heatmap-grid">
                {cells.map((cell, i) => (
                    <div key={i} className="heatmap-cell" style={{
                        background: getColor(cell.cost),
                        boxShadow: cell.cost > 0 ? `0 0 6px ${getColor(cell.cost)}` : "none",
                    }}>
                        <div className="heatmap-tooltip">{cell.label}</div>
                    </div>
                ))}
            </div>
            <div className="heatmap-legend">
                <span className="heatmap-legend-label">Less</span>
                {[0, 0.25, 0.5, 0.75, 1].map((v, i) => (
                    <div key={i} className="heatmap-legend-cell" style={{ background: getColor(v * maxCost) }} />
                ))}
                <span className="heatmap-legend-label">More</span>
            </div>
        </div>
    );
};

export default CostHeatmap;

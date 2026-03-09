import { InventoryItem } from "@/providers/InventoryProvider";

type Props = { items: InventoryItem[] };

const StockDonutChart = ({ items }: Props) => {
    const inStock = items.filter(i => i.status === "In Stock").length;
    const lowStock = items.filter(i => i.status === "Low Stock").length;
    const outOfStock = items.filter(i => i.status === "Out of Stock").length;
    const total = items.length || 1;

    const segments = [
        { label: "In Stock", count: inStock, color: "#4ade80" },
        { label: "Low Stock", count: lowStock, color: "#fbbf24" },
        { label: "Out of Stock", count: outOfStock, color: "#f87171" },
    ];

    const r = 80;
    const circumference = 2 * Math.PI * r;
    let offset = 0;

    return (
        <div className="donut-container">
            <div className="donut-grid-bg" />

            <div className="donut-chart">
                <svg className="donut-svg" viewBox="0 0 200 200">
                    <circle cx="100" cy="100" r={r} className="donut-track" strokeWidth="16" />
                    {segments.map((seg, i) => {
                        const pct = seg.count / total;
                        const dashLength = circumference * pct;
                        const dashOffset = -offset;
                        offset += dashLength;

                        return (
                            <circle key={i} cx="100" cy="100" r={r}
                                className="donut-segment"
                                stroke={seg.color}
                                strokeWidth="16"
                                strokeDasharray={`${dashLength} ${circumference - dashLength}`}
                                strokeDashoffset={dashOffset}
                                style={{ filter: `drop-shadow(0 0 6px ${seg.color})` }}
                            />
                        );
                    })}
                </svg>
                <div className="donut-center">
                    <span className="donut-center-value">{items.length}</span>
                    <span className="donut-center-label">Total Items</span>
                </div>
            </div>

            <div className="donut-legend">
                {segments.map((seg, i) => (
                    <div className="donut-legend-item" key={i}>
                        <div className="donut-legend-dot" style={{ background: seg.color, boxShadow: `0 0 8px ${seg.color}60` }} />
                        <div className="donut-legend-info">
                            <span className="donut-legend-name">{seg.label}</span>
                            <span className="donut-legend-value">{seg.count}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default StockDonutChart;

import { InventoryItem } from "@/providers/InventoryProvider";

type Props = { items: InventoryItem[] };

const MAX_QTY = 50; // max scale for bars

const getBarColor = (status: InventoryItem["status"]) => {
    if (status === "In Stock") return { fill: "linear-gradient(90deg, #4ade80, #22d3ee)", glow: "#4ade80" };
    if (status === "Low Stock") return { fill: "linear-gradient(90deg, #fbbf24, #fb923c)", glow: "#fbbf24" };
    return { fill: "linear-gradient(90deg, #f87171, #ef4444)", glow: "#f87171" };
};

const getStatusStyle = (status: InventoryItem["status"]) => {
    if (status === "In Stock") return { bg: "rgba(74,222,128,0.15)", color: "#4ade80" };
    if (status === "Low Stock") return { bg: "rgba(251,191,36,0.15)", color: "#fbbf24" };
    return { bg: "rgba(248,113,113,0.15)", color: "#f87171" };
};

const StockLevelBars = ({ items }: Props) => {
    return (
        <div className="stock-bars-container">
            {items.map((item) => {
                const pct = Math.min(100, (item.quantity / MAX_QTY) * 100);
                const bar = getBarColor(item.status);
                const ss = getStatusStyle(item.status);

                return (
                    <div className="stock-bar-item" key={item.id}>
                        <div className="stock-bar-header">
                            <span className="stock-bar-name">{item.name}</span>
                            <span className="stock-bar-qty">{item.quantity} {item.unit}</span>
                        </div>
                        <div className="stock-bar-track">
                            <div className="stock-bar-fill" style={{
                                width: `${pct}%`,
                                background: bar.fill,
                                boxShadow: `0 0 12px ${bar.glow}40`,
                            }} />
                        </div>
                        <span className="stock-bar-status" style={{ background: ss.bg, color: ss.color }}>
                            {item.status}
                        </span>
                    </div>
                );
            })}
        </div>
    );
};

export default StockLevelBars;

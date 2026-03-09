import { Package, CheckCircle, AlertTriangle, XCircle, DollarSign } from "lucide-react";
import { InventoryItem } from "@/providers/InventoryProvider";

type Props = { items: InventoryItem[] };

const InventorySummaryCards = ({ items }: Props) => {
    const total = items.length;
    const inStock = items.filter(i => i.status === "In Stock").length;
    const lowStock = items.filter(i => i.status === "Low Stock").length;
    const outOfStock = items.filter(i => i.status === "Out of Stock").length;
    const totalValue = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);

    const stats = [
        { label: "Total Items", value: total, icon: <Package size={18} />, color: "#38bdf8", spark: [3, 4, 5, 4, 6, 5, 7] },
        { label: "In Stock", value: inStock, icon: <CheckCircle size={18} />, color: "#4ade80", spark: [5, 6, 7, 6, 8, 7, 8] },
        { label: "Low Stock", value: lowStock, icon: <AlertTriangle size={18} />, color: "#fbbf24", spark: [2, 3, 2, 4, 3, 2, 3] },
        { label: "Out of Stock", value: outOfStock, icon: <XCircle size={18} />, color: "#f87171", spark: [1, 0, 2, 1, 0, 1, 0] },
        { label: "Total Value", value: `$${totalValue.toFixed(0)}`, icon: <DollarSign size={18} />, color: "#a78bfa", spark: [4, 5, 3, 6, 5, 7, 6] },
    ];

    const sparkPath = (data: number[]) => {
        const max = Math.max(...data, 1);
        const h = 28, w = 100;
        const step = w / (data.length - 1);
        return data.map((v, i) => `${i === 0 ? "M" : "L"}${i * step},${h - (v / max) * h}`).join(" ");
    };

    return (
        <div className="inv-summary-grid">
            {stats.map((s, i) => (
                <div className="inv-summary-card" key={i}>
                    <div className="inv-summary-icon" style={{ background: `${s.color}15`, color: s.color }}>
                        {s.icon}
                    </div>
                    <div className="inv-summary-value">{s.value}</div>
                    <div className="inv-summary-label">{s.label}</div>
                    <svg className="inv-summary-sparkline" viewBox="0 0 100 28" preserveAspectRatio="none">
                        <path d={sparkPath(s.spark)} fill="none" stroke={s.color} strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                </div>
            ))}
        </div>
    );
};

export default InventorySummaryCards;

import { AlertTriangle, XCircle } from "lucide-react";
import { InventoryItem } from "@/providers/InventoryProvider";

type Props = { items: InventoryItem[] };

const RestockAlerts = ({ items }: Props) => {
    const alerts = items
        .filter(i => i.status === "Low Stock" || i.status === "Out of Stock")
        .sort((a, b) => {
            if (a.status === "Out of Stock" && b.status !== "Out of Stock") return -1;
            if (b.status === "Out of Stock" && a.status !== "Out of Stock") return 1;
            return a.quantity - b.quantity;
        });

    if (alerts.length === 0) {
        return (
            <div className="restock-panel">
                <div className="restock-empty">✅ All items are fully stocked!</div>
            </div>
        );
    }

    return (
        <div className="restock-panel">
            <div className="restock-list">
                {alerts.map((item) => {
                    const isOut = item.status === "Out of Stock";
                    const color = isOut ? "#f87171" : "#fbbf24";
                    const statusBg = isOut ? "rgba(248,113,113,0.15)" : "rgba(251,191,36,0.15)";

                    return (
                        <div className="restock-card" key={item.id}>
                            <div className="restock-icon" style={{ background: `${color}15`, color }}>
                                {isOut ? <XCircle size={18} /> : <AlertTriangle size={18} />}
                            </div>
                            <div className="restock-info">
                                <span className="restock-name">{item.name}</span>
                                <span className="restock-detail">
                                    {item.quantity} {item.unit} remaining • ${item.unitPrice.toFixed(2)}/unit
                                </span>
                            </div>
                            <span className="restock-status-badge" style={{ background: statusBg, color }}>
                                {item.status}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default RestockAlerts;

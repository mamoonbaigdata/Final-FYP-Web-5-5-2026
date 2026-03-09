import { Edit2 } from "lucide-react";
import { InventoryItem } from "@/providers/InventoryProvider";

type Props = {
    items: InventoryItem[];
    onEdit: (item: InventoryItem) => void;
};

const getStatusStyle = (status: InventoryItem["status"]) => {
    if (status === "In Stock") return { bg: "rgba(74,222,128,0.15)", color: "#4ade80" };
    if (status === "Low Stock") return { bg: "rgba(251,191,36,0.15)", color: "#fbbf24" };
    return { bg: "rgba(248,113,113,0.15)", color: "#f87171" };
};

const getGaugeColor = (status: InventoryItem["status"]) => {
    if (status === "In Stock") return "linear-gradient(90deg, #4ade80, #22d3ee)";
    if (status === "Low Stock") return "linear-gradient(90deg, #fbbf24, #fb923c)";
    return "linear-gradient(90deg, #f87171, #ef4444)";
};

const InventoryItemCards = ({ items, onEdit }: Props) => {
    return (
        <div className="inv-cards-grid">
            {items.map((item) => {
                const ss = getStatusStyle(item.status);
                const pct = Math.min(100, (item.quantity / 50) * 100);
                const cardClass = item.status === "Low Stock" ? "inv-item-card-low" :
                    item.status === "Out of Stock" ? "inv-item-card-out" : "";

                return (
                    <div key={item.id} className={`inv-item-card ${cardClass}`}>
                        <button className="inv-item-card-edit" onClick={() => onEdit(item)}>
                            <Edit2 size={14} />
                        </button>
                        <div className="inv-item-card-header">
                            <div>
                                <div className="inv-item-card-name">{item.name}</div>
                                <div className="inv-item-card-id">{item.id}</div>
                            </div>
                            <span className="inv-item-card-status" style={{ background: ss.bg, color: ss.color }}>
                                {item.status}
                            </span>
                        </div>
                        <div className="inv-item-card-gauge">
                            <div className="inv-item-card-gauge-fill" style={{ width: `${pct}%`, background: getGaugeColor(item.status) }} />
                        </div>
                        <div className="inv-item-card-details">
                            <div className="inv-item-card-detail">
                                <span className="inv-item-card-detail-label">Quantity</span>
                                <span className="inv-item-card-detail-value">{item.quantity} {item.unit}</span>
                            </div>
                            <div className="inv-item-card-detail">
                                <span className="inv-item-card-detail-label">Unit Price</span>
                                <span className="inv-item-card-detail-value">${item.unitPrice.toFixed(2)}</span>
                            </div>
                            <div className="inv-item-card-detail">
                                <span className="inv-item-card-detail-label">Total Value</span>
                                <span className="inv-item-card-detail-value">${(item.unitPrice * item.quantity).toFixed(2)}</span>
                            </div>
                            <div className="inv-item-card-detail">
                                <span className="inv-item-card-detail-label">Unit</span>
                                <span className="inv-item-card-detail-value">{item.unit}</span>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default InventoryItemCards;

type HistoryItem = { id: string; orderId: string; title: string; date: string; user: string; status: "Completed" | "Scheduled" };
type Props = { items: HistoryItem[] };

const ActivityTimeline = ({ items }: Props) => {
    return (
        <div className="timeline-container">
            <div className="timeline-line">
                <div className="timeline-line-particle" />
                <div className="timeline-line-particle" style={{ animationDelay: "2.5s" }} />
            </div>

            {items.map((item, i) => {
                const color = item.status === "Completed" ? "#4ade80" : "#38bdf8";
                return (
                    <div className="timeline-item" key={item.id} style={{ animationDelay: `${i * 0.1}s` }}>
                        <div className="timeline-node">
                            <div className="timeline-dot" style={{ borderColor: color, boxShadow: `0 0 8px ${color}40` }} />
                        </div>
                        <div className="timeline-card">
                            <div className="timeline-card-header">
                                <span className="timeline-card-title">{item.title}</span>
                                <span className="timeline-card-order">{item.orderId}</span>
                            </div>
                            <div className="timeline-card-meta">
                                {item.date} • {item.user}
                            </div>
                            <span className="timeline-card-status" style={{
                                background: item.status === "Completed" ? "rgba(74,222,128,0.15)" : "rgba(56,189,248,0.15)",
                                color: item.status === "Completed" ? "#4ade80" : "#38bdf8",
                            }}>
                                {item.status}
                            </span>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default ActivityTimeline;

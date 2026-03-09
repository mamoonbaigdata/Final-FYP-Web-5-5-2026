import { useState } from "react";

type FlipCardProps = {
    label: string;
    value: string;
    target: string;
    status: "Optimal" | "Borderline" | "Critical" | "N/A";
    lastUpdate: string;
    icon: JSX.Element;
    color: string;
    details: { label: string; value: string }[];
};

const FlipCard = ({ label, value, target, status, lastUpdate, icon, color, details }: FlipCardProps) => {
    const [flipped, setFlipped] = useState(false);

    return (
        <div className={`flip-card ${flipped ? "flipped" : ""}`} onClick={() => setFlipped(!flipped)}
            style={{ "--flip-glow": color } as React.CSSProperties}>
            <div className="flip-card-inner">
                {/* Front */}
                <div className="flip-card-front">
                    <div className="flip-card-icon" style={{ background: `${color}20` }}>
                        {icon}
                    </div>
                    <span className="flip-card-value">{value}</span>
                    <span className="flip-card-label">{label}</span>
                    <span className={`gauge-status`} style={{
                        color: status === "Optimal" ? "#4ade80" : status === "Borderline" ? "#fbbf24" : status === "Critical" ? "#f87171" : "rgba(255,255,255,0.5)",
                        background: status === "Optimal" ? "rgba(74,222,128,0.15)" : status === "Borderline" ? "rgba(251,191,36,0.15)" : status === "Critical" ? "rgba(248,113,113,0.15)" : "rgba(255,255,255,0.08)",
                    }}>{status}</span>
                    <span className="flip-card-hint">click to flip</span>
                </div>
                {/* Back */}
                <div className="flip-card-back">
                    <span className="flip-back-title">{label} Details</span>
                    {details.map((d, i) => (
                        <div className="flip-back-row" key={i}>
                            <span className="flip-back-row-label">{d.label}</span>
                            <span className="flip-back-row-value">{d.value}</span>
                        </div>
                    ))}
                    <div className="flip-back-row">
                        <span className="flip-back-row-label">Target Range</span>
                        <span className="flip-back-row-value">{target}</span>
                    </div>
                    <div className="flip-back-row">
                        <span className="flip-back-row-label">Status</span>
                        <span className="flip-back-row-value" style={{
                            color: status === "Optimal" ? "#4ade80" : status === "Borderline" ? "#fbbf24" : "#f87171"
                        }}>{status}</span>
                    </div>
                    <div className="flip-back-row" style={{ borderBottom: "none" }}>
                        <span className="flip-back-row-label">Last Update</span>
                        <span className="flip-back-row-value">{lastUpdate || "—"}</span>
                    </div>
                    <span className="flip-card-hint">click to flip back</span>
                </div>
            </div>
        </div>
    );
};

export default FlipCard;

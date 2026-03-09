import { useMemo } from "react";

type Props = {
    totalTasks: number;
    completed: number;
    overdue: number;
    onTime: number;
};

const MaintenanceHealthRing = ({ totalTasks, completed, overdue, onTime }: Props) => {
    const score = useMemo(() => {
        if (totalTasks === 0) return 100;
        return Math.round((onTime / Math.max(1, totalTasks)) * 100);
    }, [totalTasks, onTime]);

    const r1 = 90, r2 = 75, r3 = 60;
    const c1 = 2 * Math.PI * r1, c2 = 2 * Math.PI * r2, c3 = 2 * Math.PI * r3;

    const completedPct = totalTasks > 0 ? completed / totalTasks : 0;
    const overduePct = totalTasks > 0 ? overdue / totalTasks : 0;
    const onTimePct = totalTasks > 0 ? onTime / totalTasks : 0;

    const scoreColor = score >= 80 ? "#4ade80" : score >= 50 ? "#fbbf24" : "#f87171";

    return (
        <div className="health-ring-container">
            <div className="health-ring-grid-bg" />

            <div className="health-ring-main">
                <svg className="health-ring-svg" viewBox="0 0 200 200">
                    {/* Outer ring - completed */}
                    <circle cx="100" cy="100" r={r1} className="health-ring-track" strokeWidth="8" />
                    <circle cx="100" cy="100" r={r1} className="health-ring-fill"
                        stroke="#4ade80" strokeWidth="8"
                        strokeDasharray={c1} strokeDashoffset={c1 - c1 * completedPct}
                        style={{ filter: "drop-shadow(0 0 6px #4ade80)" }} />

                    {/* Middle ring - on time */}
                    <circle cx="100" cy="100" r={r2} className="health-ring-track" strokeWidth="8" />
                    <circle cx="100" cy="100" r={r2} className="health-ring-fill"
                        stroke="#38bdf8" strokeWidth="8"
                        strokeDasharray={c2} strokeDashoffset={c2 - c2 * onTimePct}
                        style={{ filter: "drop-shadow(0 0 6px #38bdf8)" }} />

                    {/* Inner ring - overdue */}
                    <circle cx="100" cy="100" r={r3} className="health-ring-track" strokeWidth="8" />
                    <circle cx="100" cy="100" r={r3} className="health-ring-fill"
                        stroke="#f87171" strokeWidth="8"
                        strokeDasharray={c3} strokeDashoffset={c3 - c3 * overduePct}
                        style={{ filter: "drop-shadow(0 0 6px #f87171)" }} />
                </svg>

                <div className="health-ring-center">
                    <span className="health-ring-score" style={{ color: scoreColor }}>{score}%</span>
                    <span className="health-ring-label" style={{ color: scoreColor }}>ON-TRACK</span>
                </div>
            </div>

            <div className="health-ring-stats">
                <div className="health-stat-item">
                    <div className="health-stat-dot" style={{ background: "#4ade80", boxShadow: "0 0 8px rgba(74,222,128,0.5)" }} />
                    <div className="health-stat-info">
                        <span className="health-stat-name">Completed</span>
                        <span className="health-stat-value">{completed} / {totalTasks}</span>
                    </div>
                </div>
                <div className="health-stat-item">
                    <div className="health-stat-dot" style={{ background: "#38bdf8", boxShadow: "0 0 8px rgba(56,189,248,0.5)" }} />
                    <div className="health-stat-info">
                        <span className="health-stat-name">On Time</span>
                        <span className="health-stat-value">{onTime}</span>
                    </div>
                </div>
                <div className="health-stat-item">
                    <div className="health-stat-dot" style={{ background: "#f87171", boxShadow: "0 0 8px rgba(248,113,113,0.5)" }} />
                    <div className="health-stat-info">
                        <span className="health-stat-name">Overdue</span>
                        <span className="health-stat-value">{overdue}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MaintenanceHealthRing;

import { CheckCircle, Clock, AlertTriangle, TrendingUp } from "lucide-react";

type Props = {
    totalTasks: number;
    completedThisMonth: number;
    overdue: number;
    avgResponseDays: number;
};

const MaintenanceStats = ({ totalTasks, completedThisMonth, overdue, avgResponseDays }: Props) => {
    const stats = [
        {
            label: "Total Tasks",
            value: totalTasks,
            icon: <CheckCircle size={18} />,
            color: "#38bdf8",
            sparkData: [3, 5, 4, 7, 6, 8, 5],
        },
        {
            label: "Completed This Month",
            value: completedThisMonth,
            icon: <TrendingUp size={18} />,
            color: "#4ade80",
            sparkData: [2, 4, 3, 6, 5, 7, 8],
        },
        {
            label: "Overdue",
            value: overdue,
            icon: <AlertTriangle size={18} />,
            color: "#f87171",
            sparkData: [1, 2, 3, 2, 1, 2, 1],
        },
        {
            label: "Avg. Response",
            value: `${avgResponseDays}d`,
            icon: <Clock size={18} />,
            color: "#fbbf24",
            sparkData: [5, 4, 3, 4, 3, 2, 3],
        },
    ];

    // Generate sparkline SVG path
    const sparkPath = (data: number[]) => {
        const max = Math.max(...data);
        const h = 28;
        const w = 100;
        const step = w / (data.length - 1);
        return data.map((v, i) => `${i === 0 ? "M" : "L"}${i * step},${h - (v / max) * h}`).join(" ");
    };

    return (
        <div className="maint-stats-grid">
            {stats.map((s, i) => (
                <div className="maint-stat-card" key={i}>
                    <div className="maint-stat-icon" style={{ background: `${s.color}15`, color: s.color }}>
                        {s.icon}
                    </div>
                    <div className="maint-stat-value">{s.value}</div>
                    <div className="maint-stat-label">{s.label}</div>
                    <svg className="maint-stat-sparkline" viewBox="0 0 100 28" preserveAspectRatio="none">
                        <path d={sparkPath(s.sparkData)} fill="none" stroke={s.color} strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                </div>
            ))}
        </div>
    );
};

export default MaintenanceStats;

import { useState, useEffect, useMemo } from "react";

type Task = { id: string; title: string; due: string; tag: "Warning" | "High Priority" | "Routine" };
type Props = { tasks: Task[] };

const tagStyles: Record<string, { bg: string; text: string }> = {
    Warning: { bg: "rgba(248,113,113,0.15)", text: "#f87171" },
    "High Priority": { bg: "rgba(251,191,36,0.15)", text: "#fbbf24" },
    Routine: { bg: "rgba(74,222,128,0.15)", text: "#4ade80" },
};

const parseDueDate = (due: string): number => {
    if (due === "IMMEDIATE") return 0;
    // Parse as local date (YYYY-MM-DD) to avoid timezone issues
    const parts = due.split("-");
    if (parts.length === 3) {
        const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]), 23, 59, 59);
        return d.getTime();
    }
    // Fallback: try native parsing
    return new Date(due).getTime();
};

const computeCountdown = (due: string) => {
    if (due === "IMMEDIATE") return { days: 0, hours: 0, mins: 0, secs: 0, urgent: true, totalMs: 0 };
    const now = Date.now();
    const target = parseDueDate(due);
    const diff = Math.max(0, target - now);
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const secs = Math.floor((diff % (1000 * 60)) / 1000);
    return { days, hours, mins, secs, urgent: diff === 0, totalMs: diff };
};

const pad = (n: number) => String(n).padStart(2, "0");

const FlipDigit = ({ value }: { value: string }) => (
    <div className="countdown-flip">
        <div className="countdown-flip-top">
            <span className="countdown-flip-num">{value}</span>
        </div>
        <div className="countdown-flip-divider" />
        <div className="countdown-flip-bottom">
            <span className="countdown-flip-num">{value}</span>
        </div>
    </div>
);

const CountdownCards = ({ tasks }: Props) => {
    const [, setTick] = useState(0);

    // Update every second for a live countdown
    useEffect(() => {
        const interval = setInterval(() => setTick(t => t + 1), 1000);
        return () => clearInterval(interval);
    }, []);

    // Sort tasks: IMMEDIATE/overdue first, then by closest due date
    const sortedTasks = useMemo(() => {
        return [...tasks].sort((a, b) => {
            const aMs = parseDueDate(a.due);
            const bMs = parseDueDate(b.due);
            return aMs - bMs;
        });
    }, [tasks]);

    return (
        <div className="countdown-grid">
            {sortedTasks.map((task) => {
                const cd = computeCountdown(task.due);
                const ts = tagStyles[task.tag] || tagStyles.Routine;

                return (
                    <div key={task.id} className={`countdown-card ${cd.urgent ? "countdown-card-urgent" : ""}`}>
                        <div className="countdown-header">
                            <span className="countdown-title">{task.title}</span>
                            <span className="countdown-tag" style={{ background: ts.bg, color: ts.text }}>{task.tag}</span>
                        </div>
                        <div style={{ fontSize: "0.6rem", color: "rgba(255,255,255,0.35)", marginBottom: "0.75rem", fontFamily: "monospace" }}>
                            Due: {task.due}
                        </div>
                        <div className="countdown-digits">
                            <div className="countdown-unit">
                                <FlipDigit value={pad(cd.days)} />
                                <span className="countdown-unit-label">Days</span>
                            </div>
                            <span className="countdown-separator">:</span>
                            <div className="countdown-unit">
                                <FlipDigit value={pad(cd.hours)} />
                                <span className="countdown-unit-label">Hours</span>
                            </div>
                            <span className="countdown-separator">:</span>
                            <div className="countdown-unit">
                                <FlipDigit value={pad(cd.mins)} />
                                <span className="countdown-unit-label">Mins</span>
                            </div>
                            <span className="countdown-separator">:</span>
                            <div className="countdown-unit">
                                <FlipDigit value={pad(cd.secs)} />
                                <span className="countdown-unit-label">Secs</span>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default CountdownCards;

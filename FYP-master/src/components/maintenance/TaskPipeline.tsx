type Task = { id: string; title: string; due: string; tag: "Warning" | "High Priority" | "Routine" };

type Props = { tasks: Task[] };

const tagColors: Record<string, { bg: string; text: string; border: string }> = {
    Warning: { bg: "rgba(248,113,113,0.15)", text: "#f87171", border: "#f87171" },
    "High Priority": { bg: "rgba(251,191,36,0.15)", text: "#fbbf24", border: "#fbbf24" },
    Routine: { bg: "rgba(74,222,128,0.15)", text: "#4ade80", border: "#4ade80" },
};

const isOverdue = (due: string) => {
    if (due === "IMMEDIATE") return true;
    const target = new Date(due);
    return target.getTime() < Date.now();
};

const isDueSoon = (due: string) => {
    if (due === "IMMEDIATE") return false;
    const target = new Date(due);
    const diff = target.getTime() - Date.now();
    return diff >= 0 && diff <= 7 * 24 * 60 * 60 * 1000; // within 7 days
};

const TaskPipeline = ({ tasks }: Props) => {
    const stages = [
        { label: "OVERDUE", color: "#f87171", items: tasks.filter(t => isOverdue(t.due)) },
        { label: "DUE SOON", color: "#fbbf24", items: tasks.filter(t => !isOverdue(t.due) && isDueSoon(t.due)) },
        { label: "UPCOMING", color: "#38bdf8", items: tasks.filter(t => !isOverdue(t.due) && !isDueSoon(t.due)) },
        { label: "COMPLETED", color: "#4ade80", items: [] as Task[] },
    ];

    return (
        <div className="pipeline-container">
            <div className="pipeline-track">
                <div className="pipeline-line">
                    <div className="pipeline-line-glow" />
                </div>
                <div className="pipeline-particle" />
                <div className="pipeline-particle" style={{ animationDelay: "2s" }} />

                {stages.map((stage, i) => (
                    <div className="pipeline-stage" key={i}>
                        <span className="pipeline-stage-label" style={{ color: stage.color, borderColor: `${stage.color}30` }}>
                            {stage.label} {stage.items.length > 0 && `(${stage.items.length})`}
                        </span>
                        <div className="pipeline-node" style={{ borderColor: stage.color, boxShadow: `0 0 10px ${stage.color}40` }} />
                        {stage.items.length > 0 ? (
                            stage.items.map((task) => {
                                const tc = tagColors[task.tag] || tagColors.Routine;
                                return (
                                    <div key={task.id} className="pipeline-card"
                                        style={{ borderLeftColor: tc.border, borderLeftWidth: 3 }}>
                                        <div className="pipeline-card-title">{task.title}</div>
                                        <div className="pipeline-card-due">Due: {task.due}</div>
                                        <span className="pipeline-card-tag" style={{ background: tc.bg, color: tc.text }}>
                                            {task.tag}
                                        </span>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="pipeline-empty-slot">No tasks</div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TaskPipeline;

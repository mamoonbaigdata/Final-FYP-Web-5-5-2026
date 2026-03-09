import { useState, useRef, useEffect } from "react";

type LogEntry = { text: string; time: string };
type TaskTag = "Warning" | "High Priority" | "Routine";

type Props = {
    logs: LogEntry[];
    onSubmit: (text: string, tag: TaskTag, due: string) => void;
};

const tagOptions: { value: TaskTag; label: string; color: string }[] = [
    { value: "Warning", label: "Warning", color: "#f87171" },
    { value: "High Priority", label: "High Priority", color: "#fbbf24" },
    { value: "Routine", label: "Routine", color: "#4ade80" },
];

const ActionLogConsole = ({ logs, onSubmit }: Props) => {
    const [input, setInput] = useState("");
    const [tag, setTag] = useState<TaskTag>("Routine");
    const [dueDate, setDueDate] = useState("");
    const bodyRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (bodyRef.current) {
            bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
        }
    }, [logs]);

    const handleSubmit = () => {
        if (!input.trim()) return;
        onSubmit(input.trim(), tag, dueDate || "IMMEDIATE");
        setInput("");
        setDueDate("");
        setTag("Routine");
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") handleSubmit();
    };

    const activeTag = tagOptions.find(t => t.value === tag)!;

    return (
        <div className="console-container">
            <div className="console-header">
                <div className="console-dot" style={{ background: "#f87171" }} />
                <div className="console-dot" style={{ background: "#fbbf24" }} />
                <div className="console-dot" style={{ background: "#4ade80" }} />
                <span className="console-title">maintenance-log — bash</span>
            </div>

            <div className="console-body" ref={bodyRef}>
                <div className="console-line">
                    <span className="console-prompt">$</span>
                    <span className="console-text" style={{ color: "rgba(255,255,255,0.3)" }}>
                        System initialized. Enter task description, set priority & due date, then press Enter.
                    </span>
                </div>
                {logs.map((log, i) => (
                    <div className="console-line" key={i}>
                        <span className="console-prompt">✓</span>
                        <span className="console-text">{log.text}</span>
                        <span className="console-timestamp">{log.time}</span>
                    </div>
                ))}
            </div>

            {/* Controls row: priority + date */}
            <div className="console-controls">
                <div className="console-control-group">
                    <span className="console-control-label">Priority</span>
                    <div className="console-tag-selector">
                        {tagOptions.map(opt => (
                            <button
                                key={opt.value}
                                className={`console-tag-btn ${tag === opt.value ? "console-tag-btn-active" : ""}`}
                                style={{
                                    borderColor: tag === opt.value ? opt.color : "rgba(255,255,255,0.1)",
                                    color: tag === opt.value ? opt.color : "rgba(255,255,255,0.4)",
                                    background: tag === opt.value ? `${opt.color}15` : "transparent",
                                }}
                                onClick={() => setTag(opt.value)}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="console-control-group">
                    <span className="console-control-label">Due Date</span>
                    <input
                        type="date"
                        className="console-date-input"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                    />
                </div>
            </div>

            {/* Input row */}
            <div className="console-input-area">
                <span className="console-input-prompt" style={{ color: activeTag.color }}>
                    [{activeTag.label}]
                </span>
                <span style={{ color: "#4ade80", fontFamily: "monospace", fontSize: "0.75rem" }}>$</span>
                <input
                    className="console-input"
                    placeholder="Describe maintenance task..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                />
                <button className="console-submit-btn" onClick={handleSubmit} style={{ color: activeTag.color }}>
                    ⏎
                </button>
            </div>
        </div>
    );
};

export default ActionLogConsole;

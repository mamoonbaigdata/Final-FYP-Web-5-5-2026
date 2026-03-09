import { useRef, useState, useCallback } from "react";
import WaterQualityOrb from "@/components/WaterQualityOrb";

type OrbHubProps = {
    pH: number;
    chlorine: number;
    waterTemperature: number;
    waterLevel: number;
    status: "Clean" | "Needs Attention" | "Dirty" | "Unknown";
};

const OrbHub = ({ pH, chlorine, waterTemperature, waterLevel, status }: OrbHubProps) => {
    const wrapperRef = useRef<HTMLDivElement>(null);
    const [rotation, setRotation] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const lastPos = useRef({ x: 0, y: 0 });

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        setIsDragging(true);
        lastPos.current = { x: e.clientX, y: e.clientY };
    }, []);

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        if (!isDragging) return;
        const dx = e.clientX - lastPos.current.x;
        const dy = e.clientY - lastPos.current.y;
        setRotation(prev => ({
            x: Math.max(-30, Math.min(30, prev.x - dy * 0.3)),
            y: Math.max(-30, Math.min(30, prev.y + dx * 0.3)),
        }));
        lastPos.current = { x: e.clientX, y: e.clientY };
    }, [isDragging]);

    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
    }, []);

    const handleMouseLeave = useCallback(() => {
        setIsDragging(false);
        // Slowly drift back
        setRotation({ x: 0, y: 0 });
    }, []);

    return (
        <div
            className="orb-hub-wrapper"
            ref={wrapperRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
        >
            <div
                className="orb-hub-inner"
                style={{
                    transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
                    transition: isDragging ? "none" : "transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
                }}
            >
                <WaterQualityOrb
                    pH={pH}
                    chlorine={chlorine}
                    waterTemperature={waterTemperature}
                    waterLevel={waterLevel}
                    status={status}
                />
            </div>
        </div>
    );
};

export default OrbHub;

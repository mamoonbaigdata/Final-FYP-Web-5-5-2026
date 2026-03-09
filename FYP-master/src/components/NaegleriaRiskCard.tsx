
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle, ShieldAlert } from "lucide-react";

interface WaterData {
    pH: number;
    chlorine: number;
    waterTemperature: number;
}

const NaegleriaRiskCard = ({ data }: { data: WaterData }) => {
    const { pH, chlorine, waterTemperature } = data;

    // Logic based on provided image
    const isHighChlorineRisk = chlorine < 0.5;
    const isHighTempRisk = waterTemperature >= 30 && waterTemperature <= 45;

    const isMedChlorineRisk = chlorine >= 0.5 && chlorine < 1.0;
    const isMedPhRisk = pH > 8.0;
    const isMedTempRisk = waterTemperature >= 25 && waterTemperature < 30;

    let riskLevel: "LOW" | "MODERATE" | "HIGH" = "LOW";
    let reasons: string[] = [];

    if (isHighChlorineRisk || isHighTempRisk) {
        riskLevel = "HIGH";
        if (isHighChlorineRisk) reasons.push("Chlorine is critically low (< 0.5 ppm), allowing amoeba survival.");
        if (isHighTempRisk) reasons.push("Temperature is in the ideal range (30°C–45°C) for rapid amoeba growth.");
    } else if (isMedChlorineRisk || isMedPhRisk || isMedTempRisk) {
        riskLevel = "MODERATE";
        if (isMedChlorineRisk) reasons.push("Chlorine is suboptimal (0.5–1.0 ppm).");
        if (isMedPhRisk) reasons.push("pH is high (> 8.0), reducing chlorine effectiveness.");
        if (isMedTempRisk) reasons.push("Temperature is warm (25°C–30°C), increasing risk.");
    } else {
        reasons.push("Conditions inhibit Naegleria growth.");
    }

    const riskConfig = {
        LOW: { color: "#22c55e", badgeBg: "rgba(34,197,94,0.15)", borderColor: "rgba(34,197,94,0.4)", alertBg: "rgba(34,197,94,0.1)" },
        MODERATE: { color: "#f59e0b", badgeBg: "rgba(245,158,11,0.15)", borderColor: "rgba(245,158,11,0.4)", alertBg: "rgba(245,158,11,0.1)" },
        HIGH: { color: "#ef4444", badgeBg: "rgba(239,68,68,0.15)", borderColor: "rgba(239,68,68,0.4)", alertBg: "rgba(239,68,68,0.1)" },
    }[riskLevel];

    const Icon = { LOW: CheckCircle, MODERATE: AlertTriangle, HIGH: ShieldAlert }[riskLevel];

    const ProgressBar = ({ value, max, color }: { value: number; max: number; color: string }) => {
        const pct = Math.min(100, (value / max) * 100);
        return (
            <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
                <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: color }} />
            </div>
        );
    };

    return (
        <div
            className="rounded-2xl border backdrop-blur-xl shadow-lg transition-all duration-300 hover:shadow-xl overflow-hidden"
            style={{
                background: "rgba(255,255,255,0.07)",
                borderColor: riskConfig.borderColor,
                borderLeftWidth: 4,
            }}
        >
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-5 pb-3">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    Naegleria Fowleri Risk
                </h3>
                <span
                    className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border"
                    style={{
                        color: riskConfig.color,
                        background: riskConfig.badgeBg,
                        borderColor: riskConfig.borderColor,
                    }}
                >
                    {riskLevel} RISK
                </span>
            </div>

            <div className="px-6 pb-5 space-y-4">
                {/* Alert box */}
                <div
                    className="p-3 rounded-xl text-sm"
                    style={{ background: riskConfig.alertBg, border: `1px solid ${riskConfig.borderColor}` }}
                >
                    <div className="flex items-start gap-2">
                        <Icon className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: riskConfig.color }} />
                        <div>
                            <p className="font-bold mb-1" style={{ color: riskConfig.color }}>
                                {riskLevel === "LOW" ? "Safe Conditions" : "Risk Detected"}
                            </p>
                            <ul className="list-disc list-inside space-y-1 text-white/70">
                                {reasons.map((r, i) => <li key={i}>{r}</li>)}
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Gauges */}
                <div className="space-y-3 pt-1">
                    {/* Chlorine */}
                    <div className="space-y-1.5">
                        <div className="flex justify-between text-xs font-semibold">
                            <span className="text-white/50">Chlorine Defense</span>
                            <span style={{ color: isHighChlorineRisk ? "#ef4444" : isMedChlorineRisk ? "#f59e0b" : "#22c55e" }}>
                                {chlorine.toFixed(2)} ppm
                            </span>
                        </div>
                        <ProgressBar value={chlorine} max={3} color={isHighChlorineRisk ? "#ef4444" : isMedChlorineRisk ? "#f59e0b" : "#22c55e"} />
                        <p className="text-[10px] text-white/30 text-right">{chlorine < 0.5 ? "Dangerous (< 0.5)" : "Effective (> 1.0)"}</p>
                    </div>

                    {/* Temperature */}
                    <div className="space-y-1.5">
                        <div className="flex justify-between text-xs font-semibold">
                            <span className="text-white/50">Temperature Safety</span>
                            <span style={{ color: isHighTempRisk ? "#ef4444" : isMedTempRisk ? "#f59e0b" : "#22c55e" }}>
                                {waterTemperature.toFixed(1)}°C
                            </span>
                        </div>
                        <ProgressBar value={waterTemperature} max={45} color={isHighTempRisk ? "#ef4444" : isMedTempRisk ? "#f59e0b" : "#22c55e"} />
                        <p className="text-[10px] text-white/30 text-right">{waterTemperature > 30 ? "Critical Range (> 30°C)" : "Inhibitory Range (< 25°C)"}</p>
                    </div>

                    {/* pH */}
                    <div className="space-y-1.5">
                        <div className="flex justify-between text-xs font-semibold">
                            <span className="text-white/50">pH Stability</span>
                            <span style={{ color: isMedPhRisk ? "#f59e0b" : "#22c55e" }}>
                                {pH.toFixed(2)}
                            </span>
                        </div>
                        <ProgressBar value={pH} max={14} color={isMedPhRisk ? "#f59e0b" : "#22c55e"} />
                        <p className="text-[10px] text-white/30 text-right">{pH > 8.0 ? "Reduces Chlorine Efficacy" : "Optimal (7.2-7.8)"}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NaegleriaRiskCard;

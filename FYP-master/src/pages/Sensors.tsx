import { useMemo } from "react";
import { Thermometer, Droplets, Beaker, Waves } from "lucide-react";

import FlipCard from "@/components/sensors/FlipCard";
import PoolCrossSection from "@/components/sensors/PoolCrossSection";
import DataBars3D from "@/components/sensors/DataBars3D";
import HolographicHUD from "@/components/sensors/HolographicHUD";
import SensorNetwork from "@/components/sensors/SensorNetwork";
import { useWaterData } from "@/providers/WaterDataProvider";

import "@/styles/sensors3d.css";

type SensorRow = {
  key: string;
  label: string;
  value: string;
  target: string;
  status: "Optimal" | "Borderline" | "Critical" | "N/A";
  lastUpdate: string;
  icon: JSX.Element;
};

const Sensors = () => {
  const { data, lastUpdate } = useWaterData();
  const pH = data.pH;
  const temperature = data.waterTemperature;
  const waterLevel = data.waterLevel;
  const chlorine = data.chlorine;
  const lastUpdateStr = lastUpdate ? lastUpdate.toLocaleTimeString() : "";

  // Status computation
  const statusFor = (n: number | null, min: number, max: number): "Optimal" | "Borderline" | "Critical" | "N/A" => {
    if (n === null) return "N/A";
    if (n < min || n > max) return "Critical";
    const border = 0.1 * (max - min);
    if (n < min + border || n > max - border) return "Borderline";
    return "Optimal";
  };

  const fmt = (n: number | null, unit: string) => (n === null ? "—" : `${n.toFixed(2)} ${unit}`);

  const rows: SensorRow[] = useMemo(() => [
    {
      key: "temperature", label: "Temperature", value: fmt(temperature, "°C"),
      target: "26°C - 30°C", status: statusFor(temperature, 26, 30), lastUpdate: lastUpdateStr,
      icon: <Thermometer className="w-5 h-5 text-amber-500" />,
    },
    {
      key: "ph", label: "pH Level", value: fmt(pH, ""),
      target: "7.2 - 7.6", status: statusFor(pH, 7.2, 7.6), lastUpdate: lastUpdateStr,
      icon: <Droplets className="w-5 h-5 text-blue-500" />,
    },
    {
      key: "chlorine", label: "Chlorine", value: fmt(chlorine, "mg/L"),
      target: "1mg/L - 3mg/L", status: statusFor(chlorine, 1, 3), lastUpdate: lastUpdateStr,
      icon: <Beaker className="w-5 h-5 text-teal-500" />,
    },
    {
      key: "waterlevel", label: "Water Level", value: fmt(waterLevel, "cm"),
      target: "80cm - 95cm", status: statusFor(waterLevel, 80, 95), lastUpdate: lastUpdateStr,
      icon: <Waves className="w-5 h-5 text-primary" />,
    },
  ], [pH, temperature, waterLevel, chlorine, lastUpdateStr]);

  // Overall pool status for Orb
  const orbStatus = useMemo((): "Clean" | "Needs Attention" | "Dirty" | "Unknown" => {
    const statuses = [
      statusFor(temperature, 26, 30),
      statusFor(pH, 7.2, 7.6),
      statusFor(chlorine, 1, 3),
      statusFor(waterLevel, 80, 95),
    ];
    if (statuses.some(s => s === "Critical")) return "Dirty";
    if (statuses.some(s => s === "Borderline")) return "Needs Attention";
    if (statuses.every(s => s === "Optimal")) return "Clean";
    return "Unknown";
  }, [temperature, pH, chlorine, waterLevel]);

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8">
      <div className="max-w-[1400px] mx-auto space-y-6">
        <h1 className="text-2xl font-semibold tracking-tight text-white">
          Live Sensor Data and Status
        </h1>

        {/* ═══════ SECTION 1: Holographic HUD ═══════ */}
        <div>
          <p className="sensor-section-title">Holographic Command Display</p>
          <HolographicHUD
            temperature={temperature}
            pH={pH}
            chlorine={chlorine}
            waterLevel={waterLevel}
            overallStatus={orbStatus}
          />
        </div>

        {/* ═══════ SECTION 2: Pool Cross-Section ═══════ */}
        <div>
          <p className="sensor-section-title">Pool Cross-Section</p>
          <PoolCrossSection
            temperature={temperature}
            pH={pH}
            chlorine={chlorine}
            waterLevel={waterLevel}
          />
        </div>

        {/* ═══════ SECTION 4: 3D Flip Cards ═══════ */}
        <div>
          <p className="sensor-section-title">Sensor Details — Flip Cards</p>
          <div className="flip-grid">
            <FlipCard
              label="Temperature" value={fmt(temperature, "°C")} target="26°C - 30°C"
              status={statusFor(temperature, 26, 30)} lastUpdate={lastUpdateStr}
              icon={<Thermometer className="w-6 h-6 text-orange-400" />} color="#fb923c"
              details={[
                { label: "Sensor Type", value: "DS18B20 Digital" },
                { label: "Accuracy", value: "±0.5°C" },
                { label: "Response Time", value: "750ms" },
              ]}
            />
            <FlipCard
              label="pH Level" value={fmt(pH, "")} target="7.2 - 7.6"
              status={statusFor(pH, 7.2, 7.6)} lastUpdate={lastUpdateStr}
              icon={<Droplets className="w-6 h-6 text-blue-400" />} color="#60a5fa"
              details={[
                { label: "Sensor Type", value: "Analog pH Probe" },
                { label: "Accuracy", value: "±0.1 pH" },
                { label: "Calibration", value: "2-point" },
              ]}
            />
            <FlipCard
              label="Chlorine" value={fmt(chlorine, "mg/L")} target="1 - 3 mg/L"
              status={statusFor(chlorine, 1, 3)} lastUpdate={lastUpdateStr}
              icon={<Beaker className="w-6 h-6 text-teal-400" />} color="#2dd4bf"
              details={[
                { label: "Sensor Type", value: "Amperometric" },
                { label: "Range", value: "0 - 5 mg/L" },
                { label: "Detection", value: "Free Chlorine" },
              ]}
            />
            <FlipCard
              label="Water Level" value={fmt(waterLevel, "cm")} target="80cm - 95cm"
              status={statusFor(waterLevel, 80, 95)} lastUpdate={lastUpdateStr}
              icon={<Waves className="w-6 h-6 text-sky-400" />} color="#38bdf8"
              details={[
                { label: "Sensor Type", value: "Ultrasonic HC-SR04" },
                { label: "Range", value: "2cm - 400cm" },
                { label: "Accuracy", value: "±3mm" },
              ]}
            />
          </div>
        </div>


        {/* ═══════ SECTION 6: Sensor Network ═══════ */}
        <div>
          <p className="sensor-section-title">Sensor Network</p>
          <SensorNetwork
            temperature={temperature}
            pH={pH}
            chlorine={chlorine}
            waterLevel={waterLevel}
          />
        </div>


        {/* ═══════ ORIGINAL TABLE (kept for reference) ═══════ */}
        <div>
          <p className="sensor-section-title">Sensor Data Table</p>
          <div className="sensor-table-wrapper">
            <div className="p-6 pb-3">
              <h3 className="text-lg font-semibold text-white">Sensors</h3>
            </div>
            <div className="px-6 pb-6">
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-white/50">
                      <th className="text-left font-medium px-3 py-2">Metric</th>
                      <th className="text-left font-medium px-3 py-2">Current Reading</th>
                      <th className="text-left font-medium px-3 py-2">Target Range</th>
                      <th className="text-left font-medium px-3 py-2">Status</th>
                      <th className="text-left font-medium px-3 py-2">Last Update</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row) => (
                      <tr key={row.key} className="border-t border-white/10">
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-2">
                            {row.icon}
                            <span className="font-medium text-white">{row.label}</span>
                          </div>
                        </td>
                        <td className="px-3 py-3 text-white">{row.value}</td>
                        <td className="px-3 py-3 text-white/50">{row.target}</td>
                        <td className="px-3 py-3">
                          <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs ${row.status === "Optimal" ? "bg-green-500/20 text-green-400" :
                            row.status === "Borderline" ? "bg-yellow-500/20 text-yellow-400" :
                              row.status === "Critical" ? "bg-red-500/20 text-red-400" : "bg-white/10 text-white/50"
                            }`}>{row.status}</span>
                        </td>
                        <td className="px-3 py-3 text-white/50">{row.lastUpdate ? `Updated @ ${row.lastUpdate}` : "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Sensors;
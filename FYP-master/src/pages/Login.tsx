import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast as sonnerToast } from "@/components/ui/sonner";
import { useAuth } from "@/lib/auth";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { useWaterData } from "@/providers/WaterDataProvider";

const VideoBackground = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
    <div className="absolute inset-0 bg-black/40 z-10"></div> {/* Dark overlay for better contrast */}
    <video
      autoPlay
      loop
      muted
      playsInline
      className="absolute inset-0 w-full h-full object-cover"
    >
      <source src="/background-video.mp4" type="video/mp4" />
      Your browser does not support the video tag.
    </video>
  </div>
);

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { data: poolData } = useWaterData();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true);
    try {
      await login(username, password);

      // Speak welcome greeting + pool condition report
      if ("speechSynthesis" in window) {
        // 1. Welcome
        const welcome = new SpeechSynthesisUtterance("Hello! Welcome to Aqua Intel.");
        welcome.rate = 0.95;
        welcome.pitch = 1.05;
        welcome.volume = 1;
        window.speechSynthesis.speak(welcome);

        // 2. Build pool condition report from live data
        const { pH, chlorine, waterTemperature, waterLevel } = poolData;

        const issues: string[] = [];
        // pH analysis (target 7.4 – 7.6)
        if (pH < 7.4) issues.push(`pH is low at ${pH.toFixed(1)}, below the target range`);
        else if (pH > 7.6) issues.push(`pH is high at ${pH.toFixed(1)}, above the target range`);

        // Chlorine analysis (target 1.5 – 2.0 ppm)
        if (chlorine < 1.5) issues.push(`Chlorine is low at ${chlorine.toFixed(1)} ppm, below the target range`);
        else if (chlorine > 2.0) issues.push(`Chlorine is high at ${chlorine.toFixed(1)} ppm, above the target range`);

        // Temperature analysis (target 26 – 28 °C)
        if (waterTemperature < 26) issues.push(`Water temperature is cold at ${waterTemperature.toFixed(1)} degrees, below the target range`);
        else if (waterTemperature > 28) issues.push(`Water temperature is warm at ${waterTemperature.toFixed(1)} degrees, above the target range`);

        // Water Level analysis (target 80 – 95 cm)
        if (waterLevel < 80) issues.push(`Water level is low at ${waterLevel.toFixed(0)} centimeters, below the target range`);
        else if (waterLevel > 95) issues.push(`Water level is high at ${waterLevel.toFixed(0)} centimeters, above the target range`);

        // Always speak pH & Chlorine explicitly
        const pHStatus = pH >= 7.4 && pH <= 7.6 ? "normal" : pH < 7.4 ? "low" : "high";
        const clStatus = chlorine >= 1.5 && chlorine <= 2.0 ? "normal" : chlorine < 1.5 ? "low" : "high";

        const pHDetail = `pH level is ${pH.toFixed(1)}, which is ${pHStatus}. The target range is 7.4 to 7.6.`;
        const clDetail = `Chlorine level is ${chlorine.toFixed(1)} ppm, which is ${clStatus}. The target range is 1.5 to 2.0 ppm.`;

        let conditionText: string;
        if (issues.length === 0) {
          conditionText = `Here is your pool status report. Overall pool condition is excellent. ${pHDetail} ${clDetail} Temperature is ${waterTemperature.toFixed(1)} degrees celsius, target is 26 to 28 degrees. Water level is ${waterLevel.toFixed(0)} centimeters, target is 80 to 95 centimeters. All parameters are within target range. Have a great day!`;
        } else if (issues.length <= 2) {
          conditionText = `Here is your pool status report. Overall pool condition needs attention. ${pHDetail} ${clDetail} Temperature is ${waterTemperature.toFixed(1)} degrees celsius, target is 26 to 28 degrees. Water level is ${waterLevel.toFixed(0)} centimeters, target is 80 to 95 centimeters. ${issues.join(". Also, ")}. Please check the dashboard for details.`;
        } else {
          conditionText = `Here is your pool status report. Overall pool condition is critical with ${issues.length} parameters out of range. ${pHDetail} ${clDetail} Temperature is ${waterTemperature.toFixed(1)} degrees celsius, target is 26 to 28 degrees. Water level is ${waterLevel.toFixed(0)} centimeters, target is 80 to 95 centimeters. Immediate attention is recommended.`;
        }

        const report = new SpeechSynthesisUtterance(conditionText);
        report.rate = 0.93;
        report.pitch = 1.0;
        report.volume = 1;
        // When the report finishes, signal DashboardLayout to start voice commands
        report.onend = () => {
          sessionStorage.setItem("aquaintel_voice_ready", "true");
        };
        window.speechSynthesis.speak(report);
      }

      sonnerToast.success(`Welcome, ${username}!`, {
        description: "You're now logged in.",
        position: "top-center",
        duration: 3000,
      });
      navigate("/dashboard");
    } catch (e: any) {
      sonnerToast.error("Authentication error", {
        description: e?.message || "Unknown error",
        position: "top-center",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative p-4 font-sans text-slate-800">
      <VideoBackground />
      {/* Removed 3D styles as they are no longer needed */}

      <Card className="w-full max-w-[420px] bg-white/20 backdrop-blur-md border-white/30 border-l-4 border-l-blue-600 shadow-2xl rounded-xl overflow-hidden animate-in fade-in zoom-in duration-500">
        <CardHeader className="pt-8 pb-4 text-center space-y-4">
          <div className="mx-auto w-96 h-auto mb-4">
            <img src="/smart-pool-logo-v3.png" alt="Smart Pool" className="w-full h-auto object-contain drop-shadow-xl mix-blend-multiply" />
          </div>
        </CardHeader>
        <CardContent className="px-8 pb-10 space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-slate-900 font-semibold">
                Username
              </Label>
              <Input
                id="username"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="bg-white/50 border-white/30 focus:bg-white/70 focus:border-blue-500 placeholder:text-slate-500 transition-all duration-300"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-slate-900 font-semibold">
                  Password
                </Label>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-white/50 border-white/30 focus:bg-white/70 focus:border-blue-500 placeholder:text-slate-500 pr-10 transition-all duration-300"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-blue-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          </div>

          <Button
            onClick={submit}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-6 shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all duration-300 text-lg"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Signing in...</span>
              </div>
            ) : (
              "Sign In"
            )}
          </Button>

          <div className="text-center text-xs text-slate-700 font-medium">
            <p>Restricted Access - Authorized Personnel Only</p>
            <p className="mt-1 opacity-75">v1.0.2 Stable Build</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;

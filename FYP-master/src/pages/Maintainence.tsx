import { useMemo, useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2, Download, Search } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useInventory } from "@/providers/InventoryProvider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";

import MaintenanceHealthRing from "@/components/maintenance/MaintenanceHealthRing";
import TaskPipeline from "@/components/maintenance/TaskPipeline";

import ActivityTimeline from "@/components/maintenance/ActivityTimeline";
import MaintenanceStats from "@/components/maintenance/MaintenanceStats";
import ActionLogConsole from "@/components/maintenance/ActionLogConsole";

import "@/styles/maintenance3d.css";

type Task = { id: string; title: string; due: string; tag: "Warning" | "High Priority" | "Routine" };
type HistoryItem = { id: string; orderId: string; title: string; date: string; user: string; status: "Completed" | "Scheduled" };

const Maintainence = () => {
  const { toast } = useToast();
  const { items, deductItem } = useInventory();

  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem("maintenance_tasks");
    return saved ? JSON.parse(saved) : [
      { id: "t1", title: "Balance pH Level", due: "IMMEDIATE", tag: "Warning" },
      { id: "t2", title: "Filter Backwash", due: "2026-03-15", tag: "High Priority" },
      { id: "t3", title: "Skimmer Basket Cleaning", due: "2026-03-22", tag: "Routine" },
    ];
  });

  const [history, setHistory] = useState<HistoryItem[]>(() => {
    const saved = localStorage.getItem("maintenance_history");
    return saved ? JSON.parse(saved) : [
      { id: "h1", orderId: "#ORD-8921", title: "Pump replaced", date: "2025-10-01", user: "Technician: Smith", status: "Completed" },
      { id: "h2", orderId: "#ORD-3312", title: "Alkalinity adjustment", date: "2025-11-15", user: "System", status: "Completed" },
      { id: "h3", orderId: "#ORD-1109", title: "Main Drain cover check", date: "2025-11-14", user: "Self", status: "Completed" },
      { id: "h4", orderId: "#ORD-9981", title: "Chlorine Shock", date: "2025-11-10", user: "Self", status: "Completed" },
    ];
  });

  useEffect(() => {
    localStorage.setItem("maintenance_tasks", JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem("maintenance_history", JSON.stringify(history));
  }, [history]);

  const [selectedItemId, setSelectedItemId] = useState<string>("none");
  const [useQuantity, setUseQuantity] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState("");

  // Console logs derived from history
  const consoleLogs = useMemo(() => {
    return history.slice(0, 10).map(h => ({
      text: `[${h.orderId}] ${h.title} — ${h.user}`,
      time: h.date,
    }));
  }, [history]);

  const filteredHistory = useMemo(() => {
    return history.filter(item =>
      item.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [history, searchQuery]);

  const logMaintenance = (description: string, tag: Task["tag"], due: string) => {
    if (description.trim().length === 0) return;

    let logTitle = description.trim();

    if (selectedItemId !== "none") {
      const item = items.find(i => i.id === selectedItemId);
      if (item) {
        if (useQuantity <= 0) {
          toast({ title: "Error", description: "Please enter a valid quantity.", variant: "destructive" });
          return;
        }
        if (item.quantity < useQuantity) {
          toast({ title: "Error", description: `Not enough stock for ${item.name}. Available: ${item.quantity}`, variant: "destructive" });
          return;
        }
        const success = deductItem(selectedItemId, useQuantity);
        if (success) {
          logTitle += ` (Used ${useQuantity} ${item.unit} of ${item.name})`;
        } else {
          toast({ title: "Error", description: "Failed to deduct inventory.", variant: "destructive" });
          return;
        }
      }
    }

    // Create a new task for Pipeline & Countdown
    const newTask: Task = {
      id: `t-${Date.now()}`,
      title: logTitle,
      due,
      tag,
    };
    setTasks(prev => [...prev, newTask]);

    // Also log to history
    const now = new Date();
    const randomId = Math.floor(1000 + Math.random() * 9000);
    const newItem: HistoryItem = {
      id: `h-${now.getTime()}`,
      orderId: `#ORD-${randomId}`,
      title: logTitle,
      date: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`,
      user: "Self",
      status: "Scheduled",
    };
    setHistory((prev) => [newItem, ...prev]);
    setSelectedItemId("none");
    setUseQuantity(0);
    toast({ title: "Task Created", description: `"${description}" added to pipeline (due: ${due}).` });
  };

  const deleteLog = (id: string) => {
    setHistory((prev) => prev.filter((h) => h.id !== id));
  };

  const downloadCSV = () => {
    const headers = ["Order ID", "Activity", "Date", "User", "Status"];
    const rows = filteredHistory.map(h => [h.orderId, h.title, h.date, h.user, h.status]);
    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.setAttribute("href", URL.createObjectURL(blob));
    link.setAttribute("download", `maintenance_log_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Stats
  const totalTasks = tasks.length + history.length;
  const completedThisMonth = history.filter(h => h.status === "Completed").length;
  const overdueCount = tasks.filter(t => t.due === "IMMEDIATE").length;

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8">
      <div className="max-w-[1400px] mx-auto space-y-6">
        <h1 className="text-3xl font-extrabold tracking-tight text-white">
          Scheduled Maintenance & History
        </h1>

        {/* ═══════ SECTION 1: Maintenance Stats ═══════ */}
        <div>
          <p className="maint-section-title">Performance Overview</p>
          <MaintenanceStats
            totalTasks={totalTasks}
            completedThisMonth={completedThisMonth}
            overdue={overdueCount}
            avgResponseDays={3}
          />
        </div>

        {/* ═══════ SECTION 2: Health Ring ═══════ */}
        <div>
          <p className="maint-section-title">Maintenance Health</p>
          <MaintenanceHealthRing
            totalTasks={totalTasks}
            completed={completedThisMonth}
            overdue={overdueCount}
            onTime={completedThisMonth - overdueCount}
          />
        </div>

        {/* ═══════ SECTION 3: Task Pipeline ═══════ */}
        <div>
          <p className="maint-section-title">Task Pipeline</p>
          <TaskPipeline tasks={tasks} />
        </div>



        {/* ═══════ SECTION 6: Action Log Console + Inventory ═══════ */}
        <div>
          <p className="maint-section-title">Maintenance Console</p>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ActionLogConsole logs={consoleLogs} onSubmit={logMaintenance} />

            <div className="rounded-2xl border border-white/10 backdrop-blur-xl p-6"
              style={{ background: "rgba(255,255,255,0.05)" }}>
              <h3 className="text-lg font-semibold text-white mb-4">Inventory Deduction</h3>
              <div className="space-y-4">
                <div>
                  <Label className="text-xs text-white/50 mb-1 block">Use Inventory Item (Optional)</Label>
                  <Select value={selectedItemId} onValueChange={(val) => setSelectedItemId(val)}>
                    <SelectTrigger className="h-9 bg-white/10 border-white/15 text-white">
                      <SelectValue placeholder="Select Item" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {items.map(i => (
                        <SelectItem key={i.id} value={i.id} disabled={i.status === "Out of Stock"}>
                          {i.name} ({i.quantity} {i.unit})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs text-white/50 mb-1 block">Quantity</Label>
                  <Input
                    type="number"
                    placeholder="Qty"
                    className="h-9 bg-white/10 border-white/15 text-white placeholder:text-white/30"
                    value={useQuantity || ""}
                    onChange={(e) => setUseQuantity(parseFloat(e.target.value) || 0)}
                    disabled={selectedItemId === "none"}
                  />
                </div>
                <p className="text-xs text-white/30">
                  Select an item and quantity, then type a description in the console and press Enter.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ═══════ SECTION 7: Activity Timeline ═══════ */}
        <div>
          <p className="maint-section-title">Activity Timeline</p>
          <div className="rounded-2xl border border-white/10 backdrop-blur-xl p-6"
            style={{ background: "rgba(255,255,255,0.05)" }}>
            <ActivityTimeline items={history} />
          </div>
        </div>

        {/* ═══════ RECORDS TABLE ═══════ */}
        <div className="rounded-2xl border border-white/10 backdrop-blur-xl shadow-lg overflow-hidden"
          style={{ background: "rgba(255,255,255,0.05)" }}>
          <div className="p-6 pb-3">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <h3 className="text-lg font-semibold text-white">All Maintenance Records</h3>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-white/40" />
                  <Input
                    type="search"
                    placeholder="Search..."
                    className="pl-8 w-[200px] md:w-[300px] bg-white/10 border-white/15 text-white placeholder:text-white/30"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <button onClick={downloadCSV} className="inline-flex items-center gap-2 h-9 rounded-md px-3 text-sm font-medium border border-white/30 text-white hover:bg-white/15 transition-colors"
                  style={{ background: "rgba(255,255,255,0.08)" }}>
                  <Download className="h-4 w-4" />
                  Export CSV
                </button>
              </div>
            </div>
          </div>
          <div className="px-6 pb-6">
            <Table>
              <TableHeader>
                <TableRow className="border-white/10">
                  <TableHead className="text-white/50">Order ID</TableHead>
                  <TableHead className="text-white/50">Activity</TableHead>
                  <TableHead className="text-white/50">Date</TableHead>
                  <TableHead className="text-white/50">User</TableHead>
                  <TableHead className="text-white/50">Status</TableHead>
                  <TableHead className="text-right text-white/50">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredHistory.length > 0 ? (
                  filteredHistory.map((h) => (
                    <TableRow key={h.id} className="border-white/5 hover:bg-white/5">
                      <TableCell className="font-medium font-mono text-white/60">{h.orderId}</TableCell>
                      <TableCell className="text-white">{h.title}</TableCell>
                      <TableCell className="text-white/70">{h.date}</TableCell>
                      <TableCell className="text-white/70">{h.user}</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
                          {h.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-500/10">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Maintenance Log</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete the record <strong>{h.orderId}</strong>? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => deleteLog(h.id)} className="bg-destructive hover:bg-destructive/90">
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-white/40">
                      No results found for "{searchQuery}"
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Maintainence;

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Plus, Edit2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { useInventory, InventoryItem } from "@/providers/InventoryProvider";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

import InventorySummaryCards from "@/components/inventory/InventorySummaryCards";
import StockLevelBars from "@/components/inventory/StockLevelBars";
import StockDonutChart from "@/components/inventory/StockDonutChart";
import InventoryItemCards from "@/components/inventory/InventoryItemCards";
import CostHeatmap from "@/components/inventory/CostHeatmap";
import RestockAlerts from "@/components/inventory/RestockAlerts";

import "@/styles/inventory3d.css";

const Inventory = () => {
    const { toast } = useToast();
    const { items, usageLogs, addItem, updateItem } = useInventory();

    const [searchQuery, setSearchQuery] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
    const [formData, setFormData] = useState<InventoryItem>({
        id: "",
        name: "",
        unit: "",
        unitPrice: 0,
        quantity: 0,
        status: "In Stock"
    });

    const filteredItems = items.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.id.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleOpenDialog = (item?: InventoryItem) => {
        if (item) {
            setEditingItem(item);
            setFormData(item);
        } else {
            setEditingItem(null);
            setFormData({
                id: `i${Date.now()}`,
                name: "",
                unit: "",
                unitPrice: 0,
                quantity: 0,
                status: "In Stock"
            });
        }
        setIsDialogOpen(true);
    };

    const handleSubmit = () => {
        if (!formData.name || !formData.unit) {
            toast({ title: "Error", description: "Name and Unit are required.", variant: "destructive" });
            return;
        }
        if (editingItem) {
            updateItem(formData);
            toast({ title: "Success", description: "Item updated successfully." });
        } else {
            addItem(formData);
            toast({ title: "Success", description: "Item added successfully." });
        }
        setIsDialogOpen(false);
    };

    return (
        <div className="min-h-screen p-4 md:p-6 lg:p-8">
            <div className="max-w-[1400px] mx-auto space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <h1 className="text-3xl font-extrabold tracking-tight text-white">Inventory Management</h1>
                    <Button className="bg-sky-500 hover:bg-sky-600 text-white" onClick={() => handleOpenDialog()}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Item
                    </Button>
                </div>

                {/* ═══════ SECTION 1: Summary Cards ═══════ */}
                <div>
                    <p className="inv-section-title">Overview</p>
                    <InventorySummaryCards items={items} />
                </div>

                {/* ═══════ SECTION 2: Donut + Restock ═══════ */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                        <p className="inv-section-title">Stock Distribution</p>
                        <StockDonutChart items={items} />
                    </div>
                    <div>
                        <p className="inv-section-title">Restock Alerts</p>
                        <RestockAlerts items={items} />
                    </div>
                </div>

                {/* ═══════ SECTION 3: Stock Level Bars ═══════ */}
                <div>
                    <p className="inv-section-title">Stock Levels</p>
                    <StockLevelBars items={items} />
                </div>

                {/* ═══════ SECTION 4: Item Cards Grid ═══════ */}
                <div>
                    <p className="inv-section-title">Inventory Items</p>
                    <div className="inv-cards-controls">
                        <div className="relative flex-1 max-w-[300px]">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-white/40" />
                            <Input
                                type="search"
                                placeholder="Search items..."
                                className="pl-8 bg-white/10 border-white/15 text-white placeholder:text-white/30"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                    <InventoryItemCards items={filteredItems} onEdit={handleOpenDialog} />
                </div>

                {/* ═══════ SECTION 5: Cost Heatmap ═══════ */}
                <div>
                    <p className="inv-section-title">Spending Heatmap (Last 12 Weeks)</p>
                    <CostHeatmap logs={usageLogs} />
                </div>

                {/* ═══════ SECTION 6: Usage History ═══════ */}
                <UsageHistorySection />

                {/* Edit / Add Dialog */}
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{editingItem ? "Edit Item" : "Add New Item"}</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="name" className="text-right">Name</Label>
                                <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="col-span-3" />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="unit" className="text-right">Unit</Label>
                                <Input id="unit" value={formData.unit} onChange={(e) => setFormData({ ...formData, unit: e.target.value })} className="col-span-3" />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="price" className="text-right">Unit Price</Label>
                                <Input id="price" type="number" step="0.01" value={formData.unitPrice} onChange={(e) => setFormData({ ...formData, unitPrice: parseFloat(e.target.value) || 0 })} className="col-span-3" />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="quantity" className="text-right">Quantity</Label>
                                <Input id="quantity" type="number" value={formData.quantity} onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })} className="col-span-3" />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="status" className="text-right">Status</Label>
                                <Select
                                    value={formData.status}
                                    onValueChange={(val: "In Stock" | "Low Stock" | "Out of Stock") => setFormData({ ...formData, status: val })}
                                >
                                    <SelectTrigger className="col-span-3">
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="In Stock">In Stock</SelectItem>
                                        <SelectItem value="Low Stock">Low Stock</SelectItem>
                                        <SelectItem value="Out of Stock">Out of Stock</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                            <Button onClick={handleSubmit}>{editingItem ? "Save Changes" : "Add Item"}</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
};

const UsageHistorySection = () => {
    const { usageLogs, items } = useInventory();
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    const filteredLogs = usageLogs.filter(log => {
        if (startDate && log.date < startDate) return false;
        if (endDate && log.date > endDate) return false;
        return true;
    });

    const aggregatedData = useMemo(() => {
        const acc: Record<string, { name: string; quantity: number; cost: number; unit: string }> = {};
        filteredLogs.forEach(log => {
            if (!acc[log.itemId]) {
                const itemDef = items.find(i => i.id === log.itemId);
                acc[log.itemId] = { name: log.itemName, quantity: 0, cost: 0, unit: itemDef?.unit || "units" };
            }
            acc[log.itemId].quantity += log.quantity;
            acc[log.itemId].cost += log.totalCost;
        });
        return Object.values(acc);
    }, [filteredLogs, items]);

    const totalCost = filteredLogs.reduce((sum, log) => sum + log.totalCost, 0);

    return (
        <div className="rounded-2xl border border-white/10 backdrop-blur-xl shadow-lg overflow-hidden" style={{ background: "rgba(255,255,255,0.05)" }}>
            <div className="p-6 pb-3">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <h3 className="text-lg font-semibold text-white">Usage History & Analysis</h3>
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-2">
                            <Label htmlFor="start-date" className="whitespace-nowrap text-xs text-white/50">From:</Label>
                            <Input id="start-date" type="date" className="w-auto bg-white/10 border-white/15 text-white" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                        </div>
                        <div className="flex items-center gap-2">
                            <Label htmlFor="end-date" className="whitespace-nowrap text-xs text-white/50">To:</Label>
                            <Input id="end-date" type="date" className="w-auto bg-white/10 border-white/15 text-white" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                        </div>
                        {(startDate || endDate) && (
                            <Button variant="ghost" size="sm" onClick={() => { setStartDate(""); setEndDate(""); }} className="text-white/70 hover:text-white hover:bg-white/10">Clear</Button>
                        )}
                    </div>
                </div>
            </div>
            <div className="px-6 pb-6">
                <div className="mb-6 p-4 rounded-xl border border-white/10 flex items-center justify-between" style={{ background: "rgba(255,255,255,0.05)" }}>
                    <span className="text-sm text-white/50 font-medium">Total Period Cost</span>
                    <div className="text-2xl font-bold text-white">${totalCost.toFixed(2)}</div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    <div className="h-[300px] w-full">
                        <h3 className="text-lg font-semibold mb-4 text-center text-white">Consumption (Quantity)</h3>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={aggregatedData} layout="vertical" margin={{ left: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="rgba(255,255,255,0.08)" />
                                <XAxis type="number" tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 12 }} stroke="rgba(255,255,255,0.15)" />
                                <YAxis dataKey="name" type="category" width={100} tick={{ fill: "rgba(255,255,255,0.7)", fontSize: 12 }} stroke="rgba(255,255,255,0.15)" />
                                <Tooltip
                                    formatter={(value: number, name: string, props: any) => [`${value} ${props.payload.unit}`, "Quantity"]}
                                    contentStyle={{ background: "rgba(15,41,66,0.95)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "8px", color: "#fff" }}
                                    labelStyle={{ color: "rgba(255,255,255,0.7)" }}
                                />
                                <Legend wrapperStyle={{ color: "rgba(255,255,255,0.7)" }} />
                                <Bar dataKey="quantity" name="Quantity Used" fill="#10b981" radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="h-[300px] w-full">
                        <h3 className="text-lg font-semibold mb-4 text-center text-white">Cost Analysis ($)</h3>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={aggregatedData} layout="vertical" margin={{ left: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="rgba(255,255,255,0.08)" />
                                <XAxis type="number" tickFormatter={(value) => `$${value}`} tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 12 }} stroke="rgba(255,255,255,0.15)" />
                                <YAxis dataKey="name" type="category" width={100} tick={{ fill: "rgba(255,255,255,0.7)", fontSize: 12 }} stroke="rgba(255,255,255,0.15)" />
                                <Tooltip
                                    formatter={(value) => `$${Number(value).toFixed(2)}`}
                                    contentStyle={{ background: "rgba(15,41,66,0.95)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "8px", color: "#fff" }}
                                    labelStyle={{ color: "rgba(255,255,255,0.7)" }}
                                />
                                <Legend wrapperStyle={{ color: "rgba(255,255,255,0.7)" }} />
                                <Bar dataKey="cost" name="Total Cost" fill="#f59e0b" radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <Table>
                    <TableHeader>
                        <TableRow className="border-white/10">
                            <TableHead className="text-white/50">Date</TableHead>
                            <TableHead className="text-white/50">Item Name</TableHead>
                            <TableHead className="text-white/50">Quantity Used</TableHead>
                            <TableHead className="text-white/50">Unit Price</TableHead>
                            <TableHead className="text-right text-white/50">Total Cost</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredLogs.length > 0 ? (
                            filteredLogs.map((log) => (
                                <TableRow key={log.id} className="border-white/5 hover:bg-white/5">
                                    <TableCell className="font-mono text-white/50">{log.date}</TableCell>
                                    <TableCell className="font-medium text-white">{log.itemName}</TableCell>
                                    <TableCell className="text-white/70">{log.quantity}</TableCell>
                                    <TableCell className="text-white/70">${log.unitPrice.toFixed(2)}</TableCell>
                                    <TableCell className="text-right font-medium text-white">${log.totalCost.toFixed(2)}</TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center text-white/40">
                                    No usage records found for this period.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
};

export default Inventory;

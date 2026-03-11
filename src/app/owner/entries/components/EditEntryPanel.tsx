"use client";

import { X, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Entry } from "./types";
import { ShoppingCart, Briefcase, Receipt, PackageOpen, HandCoins, Landmark } from "lucide-react";

const typeConfig = {
    SALE: { label: "Sale", icon: ShoppingCart, color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
    CREDIT_SUPPLY: { label: "Credit Supply", icon: Briefcase, color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20" },
    EXPENSE: { label: "Expense", icon: Receipt, color: "text-rose-500", bg: "bg-rose-500/10", border: "border-rose-500/20" },
    PURCHASE: { label: "Purchase", icon: PackageOpen, color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/20" },
    COLLECTION: { label: "Collection", icon: HandCoins, color: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/20" },
    LODGMENT: { label: "Lodgment", icon: Landmark, color: "text-indigo-500", bg: "bg-indigo-500/10", border: "border-indigo-500/20" }
};

interface EditEntryPanelProps {
    entry: Entry;
    formData: any;
    setFormData: (data: any) => void;
    onSave: () => void;
    onClose: () => void;
    saving: boolean;
}

export function EditEntryPanel({ entry, formData, setFormData, onSave, onClose, saving }: EditEntryPanelProps) {
    const config = typeConfig[entry.type];
    const Icon = config.icon;

    return (
        <>
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity" onClick={onClose} />
            <div className="fixed inset-y-0 right-0 z-50 w-full md:w-[450px] bg-[#0a0f1d] border-l border-white/5 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">

                {/* Panel Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/5 bg-[#0f1525]">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl border ${config.bg} ${config.border} ${config.color}`}>
                            <Icon size={20} />
                        </div>
                        <div>
                            <h2 className="text-lg font-black text-white">Edit {config.label}</h2>
                            <p className="text-xs text-slate-500">ID: <span className="font-mono">{entry.id.substring(0, 8)}</span></p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Panel Body */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">

                    {/* Read-only tracking data */}
                    <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-3">
                        <div className="flex justify-between items-center text-xs">
                            <span className="text-slate-500 font-medium uppercase tracking-wider">Submitted By</span>
                            <span className="text-slate-300 font-bold">{entry.rawDoc.submittedBy}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                            <span className="text-slate-500 font-medium uppercase tracking-wider">Submitted At</span>
                            <span className="text-slate-300 font-mono">{new Date(entry.rawDoc.submittedAt).toLocaleString()}</span>
                        </div>
                        {entry.rawDoc.editedAt && (
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-amber-500/70 font-medium uppercase tracking-wider">Last Edited</span>
                                <span className="text-amber-500/90 font-mono">{new Date(entry.rawDoc.editedAt).toLocaleString()}</span>
                            </div>
                        )}
                    </div>

                    {/* Editable Form */}
                    <div className="space-y-4">

                        <div className="space-y-2">
                            <Label className="uppercase text-[10px] tracking-widest text-slate-400">Date</Label>
                            <Input
                                type="date"
                                value={formData.date || ""}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                className="h-12 bg-black/20 border-white/10 text-white focus-visible:ring-emerald-500/50 [&::-webkit-calendar-picker-indicator]:invert-[0.8]"
                            />
                        </div>

                        {["SALE", "PURCHASE", "CREDIT_SUPPLY"].includes(entry.type) && (
                            <>
                                <div className="space-y-2">
                                    <Label className="uppercase text-[10px] tracking-widest text-slate-400">Product Name</Label>
                                    <select
                                        value={formData.product || ""}
                                        onChange={(e) => setFormData({ ...formData, product: e.target.value })}
                                        className="w-full h-12 px-3 rounded-md border border-white/10 bg-black/20 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500/50 appearance-none"
                                    >
                                        <option value="BAG_OF_PURE_WATER" className="bg-[#0f1525]">Bag of Pure Water</option>
                                        <option value="RUBBER_OF_BOTTLE_WATER" className="bg-[#0f1525]">Rubber of Bottle Water</option>
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="uppercase text-[10px] tracking-widest text-slate-400">Quantity</Label>
                                        <Input
                                            type="number"
                                            min="1"
                                            value={formData.quantity || ""}
                                            onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                                            className="h-12 bg-black/20 border-white/10 text-white focus-visible:ring-emerald-500/50 font-mono"
                                        />
                                    </div>
                                    {entry.type === "SALE" && (
                                        <div className="space-y-2">
                                            <Label className="uppercase text-[10px] tracking-widest text-slate-400">Price Per Unit (₦)</Label>
                                            <Input
                                                type="number"
                                                value={formData.sellingPricePerUnit || ""}
                                                onChange={(e) => setFormData({ ...formData, sellingPricePerUnit: Number(e.target.value) })}
                                                className="h-12 bg-black/20 border-white/10 text-white focus-visible:ring-emerald-500/50 font-mono"
                                            />
                                        </div>
                                    )}
                                    {entry.type === "PURCHASE" && (
                                        <div className="space-y-2">
                                            <Label className="uppercase text-[10px] tracking-widest text-slate-400">Cost Per Unit (₦)</Label>
                                            <Input
                                                type="number"
                                                value={formData.purchasePricePerUnit || ""}
                                                onChange={(e) => setFormData({ ...formData, purchasePricePerUnit: Number(e.target.value) })}
                                                className="h-12 bg-black/20 border-white/10 text-white focus-visible:ring-emerald-500/50 font-mono"
                                            />
                                        </div>
                                    )}
                                    {entry.type === "CREDIT_SUPPLY" && (
                                        <div className="space-y-2">
                                            <Label className="uppercase text-[10px] tracking-widest text-slate-400">Agreed Price (₦)</Label>
                                            <Input
                                                type="number"
                                                value={formData.agreedPricePerUnit || ""}
                                                onChange={(e) => setFormData({ ...formData, agreedPricePerUnit: Number(e.target.value) })}
                                                className="h-12 bg-black/20 border-white/10 text-white focus-visible:ring-emerald-500/50 font-mono"
                                            />
                                        </div>
                                    )}
                                </div>
                            </>
                        )}

                        {["CREDIT_SUPPLY", "COLLECTION"].includes(entry.type) && (
                            <div className="space-y-2">
                                <Label className="uppercase text-[10px] tracking-widest text-slate-400">Customer Name</Label>
                                <Input
                                    value={formData.customerName || ""}
                                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                                    className="h-12 bg-black/20 border-white/10 text-white focus-visible:ring-emerald-500/50"
                                />
                            </div>
                        )}

                        {entry.type === "EXPENSE" && (
                            <div className="space-y-2">
                                <Label className="uppercase text-[10px] tracking-widest text-slate-400">Description</Label>
                                <Input
                                    value={formData.description || ""}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="h-12 bg-black/20 border-white/10 text-white focus-visible:ring-emerald-500/50"
                                />
                            </div>
                        )}

                        {["EXPENSE", "COLLECTION", "LODGMENT"].includes(entry.type) && (
                            <div className="space-y-2">
                                <Label className="uppercase text-[10px] tracking-widest text-slate-400">Amount (₦)</Label>
                                <Input
                                    type="number"
                                    value={formData.amount || formData.amountCollected || ""}
                                    onChange={(e) => setFormData((prev: any) => ({
                                        ...prev,
                                        ...(entry?.type === "COLLECTION" ? { amountCollected: Number(e.target.value) } : { amount: Number(e.target.value) })
                                    }))}
                                    className="h-12 bg-black/20 border-white/10 text-white focus-visible:ring-emerald-500/50 font-mono"
                                />
                            </div>
                        )}

                        {entry.type === "PURCHASE" && (
                            <div className="space-y-2">
                                <Label className="uppercase text-[10px] tracking-widest text-slate-400">Supplier Name</Label>
                                <Input
                                    value={formData.supplierName || ""}
                                    onChange={(e) => setFormData({ ...formData, supplierName: e.target.value })}
                                    className="h-12 bg-black/20 border-white/10 text-white focus-visible:ring-emerald-500/50"
                                />
                            </div>
                        )}

                        {entry.type === "LODGMENT" && (
                            <div className="space-y-2">
                                <Label className="uppercase text-[10px] tracking-widest text-slate-400">Bank Name</Label>
                                <Input
                                    value={formData.bankName || ""}
                                    onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                                    className="h-12 bg-black/20 border-white/10 text-white focus-visible:ring-emerald-500/50"
                                />
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label className="uppercase text-[10px] tracking-widest text-slate-400">Notes (Optional)</Label>
                            <Input
                                value={formData.notes || ""}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                className="h-12 bg-black/20 border-white/10 text-white focus-visible:ring-emerald-500/50"
                                placeholder="Add context to this entry..."
                            />
                        </div>
                    </div>

                </div>

                {/* Panel Footer */}
                <div className="p-6 border-t border-white/5 bg-[#0f1525]">
                    <Button
                        onClick={onSave}
                        disabled={saving}
                        className="w-full h-12 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all"
                    >
                        {saving ? <Loader2 className="animate-spin w-5 h-5 mx-auto" /> : <><Save size={18} className="mr-2" /> Save Changes & Record to Audit Log</>}
                    </Button>
                </div>
            </div>
        </>
    );
}

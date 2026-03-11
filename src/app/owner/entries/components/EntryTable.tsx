"use client";

import { format } from "date-fns";
import { 
    CalendarDays, User, ArrowUpDown, ShoppingCart, 
    Briefcase, Receipt, PackageOpen, HandCoins, Landmark, 
    Edit2, Trash2 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Entry } from "./types";

const typeConfig = {
    SALE: { label: "Sale", icon: ShoppingCart, color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
    CREDIT_SUPPLY: { label: "Credit Supply", icon: Briefcase, color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20" },
    EXPENSE: { label: "Expense", icon: Receipt, color: "text-rose-500", bg: "bg-rose-500/10", border: "border-rose-500/20" },
    PURCHASE: { label: "Purchase", icon: PackageOpen, color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/20" },
    COLLECTION: { label: "Collection", icon: HandCoins, color: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/20" },
    LODGMENT: { label: "Lodgment", icon: Landmark, color: "text-indigo-500", bg: "bg-indigo-500/10", border: "border-indigo-500/20" }
};

interface EntryTableProps {
    entries: Entry[];
    onEditClick: (entry: Entry) => void;
    onDeleteClick: (id: string, type: string) => void;
}

export function EntryTable({ entries, onEditClick, onDeleteClick }: EntryTableProps) {
    const formatCurrency = (amount: number) => `₦${(amount || 0).toLocaleString()}`;

    return (
        <div className="overflow-x-auto rounded-2xl border border-white/5 bg-[#0a0f1d] scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
            <table className="w-full text-left min-w-[1000px]">
                <thead className="bg-[#0f1525] border-b border-white/10 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">
                    <tr>
                        <th className="px-6 py-4">Transaction Date</th>
                        <th className="px-6 py-4">Type</th>
                        <th className="px-6 py-4">Context / Details</th>
                        <th className="px-6 py-4 text-right">Amount</th>
                        <th className="px-6 py-4">Submitted By</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                    {entries.map((entry) => {
                        const config = typeConfig[entry.type];
                        const Icon = config.icon;
                        const isDeduction = entry.type === "EXPENSE" || entry.type === "PURCHASE";
                        const isDeleted = !!entry.deletedAt;

                        return (
                            <tr key={entry.id} className={`group hover:bg-white/[0.02] transition-colors ${isDeleted ? 'opacity-50 grayscale' : ''}`}>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <CalendarDays size={16} className="text-slate-600" />
                                        <div>
                                            <p className="font-bold text-white text-sm">{entry.date ? format(new Date(entry.date), "MMM do, yyyy") : "Unknown"}</p>
                                            <p className="text-[10px] font-medium text-slate-500 mt-0.5">{entry.date ? format(new Date(entry.date), "EEEE") : ""}</p>
                                        </div>
                                    </div>
                                </td>

                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <div className={`p-1.5 rounded-lg border ${config.bg} ${config.border} ${config.color}`}>
                                            <Icon size={14} />
                                        </div>
                                        <span className={`text-[10px] font-bold uppercase tracking-widest ${config.color}`}>
                                            {config.label}
                                        </span>
                                        {isDeleted && (
                                            <span className="ml-2 px-2 py-0.5 rounded-sm bg-rose-500/20 text-rose-500 font-bold text-[9px] uppercase tracking-wider">
                                                Deleted
                                            </span>
                                        )}
                                    </div>
                                </td>

                                <td className="px-6 py-4 max-w-xs">
                                    {entry.product && (
                                        <p className="font-bold text-slate-200 text-sm truncate">
                                            {entry.quantity ? `${entry.quantity} x ` : ''}{entry.product.replace('_', ' ')}
                                        </p>
                                    )}
                                    {entry.details && (
                                        <p className={`text-sm ${entry.product ? 'text-slate-400 mt-0.5' : 'font-bold text-slate-200'}`}>
                                            {entry.details}
                                        </p>
                                    )}
                                    {entry.notes && (
                                        <p className="text-[10px] text-slate-500 mt-1 italic truncate">
                                            "{entry.notes}"
                                        </p>
                                    )}
                                    {(!entry.product && !entry.details && !entry.notes) && (
                                        <span className="text-slate-600 text-xs italic">No context provided</span>
                                    )}
                                </td>

                                <td className="px-6 py-4 text-right">
                                    <p className={`font-black tracking-tight ${isDeduction ? 'text-white' : 'text-emerald-400'}`}>
                                        {isDeduction ? '-' : '+'}{formatCurrency(entry.amount)}
                                    </p>
                                </td>

                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                                            <User size={12} className="text-emerald-500" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-emerald-500">{entry.submittedBy}</p>
                                            <p className="text-[9px] font-mono text-slate-500 mt-0.5">
                                                {entry.submittedAt ? format(new Date(entry.submittedAt), "HH:mm") : "--:--"}
                                            </p>
                                        </div>
                                    </div>
                                </td>

                                <td className="px-6 py-4 text-right">
                                    {!isDeleted && (
                                        <div className="flex items-center justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => onEditClick(entry)}
                                                className="w-8 h-8 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 transition-colors"
                                            >
                                                <Edit2 size={14} />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => onDeleteClick(entry.id, entry.type)}
                                                className="w-8 h-8 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                                            >
                                                <Trash2 size={14} />
                                            </Button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}

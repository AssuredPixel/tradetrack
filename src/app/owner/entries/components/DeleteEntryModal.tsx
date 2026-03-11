"use client";

import { AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DeleteEntryModalProps {
    onConfirm: () => void;
    onCancel: () => void;
    isDeleting: boolean;
}

export function DeleteEntryModal({ onConfirm, onCancel, isDeleting }: DeleteEntryModalProps) {
    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[#0f1525] border border-rose-500/20 shadow-[0_0_40px_rgba(244,63,94,0.15)] rounded-3xl p-8 max-w-sm w-full animate-in zoom-in-95 duration-200">
                <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto mb-6">
                    <AlertCircle className="w-8 h-8 text-rose-500" />
                </div>
                <h3 className="text-xl font-black text-white text-center mb-2">Are you sure you want to delete this entry? This action will be logged.</h3>
                <p className="text-sm text-slate-400 text-center mb-8">
                    This action cannot be completely undone. It will be soft-deleted, removed from all financial totals, and recorded in the permanent audit log.
                </p>
                <div className="flex gap-4">
                    <Button
                        variant="outline"
                        className="flex-1 h-12 border-white/10 bg-transparent text-slate-300 hover:bg-white/5 hover:text-white"
                        onClick={onCancel}
                        disabled={isDeleting}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        className="flex-1 h-12 bg-rose-500 hover:bg-rose-600 text-white font-bold shadow-[0_0_15px_rgba(244,63,94,0.3)]"
                        onClick={onConfirm}
                        disabled={isDeleting}
                    >
                        {isDeleting ? <Loader2 className="animate-spin w-5 h-5 mx-auto" /> : "Confirm Delete"}
                    </Button>
                </div>
            </div>
        </div>
    );
}

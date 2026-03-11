"use client";

import { useState, useEffect } from "react";
import { Loader2, ArrowUpDown, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Entry } from "./components/types";
import { EntryTable } from "./components/EntryTable";
import { EntryFilters } from "./components/EntryFilters";
import { EditEntryPanel } from "./components/EditEntryPanel";
import { DeleteEntryModal } from "./components/DeleteEntryModal";

export default function OwnerEntriesPage() {
    const [loading, setLoading] = useState(true);
    const [entries, setEntries] = useState<Entry[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [users, setUsers] = useState<string[]>([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const [isFetchingMore, setIsFetchingMore] = useState(false);

    // Filters
    const [typeFilter, setTypeFilter] = useState("ALL");
    const [userFilter, setUserFilter] = useState("ALL");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [showDeleted, setShowDeleted] = useState(false);

    // Edit/Delete State
    const [editingEntry, setEditingEntry] = useState<Entry | null>(null);
    const [editFormData, setEditFormData] = useState<any>({});
    const [saving, setSaving] = useState(false);

    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [deletingType, setDeletingType] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleEditClick = (entry: Entry) => {
        setEditingEntry(entry);
        setEditFormData({
            ...entry.rawDoc,
            date: new Date(entry.rawDoc.date).toISOString().split('T')[0]
        });
    };

    const handleEditSave = async () => {
        if (!editingEntry) return;
        setSaving(true);
        try {
            const res = await fetch(`/api/owner/entries/${editingEntry.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...editFormData, type: editingEntry.type })
            });
            if (res.ok) {
                setEditingEntry(null);
                fetchEntries();
            } else {
                alert("Failed to update entry.");
            }
        } catch (error) {
            console.error("Error updating entry", error);
        } finally {
            setSaving(false);
        }
    };

    const confirmDelete = async () => {
        if (!deletingId || !deletingType) return;
        setIsDeleting(true);
        try {
            const res = await fetch(`/api/owner/entries/${deletingId}?type=${deletingType}`, {
                method: "DELETE"
            });
            if (res.ok) {
                setDeletingId(null);
                setDeletingType(null);
                fetchEntries();
            } else {
                alert("Failed to delete entry.");
            }
        } catch (error) {
            console.error("Error deleting entry", error);
        } finally {
            setIsDeleting(false);
        }
    };

    const fetchEntries = async (isLoadMore = false) => {
        if (isLoadMore) setIsFetchingMore(true);
        else {
            setLoading(true);
            setError(null);
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000);

        try {
            const params = new URLSearchParams();
            if (typeFilter !== "ALL") params.append("type", typeFilter);
            if (userFilter !== "ALL") params.append("user", userFilter);
            if (startDate) params.append("start", startDate);
            if (endDate) params.append("end", endDate);
            if (showDeleted) params.append("showDeleted", "true");

            const currentPage = isLoadMore ? page + 1 : 1;
            params.append("page", currentPage.toString());
            params.append("limit", "50");

            const res = await fetch(`/api/owner/entries?${params.toString()}`, {
                signal: controller.signal,
            });

            clearTimeout(timeoutId);

            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                setError(errData.error || `Request failed (${res.status})`);
                return;
            }

            const data = await res.json();
            if (isLoadMore) {
                setEntries(prev => [...prev, ...data.entries]);
                setPage(currentPage);
            } else {
                setEntries(data.entries ?? []);
                setPage(1);
            }
            setHasMore(data.hasMore ?? false);
            if (users.length === 0 && data.users) {
                setUsers(data.users);
            }
        } catch (err: any) {
            clearTimeout(timeoutId);
            if (err.name === "AbortError") {
                setError("Request timed out after 15 seconds. The server may be overloaded or the database connection is slow. Please try again.");
            } else {
                console.error("Failed to fetch entries", err);
                setError("Could not connect to the server. Please refresh the page.");
            }
        } finally {
            setLoading(false);
            setIsFetchingMore(false);
        }
    };

    useEffect(() => {
        fetchEntries();
    }, [typeFilter, userFilter, startDate, endDate, showDeleted]);

    const filteredEntries = entries.filter(entry => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        const amountStr = `₦${(entry.amount || 0).toLocaleString()}`;
        return (
            entry.details?.toLowerCase().includes(query) ||
            entry.product?.toLowerCase().includes(query) ||
            entry.notes?.toLowerCase().includes(query) ||
            amountStr.includes(query)
        );
    });

    return (
        <div className="max-w-[1400px] mx-auto space-y-8 pb-12">
            {/* Header */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-8 border-b border-white/5">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-slate-500/10 border border-slate-500/20 shadow-[0_0_15px_rgba(100,116,139,0.2)]">
                        <ArrowUpDown className="w-6 h-6 text-slate-400" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tight text-white mb-1">
                            Entry <span className="text-slate-400">Management</span>
                        </h1>
                        <p className="text-slate-400 text-sm font-medium">Global ledger of all system transactions</p>
                    </div>
                </div>
            </header>

            {/* Filters Bar */}
            <EntryFilters
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                typeFilter={typeFilter}
                setTypeFilter={setTypeFilter}
                userFilter={userFilter}
                setUserFilter={setUserFilter}
                startDate={startDate}
                setStartDate={setStartDate}
                endDate={endDate}
                setEndDate={setEndDate}
                users={users}
            />

            {/* Table Area */}
            {loading ? (
                <div className="flex flex-col items-center justify-center min-h-[40vh] space-y-4">
                    <Loader2 className="animate-spin w-10 h-10 text-emerald-500" />
                    <p className="text-slate-400 font-medium uppercase tracking-widest text-sm">Querying Global Ledger...</p>
                </div>
            ) : error ? (
                <div className="p-16 rounded-2xl border border-dashed border-rose-500/20 text-center bg-rose-500/[0.03]">
                    <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
                    <p className="text-rose-400 font-bold text-lg">Failed to load entries</p>
                    <p className="text-slate-500 text-sm mt-1 mb-6">{error}</p>
                    <Button onClick={() => fetchEntries()} variant="outline" className="border-rose-500/30 text-rose-400 hover:bg-rose-500/10">
                        Try Again
                    </Button>
                </div>
            ) : filteredEntries.length === 0 ? (
                <div className="p-16 rounded-2xl border border-dashed border-white/10 text-center bg-white/[0.02]">
                    <ArrowUpDown className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-300 font-bold text-lg">No entries found matching criteria</p>
                    <p className="text-slate-500 text-sm mt-1">Try adjusting your filters or search terms.</p>
                </div>
            ) : (
                <EntryTable
                    entries={filteredEntries}
                    onEditClick={handleEditClick}
                    onDeleteClick={(id, type) => { setDeletingId(id); setDeletingType(type); }}
                />
            )}

            {/* Show Deleted Toggle */}
            <div className="flex items-center justify-end pt-4 pb-8">
                <label className="flex items-center gap-3 cursor-pointer group">
                    <span className="text-sm font-medium text-slate-400 group-hover:text-slate-300 transition-colors">Show deleted entries</span>
                    <div className="relative inline-flex items-center">
                        <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={showDeleted}
                            onChange={(e) => setShowDeleted(e.target.checked)}
                        />
                        <div className="w-11 h-6 bg-black/40 border border-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-400 after:border-slate-400 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-500/20 peer-checked:border-rose-500/30 peer-checked:after:bg-rose-500"></div>
                    </div>
                </label>
            </div>

            {/* Load More Button */}
            {hasMore && (
                <div className="flex justify-center pt-8">
                    <Button
                        onClick={() => fetchEntries(true)}
                        disabled={isFetchingMore}
                        variant="outline"
                        className="h-12 px-8 rounded-xl border-white/10 bg-white/[0.02] text-slate-300 hover:text-white hover:bg-white/5 transition-all min-w-[200px]"
                    >
                        {isFetchingMore ? (
                            <>
                                <Loader2 className="animate-spin w-4 h-4 mr-2" />
                                Loading More...
                            </>
                        ) : (
                            "Load More Entries"
                        )}
                    </Button>
                </div>
            )}

            {/* Edit Panel */}
            {editingEntry && (
                <EditEntryPanel
                    entry={editingEntry}
                    formData={editFormData}
                    setFormData={setEditFormData}
                    onSave={handleEditSave}
                    onClose={() => setEditingEntry(null)}
                    saving={saving}
                />
            )}

            {/* Delete Confirmation Modal */}
            {deletingId && deletingType && (
                <DeleteEntryModal
                    onConfirm={confirmDelete}
                    onCancel={() => { setDeletingId(null); setDeletingType(null); }}
                    isDeleting={isDeleting}
                />
            )}
        </div>
    );
}

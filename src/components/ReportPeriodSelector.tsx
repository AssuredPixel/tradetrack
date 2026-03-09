"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Calendar as CalendarIcon, Filter, X } from "lucide-react";
import { format, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, getMonth, setMonth, parseISO } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export type PeriodType = "day" | "week" | "month" | "h1" | "h2" | "year" | "custom";

export default function ReportPeriodSelector() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Initialize state from URL or defaults
    const [periodType, setPeriodType] = useState<PeriodType>(
        (searchParams.get("type") as PeriodType) || "month"
    );
    const [dateValue, setDateValue] = useState(
        searchParams.get("date") || format(new Date(), "yyyy-MM-dd")
    );
    const [startDate, setStartDate] = useState(
        searchParams.get("from") || format(startOfMonth(new Date()), "yyyy-MM-dd")
    );
    const [endDate, setEndDate] = useState(
        searchParams.get("to") || format(endOfMonth(new Date()), "yyyy-MM-dd")
    );

    // Apply filters to URL
    const applyFilters = () => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("type", periodType);

        if (periodType === "custom") {
            params.set("from", startDate);
            params.set("to", endDate);
            params.delete("date");
        } else {
            params.set("date", dateValue);
            params.delete("from");
            params.delete("to");
        }

        router.push(`?${params.toString()}`);
    };

    // Calculate display text
    const getDisplayText = () => {
        try {
            const d = parseISO(dateValue);
            const now = new Date();

            if (periodType === "day") return `Day: ${format(d, "MMM do, yyyy")}`;
            if (periodType === "week") {
                const start = startOfWeek(d, { weekStartsOn: 1 });
                const end = endOfWeek(d, { weekStartsOn: 1 });
                return `Week: ${format(start, "MMM do")} - ${format(end, "MMM do, yyyy")}`;
            }
            if (periodType === "month") return `Month: ${format(d, "MMMM yyyy")}`;
            if (periodType === "h1") return `First Half (Jan - Jun) ${format(d, "yyyy")}`;
            if (periodType === "h2") return `Second Half (Jul - Dec) ${format(d, "yyyy")}`;
            if (periodType === "year") return `Full Year: ${format(d, "yyyy")}`;
            if (periodType === "custom") {
                if (!startDate || !endDate) return "Custom Range";
                return `${format(parseISO(startDate), "MMM do, yyyy")} - ${format(parseISO(endDate), "MMM do, yyyy")}`;
            }
            return "Select Period";
        } catch (e) {
            return "Select Period";
        }
    };

    return (
        <Card className="glass-panel border-white/5 mb-8">
            <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col xl:flex-row gap-6 items-start xl:items-center justify-between">

                    {/* Period Selection */}
                    <div className="flex-1 w-full space-y-4">
                        <div className="flex items-center gap-2 text-slate-400 mb-2">
                            <Filter size={16} />
                            <span className="text-xs font-bold uppercase tracking-widest">Filter By Period</span>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {(["day", "week", "month", "h1", "h2", "year", "custom"] as PeriodType[]).map((type) => (
                                <Button
                                    key={type}
                                    variant={periodType === type ? "default" : "outline"}
                                    onClick={() => setPeriodType(type)}
                                    className={`
                                        text-xs font-bold uppercase tracking-wider
                                        ${periodType === type
                                            ? "bg-emerald-500 hover:bg-emerald-600 text-white border-transparent"
                                            : "border-white/10 text-slate-400 hover:text-white hover:border-white/20 hover:bg-white/5"}
                                    `}
                                >
                                    {type === "h1" ? "First Half" : type === "h2" ? "Second Half" : type}
                                </Button>
                            ))}
                        </div>
                    </div>

                    {/* Date Inputs based on selection */}
                    <div className="flex flex-col sm:flex-row gap-4 w-full xl:w-auto items-end">
                        {periodType === "custom" ? (
                            <>
                                <div className="space-y-2 w-full sm:w-auto">
                                    <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">From Date</Label>
                                    <Input
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className="input-brand text-white h-10 border-white/10"
                                    />
                                </div>
                                <div className="space-y-2 w-full sm:w-auto">
                                    <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">To Date</Label>
                                    <Input
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        className="input-brand text-white h-10 border-white/10"
                                    />
                                </div>
                            </>
                        ) : (
                            <div className="space-y-2 w-full sm:w-auto">
                                <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                                    {periodType === "year" || periodType === "h1" || periodType === "h2" ? "Select Year" :
                                        periodType === "month" ? "Select Month" : "Select Date"}
                                </Label>
                                <Input
                                    type={periodType === "year" || periodType === "h1" || periodType === "h2" ? "number" :
                                        periodType === "month" ? "month" : "date"}
                                    value={
                                        periodType === "year" || periodType === "h1" || periodType === "h2"
                                            ? dateValue.substring(0, 4)
                                            : periodType === "month"
                                                ? dateValue.substring(0, 7)
                                                : dateValue
                                    }
                                    onChange={(e) => {
                                        if (periodType === "year" || periodType === "h1" || periodType === "h2") {
                                            setDateValue(`${e.target.value}-01-01`);
                                        } else if (periodType === "month") {
                                            setDateValue(`${e.target.value}-01`);
                                        } else {
                                            setDateValue(e.target.value);
                                        }
                                    }}
                                    className="input-brand text-white h-10 border-white/10 min-w-[180px]"
                                />
                            </div>
                        )}

                        <Button
                            onClick={applyFilters}
                            className="bg-blue-500 hover:bg-blue-600 text-white h-10 px-6 font-bold uppercase tracking-widest text-xs min-w-[140px]"
                        >
                            Apply Filter
                        </Button>
                    </div>
                </div>

                {/* Active Filter Display */}
                <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <CalendarIcon className="w-4 h-4 text-emerald-500" />
                        <span className="text-sm font-medium text-white">
                            Current View: <span className="text-emerald-400 font-bold ml-1">{getDisplayText()}</span>
                        </span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

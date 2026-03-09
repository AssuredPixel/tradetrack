import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, parseISO, setMonth, isValid } from "date-fns";

export function getDateRangeFromParams(searchParams: URLSearchParams): { start: Date, end: Date } {
    const type = searchParams.get("type") || "month";
    const dateStr = searchParams.get("date") || new Date().toISOString().split('T')[0];

    const baseDate = parseISO(dateStr);
    const safeDate = isValid(baseDate) ? baseDate : new Date();

    if (type === "custom") {
        const fromStr = searchParams.get("from");
        const toStr = searchParams.get("to");

        const start = fromStr ? parseISO(fromStr) : startOfMonth(new Date());
        const end = toStr ? parseISO(toStr) : endOfMonth(new Date());

        return {
            start: startOfDay(isValid(start) ? start : startOfMonth(new Date())),
            end: endOfDay(isValid(end) ? end : endOfMonth(new Date()))
        };
    }

    if (type === "day") {
        return { start: startOfDay(safeDate), end: endOfDay(safeDate) };
    }

    if (type === "week") {
        return {
            start: startOfDay(startOfWeek(safeDate, { weekStartsOn: 1 })),
            end: endOfDay(endOfWeek(safeDate, { weekStartsOn: 1 }))
        };
    }

    if (type === "month") {
        return { start: startOfDay(startOfMonth(safeDate)), end: endOfDay(endOfMonth(safeDate)) };
    }

    if (type === "h1") {
        const yearStart = startOfYear(safeDate);
        const juneEnd = endOfMonth(setMonth(yearStart, 5)); // 0-indexed, 5 is June
        return { start: startOfDay(yearStart), end: endOfDay(juneEnd) };
    }

    if (type === "h2") {
        const yearStart = startOfYear(safeDate);
        const julyStart = startOfMonth(setMonth(yearStart, 6)); // 0-indexed, 6 is July
        const yearEnd = endOfYear(safeDate);
        return { start: startOfDay(julyStart), end: endOfDay(yearEnd) };
    }

    if (type === "year") {
        return { start: startOfDay(startOfYear(safeDate)), end: endOfDay(endOfYear(safeDate)) };
    }

    // Default to month
    return { start: startOfDay(startOfMonth(safeDate)), end: endOfDay(endOfMonth(safeDate)) };
}

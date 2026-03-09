import AppLayoutShell from "@/components/AppLayoutShell";
import { Role } from "@/lib/types";

export default function SalesBoyLayout({ children }: { children: React.ReactNode }) {
    return <AppLayoutShell role={Role.SALESBOY}>{children}</AppLayoutShell>;
}

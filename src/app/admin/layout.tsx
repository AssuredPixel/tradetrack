import AppLayoutShell from "@/components/AppLayoutShell";
import { Role } from "@/lib/types";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return <AppLayoutShell role={Role.ADMIN}>{children}</AppLayoutShell>;
}

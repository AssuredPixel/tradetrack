import AppLayoutShell from "@/components/AppLayoutShell";
import { Role } from "@/lib/types";

export default function OwnerLayout({ children }: { children: React.ReactNode }) {
    return <AppLayoutShell role={Role.OWNER}>{children}</AppLayoutShell>;
}

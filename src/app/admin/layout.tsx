import AppLayoutShell from "@/components/AppLayoutShell";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return <AppLayoutShell role="ADMIN">{children}</AppLayoutShell>;
}

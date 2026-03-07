import AppLayoutShell from "@/components/AppLayoutShell";

export default function OwnerLayout({ children }: { children: React.ReactNode }) {
    return <AppLayoutShell role="OWNER">{children}</AppLayoutShell>;
}

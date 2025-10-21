import { Header } from "@/components/Header/Header";
import UsageMode from "@/components/UsageMode/UsageMode";

export default function ReservarLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <Header />
            <UsageMode />
            {children}
        </>
    )
}
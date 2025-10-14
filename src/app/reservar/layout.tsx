import { Header } from "@/components/Header/Header";

export default function ReservarLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
        <Header />
            {children}
        </>
    )
}
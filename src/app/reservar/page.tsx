import Link from "next/link";

export default function ReservarHome() {
  return (
    <div className="outline outline-red-500 h-screen flex flex-col items-center gap-4">
      <Link href="/reservar/lavadora">Reservar máquina de lavar</Link>
      <Link href="/reservar/secadora">Reservar secadora</Link>
    </div>
  );
}
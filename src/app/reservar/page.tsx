import Link from "next/link";

export default function ReservarHome() {
  return (
    <div>
      <Link href="/reservar/lavadora">Reservar máquina de lavar</Link>
      <Link href="/reservar/secadora">Reservar secadora</Link>
    </div>
  );
}
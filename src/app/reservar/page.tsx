"use client"

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";

export default function ReservarHome() {
  const [lavadoraLoading, setLavadoraLoading] = useState(true)
  const [secadoraLoading, setSecadoraLoading] = useState(true)

  return (
    <div className="h-screen flex flex-col items-center gap-4 p-4">
      <div className="flex flex-col items-center gap-4">
        <h2 className="font-bold text-green-wings">
          Reservar máquina de lavar
        </h2>

        {lavadoraLoading && (
          <Skeleton className="w-[200px] h-[200px]" />
        )}

        <Link
          href="/reservar/lavadora"
          className="font-bold text-green-wings"
        >
          <Image
            src="/coruja-lavadora.png"
            alt="Máquina de lavar"
            className={lavadoraLoading ? 'opacity-0': 'opacity-100'}
            width={200}
            height={200}
            onLoadingComplete={() => setLavadoraLoading(false)}
            placeholder="empty"
            priority
          />
        </Link>
      </div>

      <div className="flex flex-col items-center gap-4">
        <h2 className="font-bold text-green-wings">
          Reservar máquina de secar
        </h2>

        {secadoraLoading && (
          <Skeleton className="w-[200px] h-[200px]" />
        )}

        <Link
          href="/reservar/secadora"
          className="font-bold text-green-wings"
        >
          <Image
            src="/coruja-secadora.png"
            alt="Máquina de secar"
            className={secadoraLoading ? 'opacity-0': 'opacity-100'}
            width={200}
            height={200}
            onLoadingComplete={() => setSecadoraLoading(false)}
            placeholder="empty"
            priority
          />
        </Link>
      </div>
    </div>
  );
}
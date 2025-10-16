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
      <section
        aria-labelledby="lavadora-heading"
        className="flex flex-col items-center gap-4"
      >
        <h1 className="sr-only">Reservas de máquinas</h1>

        <h2 id="lavadora-heading" className="font-bold text-green-wings">
          Reservar máquina de lavar
        </h2>

        {lavadoraLoading && (
          <Skeleton className="w-[200px] h-[200px]" aria-hidden="true" />
        )}

        <Link
          href="/reservar/lavadora"
          className="font-bold text-green-wings"
        >
          <span className="sr-only">
            Ir para reservas da máquina de lavar:
          </span>

          <Image
            src="/coruja-lavadora.png"
            alt="Imagem de uma Coruja em forma de máquina de lavar"
            className={lavadoraLoading ? 'opacity-0': 'opacity-100'}
            width={200}
            height={200}
            onLoadingComplete={() => setLavadoraLoading(false)}
            placeholder="empty"
            priority
            decoding="async"
          />
        </Link>
      </section>

      <section
        aria-labelledby="secadora-heading"
        className="flex flex-col items-center gap-4"
      >
        <h2 id="secadora-heading" className="font-bold text-green-wings">
          Reservar máquina de secar
        </h2>

        {secadoraLoading && (
          <Skeleton className="w-[200px] h-[200px]" aria-hidden="true" />
        )}

        <Link
          href="/reservar/secadora"
          className="font-bold text-green-wings"
        >
          <span className="sr-only">
            Ir para reservas da máquina de secar:
          </span>
          
          <Image
            src="/coruja-secadora.png"
            alt="Imagem de uma Coruja em forma de máquina de secar"
            className={secadoraLoading ? 'opacity-0': 'opacity-100'}
            width={200}
            height={200}
            onLoadingComplete={() => setSecadoraLoading(false)}
            placeholder="empty"
            priority
            decoding="async"
          />
        </Link>
      </section>
    </div>
  );
}
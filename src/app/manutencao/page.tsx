import Image from "next/image";
import { WrenchIcon } from "lucide-react";

import coruja404 from "../../../public/coruja-404.png";

export default function ManutencaoPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 gap-6 text-center">
      <h1 className="text-2xl font-bold text-green-wings">
        Lavanderia das Corujas
      </h1>

      <Image
        src="/coruja-404.png"
        alt="Coruja em manutenção"
        width={200}
        height={200}
        placeholder="blur"
        blurDataURL={coruja404.blurDataURL}
        priority
      />

      <div className="flex flex-col items-center gap-3 max-w-sm">
        <div className="flex items-center gap-2">
          <WrenchIcon className="size-5" />
          <span className="text-lg font-semibold">Em manutenção</span>
        </div>

        <p className="text-muted-foreground">
          Estamos realizando melhorias no sistema. Voltaremos em breve!
        </p>
      </div>
    </div>
  );
}

import Link from "next/link";
import Image from "next/image";

import coruja404 from "../../public/coruja-404.png";

export default function NotFound() {
    return (
        <main className="flex flex-col items-center p-4 gap-4 h-screen">
            <Image
                src="/coruja-404.png"
                alt="Coruja confusa segurando 404"
                width={240}
                height={240}
                placeholder="blur"
                blurDataURL={coruja404.blurDataURL}
                priority
            />

            <div className="flex flex-col gap-4">
                <h1 className="text-2xl font-bold">Página não encontrada</h1>

                <p className="text-muted-foreground">
                    A página que você procura não existe ou foi movida.
                </p>

                <Link href="/" className="text-green-wings font-medium">
                    Voltar para a página inicial
                </Link>
            </div>
        </main>
    )
}
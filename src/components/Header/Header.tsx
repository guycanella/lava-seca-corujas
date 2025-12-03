"use client"

import { useUser } from "@/contexts/UserContext";
import { Skeleton } from "../ui/skeleton";
import { formatName } from "@/lib/utils";
import LogoutButton from "../LogoutButton/LogoutButton";
import { useLogoutButton } from "../LogoutButton/useLogoutButton";
import LoginButton from "../LoginButton/LoginButton";

export function Header() {
    const { data, isLoading } = useUser()
    const { isPending } = useLogoutButton()

    return (
        <header
            className="w-full flex justify-between items-center p-4 shadow-[var(--shadow-bottom)]"
            aria-busy={isPending ? true : undefined}
            aria-label="Cabecalho da página"
        >
            <div className="flex gap-4">
                <div>
                    <span className="font-bold">Nome: </span>
                    {
                        isLoading ? (
                            <>
                                <Skeleton className="w-24 h-4" />
                                <span className="sr-only">Carregando nome do usuário</span>
                            </>
                        ) : formatName(data?.name)
                    }
                </div>
                <div>
                    <span className="font-bold">Apto: </span>
                    {
                        isLoading ? (
                            <>
                                <Skeleton className="w-24 h-4" />
                                <span className="sr-only">Carregando número do apartamento</span>
                            </>
                        ) : data?.apartment_number
                    }
                </div>
            </div>
            <div className="flex flex-col gap-2">
                <LoginButton />

                <LogoutButton />
            </div>
        </header>
    )
}
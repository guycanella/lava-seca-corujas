"use client"

import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useUser } from "@/contexts/UserContext";
import { Button } from "../ui/button";
import { toast } from "sonner";
import { Loader2Icon } from "lucide-react";
import { Skeleton } from "../ui/skeleton";

async function logout() {
    const res = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
    });

    const json = await res.json();

    if (!res.ok) {
        throw new Error(json?.error || "Erro ao fazer logout");
    }

    return json;
}


export function Header() {
    const { data, isLoading } = useUser();
    const queryClient = useQueryClient();
    const router = useRouter();

    const { mutate: logoutMutation, isPending } = useMutation({
        mutationFn: logout,

        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ["user"] });
            queryClient.clear();
            router.replace("/");
        },

        onError: (e: Error) => {
            toast.error("Erro ao fazer logout", {
                description: e?.message || "Tente novamente",
            });
        },
    });

    const handleLogout = () => {
        logoutMutation();
    }

    const formatName = (name: string | undefined) => {
        if (!name) return "Usuário"
        
        return name.split(" ")[0];
    }

    return (
        <header
            className="w-full flex justify-between items-center p-4 shadow-[var(--shadow-bottom)]"
        >
            <div className="flex gap-4">
                <div>
                    <span className="font-bold">Nome: </span>
                    {isLoading ? <Skeleton className="w-24 h-4" /> : formatName(data?.name)}
                </div>
                <div>
                    <span className="font-bold">Apto: </span>
                    {isLoading ? <Skeleton className="w-24 h-4" /> : data?.apartment_number}
                </div>
            </div>
            <div>
                <Button onClick={handleLogout} disabled={isPending}>
                    {
                        isPending ? (
                            <>
                                <Loader2Icon className="size-4 animate-spin" />
                                Saindo...
                            </>
                        ) : "Logout"
                    }
                </Button>
            </div>
        </header>
    )
}
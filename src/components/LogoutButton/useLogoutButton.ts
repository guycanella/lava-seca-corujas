"use client"

import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useMutation, useQueryClient } from "@tanstack/react-query"

export const LOGOUT_MUTATION_KEY = ["logout"]

export function useLogoutButton() {
    const queryClient = useQueryClient()
    const router = useRouter()

    async function logout() {
        const res = await fetch("/api/auth/logout", {
            method: "POST",
            credentials: "include",
        });

        const json = await res.json()

        if (!res.ok) {
            throw new Error(json?.error || "Erro ao fazer logout")
        }

        return json
    }

    const { mutate: logoutMutation, isPending } = useMutation({
        mutationKey: LOGOUT_MUTATION_KEY,
        mutationFn: logout,

        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ["user"] })
            queryClient.clear()
            router.replace("/")
        },

        onError: (e: Error) => {
            toast.error("Erro ao fazer logout", {
                description: e?.message || "Tente novamente",
            });
        },
    })

    const handleLogout = () => {
        logoutMutation()
    }

    return {
        handleLogout,
        isPending,
    }
}
"use client"

import { createContext, useContextSelector } from 'use-context-selector';
import { useQuery } from "@tanstack/react-query";
import { UserResponseType, UserResponseSchema } from '@/types';

const UserContext = createContext<UserContextType | null>(null);

type UserContextType = {
    data: UserResponseType | undefined;
    isLoading: boolean;
    isError: boolean;
    error: Error | null;
}

async function fetchUser() {
    const res = await fetch("/api/user", {
        credentials: "include",
        cache: "no-store",
    });

    const json = await res.json();

    if (!res.ok) throw new Error(
        json?.error || "Erro ao carregar usuário"
    );

    const validated = UserResponseSchema.safeParse(json.data);
    if (!validated.success) throw new Error(validated.error.message);

    return validated.data;
}

export const  UserProvider = (
    { children }: { children: React.ReactNode }
) => {
    const {
        data,
        isLoading,
        isError,
        error
    } = useQuery<UserResponseType | undefined, Error>({
        queryKey: ["user"],
        queryFn: fetchUser,
        staleTime: 60_000,
        refetchOnWindowFocus: false,
        retry: 1,
    });

    return (
        <UserContext.Provider value={{ data, isLoading, isError, error }}>
            {children}
        </UserContext.Provider>
    );
}

export const useUser = () => {
    const context = useContextSelector(UserContext, (context) => context);

    if (!context) throw new Error("useUser must be used within a UserProvider");

    return context;
}
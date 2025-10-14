"use client"

import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LockIcon, Loader2Icon } from "lucide-react";

import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "../ui/form";

import { Button } from "../ui/button";
import { 
    InputGroup,
    InputGroupButton,
    InputGroupInput,
} from "../ui/input-group";

import { Input } from "../ui/input";
import { formSchema, FormValues, PayloadLoginType } from "@/types";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";

async function login(payload: PayloadLoginType) {
    const res = await fetch("/api/auth/login", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });

    const json = await res.json();

    if (!res.ok) {
        const msg = json?.error || "Erro ao fazer login";

        if (msg.toLowerCase().includes("invalid")) {
            throw new Error("E-mail ou senha inválidos.");
        }

        throw new Error(msg);
    }

    return json;
}

const LoginForm = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const queryClient = useQueryClient();

    const { mutate: loginMutation, isPending } = useMutation({
        mutationFn: (payload: PayloadLoginType) => login(payload),

        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ["user"] });
            toast.success("Login realizado com sucesso");
            router.replace(searchParams.get("redirectTo") || "/reservar");
        },

        onError: (e: Error) => {
            toast.error("Erro ao tentar fazer login", {
                description: e?.message || "Não foi possível entrar. Tente novamente.",
            })
        },
    });

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const onSubmit = async (values: FormValues) => {
        const payload = {
            email: values.email,
            password: values.password,
        }

        loginMutation(payload);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
                <FormItem>
                    <FormLabel
                        className="font-bold"
                    >
                        E-mail
                    </FormLabel>

                    <FormControl>
                        <Input placeholder="exemplo@gmail.com" {...field} />
                    </FormControl>

                    <FormMessage />
                </FormItem>
          )}
        />

        <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
                <FormItem>
                    <FormLabel
                        className="font-bold"
                    >
                        Senha
                    </FormLabel>

                    <FormControl>
                        <InputGroup>
                            <InputGroupInput
                                placeholder="Senha"
                                type="password"
                                {...field}
                            />

                            <InputGroupButton
                                variant="ghost"
                                aria-label="Senha"
                                size="icon-xs"
                            >
                                <LockIcon />
                            </InputGroupButton>
                        </InputGroup>
                    </FormControl>

                    <FormMessage />
                </FormItem>
          )}
        />

        <Button
            type="submit"
            disabled={isPending}
            className="w-full"
        >
            {
                isPending 
                    ? <><Loader2Icon className="size-4 animate-spin" /> Entrando...</> 
                    : "Entrar"
            }
        </Button>
      </form>
    </Form>
  );
};

export default LoginForm;
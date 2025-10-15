"use client"

import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LockIcon, Loader2Icon } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

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
import { useGlobalLiveRegion } from "@/contexts/GlobalLiveRegion";

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
    const { announce } = useGlobalLiveRegion();

    const { mutate: loginMutation, isPending } = useMutation({
        mutationFn: (payload: PayloadLoginType) => login(payload),

        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ["user"] });
            toast.success("Login realizado com sucesso");
            announce("Login realizado com sucesso.", "polite");
            router.replace(searchParams.get("redirectTo") || "/reservar");
        },

        onError: (e: Error) => {
            toast.error("Erro ao tentar fazer login", {
                description: e?.message || "Não foi possível entrar. Tente novamente.",
            })
            announce("Erro ao tentar fazer login", "assertive");
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
            email: values.email.trim().toLowerCase(),
            password: values.password,
        }

        loginMutation(payload);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-8"
        aria-busy={isPending || undefined}
        aria-label="Formulário de login"
        aria-describedby="form-status"
      >
        <div id="form-status" className="sr-only" aria-live="polite" />

        <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
                <FormItem>
                    <FormLabel
                        className="font-bold text-green-wings"
                    >
                        E-mail
                    </FormLabel>

                    <FormControl>
                        <Input
                            type="email"
                            autoComplete="email"
                            aria-invalid={!!form.formState.errors.email?.message}
                            placeholder="exemplo@gmail.com"
                            {...field}
                            aria-label="E-mail"
                            aria-describedby={
                                form.formState.errors.email?.message
                                    ? "email-error" 
                                    : undefined
                            }
                            inputMode="email"
                        />
                    </FormControl>

                    <FormMessage id="email-error" />
                </FormItem>
          )}
        />

        <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
                <FormItem>
                    <FormLabel
                        className="font-bold text-green-wings"
                    >
                        Senha
                    </FormLabel>

                    <FormControl>
                        <InputGroup>
                            <InputGroupInput
                                placeholder="Senha"
                                type="password"
                                autoComplete="current-password"
                                aria-invalid={!!form.formState.errors.password?.message}
                                aria-label="Senha"
                                aria-describedby={
                                    form.formState.errors.password?.message
                                        ? "password-error" 
                                        : undefined
                                }
                                {...field}
                            />

                            <InputGroupButton
                                variant="ghost"
                                aria-label="Símbolo de cadeado"
                                size="icon-xs"
                                tabIndex={-1}
                                aria-hidden="true"
                            >
                                <LockIcon aria-hidden="true" />
                            </InputGroupButton>
                        </InputGroup>
                    </FormControl>

                    <FormMessage id="password-error" />
                </FormItem>
          )}
        />

        <Button
            type="submit"
            disabled={isPending}
            className="w-full"
            aria-disabled={isPending}
            aria-label={isPending ? "Entrando..." : "Entrar"}
        >
            {
                isPending 
                    ? <><Loader2Icon className="size-4 animate-spin" aria-hidden="true" /> Entrando...</> 
                    : "Entrar"
            }
        </Button>
      </form>
    </Form>
  );
};

export default LoginForm;
"use client"

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LockIcon, Loader2Icon } from "lucide-react";
import { supabaseBrowser } from "@/lib/supabaseClient";
import { z } from "zod";

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

const formSchema = z.object({
  email: z.email({ message: "É necessário inserir um email válido" }),
  password: z.string().min(8, { message: "Informe sua senha" }),
});

type FormValues = z.infer<typeof formSchema>;

const LoginForm = () => {
    const [loading, setLoading] = useState(false);
    const [authError, setAuthError] = useState<string | null>(null);
    const router = useRouter();
    const searchParams = useSearchParams();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    setAuthError(null);
    setLoading(true);

    try {
        const supabase = supabaseBrowser();
        const { data, error } = await supabase.auth.signInWithPassword({
            email: values.email,
            password: values.password,
        });

        console.log({ data });

        if (error) {
            console.error(error);
            setAuthError("E-mail ou senha inválidos.");
            return;
        }

        const redirectTo = searchParams.get("redirectTo") || "/reservar";
        console.log('redirecting to:', redirectTo);
        router.replace(redirectTo);
    } catch(error) {
        console.error(error);
        setAuthError("Falha inesperada ao tentar autenticar. Tente novamente.");
    } finally {
        setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {authError && (
            <p className="text-sm text-red-600 mt-2" role="alert">
                {authError}
            </p>
        )}
        
        <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
                <FormItem>
                    <FormLabel>E-mail</FormLabel>

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
                    <FormLabel>Senha</FormLabel>

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

        <Button type="submit">
            {
                loading 
                    ? <><Loader2Icon className="size-4 animate-spin" /> Entrando...</> 
                    : "Entrar"
            }
        </Button>
      </form>
    </Form>
  );
};

export default LoginForm;
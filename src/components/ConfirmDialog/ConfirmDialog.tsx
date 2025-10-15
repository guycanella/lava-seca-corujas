import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2Icon } from "lucide-react";
import { format } from "date-fns";

import {
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"

import { useGlobalLiveRegion } from "@/contexts/GlobalLiveRegion";
import { useUser } from "@/contexts/UserContext";
import { MachineType } from "@/types";
import { Times, useReservations } from "@/app/reservar/[machine]/useReservations";
import { getMachineName } from "@/lib/utils";
import { Button } from "../ui/button";

type ConfirmDialogType = {
    type: MachineType;
    time: Times;
    dayISO: string;
    date: Date;
    onClose?: () => void;
}

type CreateReservationPayload = {
    start_time: string;
    equipment: "washer" | "dryer";
  };

function buildLocalTime(day: Date, hhmm: string) {
    const [h, m] = hhmm.split(":").map(Number);
    const d = new Date(day);
    d.setHours(h, m, 0, 0);

    return d;
}

async function createReservation(payload: CreateReservationPayload) {
    console.log("payload", payload);
    const res = await fetch("/api/reservations", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });

    const json = await res.json();

    if (!res.ok) {
        const msg = json?.error || "Erro ao criar reserva";

        if (res.status === 409 || msg.includes("duplicate key") || msg.includes("já existe")) {
            throw new Error("Esse horário acabou de ser reservado por outra pessoa.");
        }

        throw new Error(msg);
    }

    return json;
}

export function ConfirmDialog({
    type,
    time,
    dayISO,
    date,
    onClose,
}: ConfirmDialogType) {
    const { data } = useUser();
    const { machineEnum } = useReservations();
    const { announce } = useGlobalLiveRegion();

    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: (payload: CreateReservationPayload) => 
            createReservation(payload),

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["reservations", dayISO, machineEnum],
            });
            toast.success("Reserva criada com sucesso");
            announce("Reserva criada com sucesso.", "polite");
            onClose?.();
        },

        onError: (e: Error) => {
            toast.error("Erro ao tentar reservar", {
                description: `Erro: ${e?.message}`,
            })
            announce("Erro ao tentar reservar", "assertive");
            onClose?.();
        },
    });

    const handleMakeReservation = () => {
        const localTime = buildLocalTime(date, time);

        mutation.mutate({
            start_time: format(localTime, "yyyy-MM-dd HH:mm"),
            equipment: getMachineName(type),
        });
    }

    return (
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>
                    Confirmar reserva
                </AlertDialogTitle>

                <AlertDialogDescription>
                    Reservar a {type} para o apartamento{" "}
                    {data?.apartment_number} às {time}?
                </AlertDialogDescription>
            </AlertDialogHeader>
            
            <AlertDialogFooter>
                <AlertDialogCancel
                    type="button"
                    disabled={mutation.isPending}
                    aria-disabled={mutation.isPending}
                >
                    Cancelar
                </AlertDialogCancel>
                <Button
                    type="button"
                    onClick={handleMakeReservation}
                    disabled={mutation.isPending}
                    aria-disabled={mutation.isPending}
                    aria-label={
                        mutation.isPending 
                            ? "Reservando…" 
                            : "Confirmar reserva"
                    }
                >
                    {
                        mutation.isPending 
                            ? <>
                                <Loader2Icon
                                    className="size-4 animate-spin"
                                /> Reservando...
                              </> 
                            : "Reservar"
                    }
                </Button>
            </AlertDialogFooter>
        </AlertDialogContent>
    )
}
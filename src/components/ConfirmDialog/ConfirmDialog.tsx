import { Loader2Icon } from "lucide-react";
import { formatInTimeZone } from "date-fns-tz";
import { useQueryClient } from "@tanstack/react-query";

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
import { MachinePtBR, MachineEn } from "@/types";
import { Times, useReservations } from "@/app/reservar/[machine]/useReservations";
import { buildLocalTime, toggleMachineType } from "@/lib/utils";
import { Button } from "../ui/button";
import { Show } from "../Show/Show";
import { useConfirmDialog } from "./useConfirmDialog";

type ConfirmDialogType = {
    type: MachinePtBR;
    time: Times;
    dayISO: string;
    date: Date;
    onClose?: () => void;
    isOwnReservation: boolean;
    reservationId: string;
}

export function ConfirmDialog({
    type,
    time,
    dayISO,
    date,
    onClose,
    isOwnReservation,
    reservationId,
}: ConfirmDialogType) {
    const queryClient = useQueryClient();
    const { data } = useUser();
    const { machineEnum } = useReservations();
    const { announce } = useGlobalLiveRegion();
    const {
        createReservationMutation,
        cancelReservationMutation,
    } = useConfirmDialog({ queryClient });

    const handleMakeReservation = () => {
        const localTime = buildLocalTime(date, time);
        const startTimeUtcIso = formatInTimeZone(
            localTime, 
            "UTC", 
            "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'"
        );

        createReservationMutation.mutate({
            start_time: startTimeUtcIso,
            equipment: toggleMachineType(type) as MachineEn,
            dayISO,
            machineEnum,
            announce,
            onClose,
        });
    }

    const handleCancelReservation = (id: string) => {
        cancelReservationMutation.mutate({ id, announce, onClose });
    }

    return (
        <AlertDialogContent>
            <Show>
                <Show.When isTrue={isOwnReservation}>
                    <AlertDialogHeader>
                    <AlertDialogTitle>
                        Cancelar reserva
                    </AlertDialogTitle>

                    <AlertDialogDescription>
                        Cancelar a reserva da {type} para o apartamento{" "}
                        {data?.apartment_number} às {time}?
                    </AlertDialogDescription>
                </AlertDialogHeader>
                
                <AlertDialogFooter>
                    <AlertDialogCancel
                        type="button"
                        disabled={cancelReservationMutation.isPending}
                        aria-disabled={cancelReservationMutation.isPending}
                    >
                        Fechar
                    </AlertDialogCancel>
                    <Button
                        type="button"
                        onClick={() => handleCancelReservation(reservationId)}
                        disabled={cancelReservationMutation.isPending}
                        aria-disabled={cancelReservationMutation.isPending}
                        aria-label={
                            cancelReservationMutation.isPending 
                                ? "Cancelando…" 
                                : "Cancelar reserva"
                        }
                    >
                        {
                            cancelReservationMutation.isPending 
                                ? <>
                                    <Loader2Icon
                                        className="size-4 animate-spin"
                                    /> Cancelando...
                                </> 
                                : "Cancelar reserva"
                        }
                    </Button>
                </AlertDialogFooter>
                </Show.When>

                <Show.Else>
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
                        disabled={createReservationMutation.isPending}
                        aria-disabled={createReservationMutation.isPending}
                    >
                        Cancelar
                    </AlertDialogCancel>
                    <Button
                        type="button"
                        onClick={handleMakeReservation}
                        disabled={createReservationMutation.isPending}
                        aria-disabled={createReservationMutation.isPending}
                        aria-label={
                            createReservationMutation.isPending 
                                ? "Reservando…" 
                                : "Confirmar reserva"
                        }
                    >
                        {
                            createReservationMutation.isPending 
                                ? <>
                                    <Loader2Icon
                                        className="size-4 animate-spin"
                                    /> Reservando...
                                </> 
                                : "Reservar"
                        }
                    </Button>
                </AlertDialogFooter>
                </Show.Else>
            </Show>
        </AlertDialogContent>
    )
}
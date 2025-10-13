"use client"

import { useCallback, useMemo, useState } from "react";
import { format } from "date-fns";

import { ptBR } from "date-fns/locale";
import { useQuery } from "@tanstack/react-query";
import { AlertCircleIcon } from "lucide-react";

import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton"
import { Reservation } from "@/types";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ReservationTimes, Times, useReservations } from "./useReservations";
import { Show } from "@/components/Show/Show";
import { AlertDialog, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { ConfirmDialog } from "@/components/ConfirmDialog/ConfirmDialog";

export default function CalendarMachinePage() {
    const {
        TIMES,
        fetchReservations,
        startOfToday,
        machineEnum,
        maxDate,
        isSameMonth,
        type,
        renderNotFound
    } = useReservations();
    
    const [date, setDate] = useState<Date>(startOfToday);
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const dayISO = date.toISOString().slice(0,10)
    
    renderNotFound();

    const {
        data,
        isLoading,
        isError,
        error,
        isFetching,
        refetch
    } = useQuery<Reservation[]>({
        queryKey: ["reservations", dayISO, machineEnum],
        queryFn: () => fetchReservations(dayISO, machineEnum),
        staleTime: 30_000,
        refetchOnWindowFocus: false,
    })

    const reservations = useCallback(() => {
        if (!data) return [];

        if (data.length === 0) return [];

        return data.reduce((acc, reservation) => {
            const dateObj = new Date(reservation.start_time);
            const dateFormatted = format(dateObj, "HH:mm") as Times;
            const apartment = reservation.apartments.number;
            const user = reservation.users_app.name;
            
            const aux = {
                apartment: apartment,
                time: dateFormatted,
                user: user,
            }

            acc.push(aux);

            return acc;
        }, [] as ReservationTimes[])
    }, [data])

    const unavailableTimes = useMemo(() => {
        if (reservations().length === 0) return [];

        return reservations().map((reservation) => reservation.time);
    }, [reservations])

    console.log({ reservations: reservations() });

    return (
        <div className="flex flex-col min-h-screen items-center gap-4 p-4">
            <h2 className="text-2xl font-bold">Reservar {type}</h2>

            <Calendar
                mode="single"
                numberOfMonths={ isSameMonth ? 1 : 2 }
                hidden={{ after: maxDate }}
                selected={date}
                onSelect={setDate}
                disabled={{ before: startOfToday, after: maxDate }}
                locale={ptBR}
                required
                className="rounded-lg border shadow-sm"
            />

            <Show>
                <Show.When isTrue={isLoading || isFetching}>
                    <div className="grid grid-cols-2 gap-2 w-full">
                        {Array.from({ length: TIMES.length / 2 }).map(
                            (_, index) => (
                                <Skeleton
                                    key={`skeleton-${index}`}
                                    className="h-[50px] rounded-full"
                                />
                            )
                        )}
                    </div>
                </Show.When>

                <Show.When isTrue={isError}>
                    <div>
                        <Alert variant="destructive">
                            <AlertCircleIcon />
                            <AlertTitle>
                                Erro: {(error as Error)?.message}
                            </AlertTitle>
                            <AlertDescription>
                                <Button
                                    variant="outline"
                                    onClick={() => refetch()}
                                    size="lg"
                                >
                                    Tentar novamente
                                </Button>
                            </AlertDescription>
                        </Alert>
                    </div>
                </Show.When>

                <Show.Else>
                    <div className="grid grid-cols-2 gap-2 w-full">
                        {TIMES.map((time) => {
                            const isOccupied = unavailableTimes.includes(time);
                            const occupiedTime = reservations().find((reservation) => reservation.time === time);

                            return (
                                <AlertDialog key={time}>
                                    <AlertDialogTrigger asChild>
                                        <Button
                                            size="lg"
                                            className="h-auto py-1"
                                            disabled={isOccupied}
                                        >
                                            {time}<br />
                                            {isOccupied ? occupiedTime?.apartment : ""}
                                        </Button>
                                    </AlertDialogTrigger>

                                    <ConfirmDialog />
                                </AlertDialog>
                            )
                        })}
                    </div>
                </Show.Else>
            </Show>
        </div>
    );
}
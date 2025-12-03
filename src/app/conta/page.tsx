"use client"

import { useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { v4 as uuidv4 } from "uuid"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"

import { Button } from "@/components/ui/button"
import { ChartConfig, ChartContainer } from "@/components/ui/chart"
import { useStats } from "./useStats"
import { Show } from "@/components/Show/Show"
import { Skeleton } from "@/components/ui/skeleton"

const FIVE_MINUTES = 1000 * 60 * 5

const chartConfig = {
  bars: {
    color: "var(--green-wings",
  },
} satisfies ChartConfig

export default function ContaPage() {
    const router = useRouter()
    const { fetchStats, formatEventDate } = useStats()

    const { data, isLoading, isError, error} = useQuery({
        queryKey: ["stats"],
        queryFn: fetchStats,
        staleTime: FIVE_MINUTES,
        refetchOnWindowFocus: false,
    })

    const lastReservations = useMemo(() => {
        if (!data) return []

        return data.userLastReservations.map((reservation) => {
            return {
                id: uuidv4(),
                date: formatEventDate(reservation),
            }
        })
    }, [data, formatEventDate])

    const weekdayStats = useMemo(() => {
        if (!data) return []

        const daysOfWeek = [
            "Dom",
            "Seg",
            "Ter",
            "Qua",
            "Qui",
            "Sex",
            "Sáb",
        ]

        return data.weekdayStats.map((stat) => {
            return {
                id: uuidv4(),
                day: daysOfWeek[stat.dayOfWeek],
                count: stat.count,
            }
        })
    }, [data])

    console.log({ lastReservations, weekdayStats })

    return (
        <div className="p-4 flex flex-col gap-4">
            <h1 className="text-2xl font-bold">Minha Conta</h1>

            <section>
                <h2 className="font-bold">Últimos horários reservados:</h2>

                <Show>
                    <Show.When isTrue={isLoading}>
                        <div className="flex flex-col gap-2">
                            {Array.from({ length: 3 }).map((_, index) => (
                                <Skeleton key={index} className="h-[24px] rounded" />
                            ))}
                        </div>
                    </Show.When>

                    <Show.When isTrue={isError}>
                        <p>{error?.message}</p>
                    </Show.When>

                    <Show.Else>
                        <Show>
                            <Show.When isTrue={lastReservations.length === 0}>
                                <p>Nenhuma reserva disponível.</p>
                            </Show.When>

                            <Show.Else>
                                <ul>
                                    {lastReservations.map((reservation) => (
                                        <li key={reservation.id}>{reservation.date}</li>
                                    ))}
                                </ul>
                            </Show.Else>
                        </Show>
                    </Show.Else>
                </Show>
            </section>

            <section>
                <h2 className="font-bold">Estatística de uso das máquinas:</h2>
            </section>

            <Show>
                <Show.When isTrue={isLoading}>
                    <Skeleton className="h-[200px] w-full" />
                </Show.When>

                <Show.When isTrue={isError}>
                    <p>{error?.message}</p>
                </Show.When>

                <Show.Else>
                    <Show>
                        <Show.When isTrue={weekdayStats.length === 0}>
                            <p>Estatística das máquinasindisponível.</p>
                        </Show.When>

                        <Show.Else>
                            <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
                                <BarChart accessibilityLayer data={weekdayStats}>
                                    <CartesianGrid vertical={false} />
                                    <XAxis
                                        dataKey="day"
                                        tickMargin={10}
                                        axisLine={false}
                                        interval={0}
                                    />
                                    <Bar dataKey="count" fill="var(--green-wings)" radius={4} />
                                </BarChart>
                            </ChartContainer>
                        </Show.Else>
                    </Show>
                </Show.Else>
            </Show>

            <Button
                type="button"
                className="w-full max-w-sm cursor-pointer"
                onClick={() => router.back()}
                aria-label="Voltar para a página anterior"
            >
                Voltar
            </Button>
        </div>
    )
}
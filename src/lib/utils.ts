import { clsx, type ClassValue } from "clsx"
import { NextResponse } from "next/server";
import { twMerge } from "tailwind-merge"
import { z } from "zod";

import {
  MachinesType,
  ReservationType,
} from "@/types";
import { ReservationTimes, Times } from "@/app/reservar/[machine]/useReservations";
import { format } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function toggleMachineType(machine_type: MachinesType) {
  switch (machine_type) {
    case "lavadora": return "washer";
    case "secadora": return "dryer";
    case "washer":   return "lavadora";
    case "dryer":    return "secadora";
    default:         return machine_type;
  }
}

export function zodErrorResponse(err: z.ZodError, status: number = 400) {
  return NextResponse.json(
    {
      error: "ValidationError",
      details: err.issues.map((e) => ({
        path: e.path.join("."),
        message: e.message,
      })),
    },
    { status: status }
  );
}

export const formatName = (name: string | undefined) => {
  if (!name) return "Usuário"
  
  return name.split(" ")[0];
}

const MACHINES_PER_TYPE = 2;

export const mapReservationsToTimes = (
  data: ReservationType[] | undefined,
  user_id = ""
) => {
  if (!data) return [];

  if (data.length === 0) return [];

  return data.reduce((acc, reservation) => {
    const dateObj = new Date(reservation.start_time);
    const dateFormatted = format(dateObj, "HH:mm") as Times;
    const apartment = reservation.apartments.number;
    const user = reservation.users_app.name;
    const isOwn = reservation.user_id === user_id;

    const aux = {
      apartment,
      id: reservation.id,
      time: dateFormatted,
      user,
      isOwn,
      machine_id: reservation.machine_id,
      machine_label: reservation.machines.label,
    }

    acc.push(aux);

    return acc;
  }, [] as ReservationTimes[])
}

export const getUnavailableTimes = (reservations: ReservationTimes[]) => {
  if (reservations.length === 0) return [];

  const countByTime = reservations.reduce((acc, r) => {
    acc[r.time] = (acc[r.time] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(countByTime)
    .filter(([, count]) => count >= MACHINES_PER_TYPE)
    .map(([time]) => time);
}

export function isErrorWithStatus(
  error: unknown
): error is { status?: number; message: string } {
  if (typeof error === "object" && error !== null) {
    const err = error as Record<string, unknown>;

    return (
      typeof err.message === "string" &&
      (typeof err.status === "number" || typeof err.status === "undefined")
    );
  }
  
  return false;
}

export function buildLocalTime(day: Date, hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  const d = new Date(day);
  d.setHours(h, m, 0, 0);

  return d;
}
import { describe, it, expect } from "vitest";
import {
  mapReservationsToTimes,
  getUnavailableTimes,
} from "@/lib/utils";
import { ReservationType } from "@/types";
import { ReservationTimes } from "@/app/reservar/[machine]/useReservations";

describe("mapReservationsToTimes", () => {
    const mockData: ReservationType[] = [
        {
          id: "1",
          start_time: "2025-10-16T10:00:00",
          end_time: "2025-10-16T11:00:00",
          equipment: "washer",
          user_id: "user-1",
          apartment_id: "apt-1",
          apartments: { number: "101" },
          users_app: { name: "João Silva" },
          machine_id: "machine-1",
          machines: { id: "machine-1", label: "Lavadora 1" },
        } as ReservationType,
        {
          id: "2",
          start_time: "2025-10-16T14:00:00",
          end_time: "2025-10-16T15:00:00",
          equipment: "dryer",
          user_id: "user-2",
          apartment_id: "apt-2",
          apartments: { number: "202" },
          users_app: { name: "Maria Santos" },
          machine_id: "machine-2",
          machines: { id: "machine-2", label: "Secadora 1" },
        } as ReservationType,
    ];

  it("should return an empty array when data is undefined", () => {
    expect(
        mapReservationsToTimes(undefined as unknown as ReservationType[], "user-1")
    ).toEqual([]);
  });

  it("should return an empty array when data is null", () => {
    expect(
        mapReservationsToTimes(null as unknown as ReservationType[], "user-1")
    ).toEqual([]);
  });

  it("should return an empty array when data is an empty array", () => {
    expect(mapReservationsToTimes([], "user-1")).toEqual([]);
  });

  it("should map a reservation correctly", () => {
    const result = mapReservationsToTimes(mockData, "user-1");

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({
      apartment: "101",
      time: "10:00",
      user: "João Silva",
      id: "1",
      isOwn: true,
      machine_id: "machine-1",
      machine_label: "Lavadora 1",
    });
  });

  it("should map multiple reservations correctly", () => {
    const result = mapReservationsToTimes(mockData, "user-1");

    expect(result).toHaveLength(2);
    expect(result[0].apartment).toBe("101");
    expect(result[0].id).toBe("1");
    expect(result[0].isOwn).toBe(true);
    expect(result[1].apartment).toBe("202");
    expect(result[1].id).toBe("2");
    expect(result[1].isOwn).toBe(false);
    expect(result[1].apartment).toBe("202");
  });
});

describe("getUnavailableTimes", () => {
  it("should return an empty array when there are no reservations", () => {
    expect(getUnavailableTimes([])).toEqual([]);
  });

  it("should not mark a time as unavailable while a machine is still free", () => {
    const mockReservations: ReservationTimes[] = [
      { apartment: "101", time: "10:00", user: "João", id: "1", isOwn: true, machine_id: "m1", machine_label: "Lavadora 1" },
      { apartment: "202", time: "14:00", user: "Maria", id: "2", isOwn: false, machine_id: "m2", machine_label: "Lavadora 2" },
    ];

    expect(getUnavailableTimes(mockReservations)).toEqual([]);
  });

  it("should mark a time as unavailable once every machine is booked, without duplicates", () => {
    const mockReservations: ReservationTimes[] = [
      { apartment: "101", time: "10:00", user: "João", id: "1", isOwn: true, machine_id: "m1", machine_label: "Lavadora 1" },
      { apartment: "202", time: "10:00", user: "Maria", id: "2", isOwn: false, machine_id: "m2", machine_label: "Lavadora 2" },
      { apartment: "303", time: "14:00", user: "Ana", id: "3", isOwn: false, machine_id: "m1", machine_label: "Lavadora 1" },
    ];

    expect(getUnavailableTimes(mockReservations)).toEqual(["10:00"]);
  });
});

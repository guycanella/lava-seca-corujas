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
        } as ReservationType,
    ];

  it(" should return an empty array when data is undefined", () => {
    expect(
        mapReservationsToTimes(undefined as unknown as ReservationType[])
    ).toEqual([]);
  });

  it(" should return an empty array when data is null", () => {
    expect(
        mapReservationsToTimes(null as unknown as ReservationType[])
    ).toEqual([]);
  });

  it(" should return an empty array when data is an empty array", () => {
    expect(mapReservationsToTimes([])).toEqual([]);
  });

  it(" should map a reservation correctly", () => {
    const result = mapReservationsToTimes(mockData);

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({
      apartment: "101",
      time: "10:00",
      user: "João Silva",
    });
  });

  it(" should map multiple reservations correctly", () => {
    const result = mapReservationsToTimes(mockData);

    expect(result).toHaveLength(2);
    expect(result[0].apartment).toBe("101");
    expect(result[1].apartment).toBe("202");
  });
});

describe("getUnavailableTimes", () => {
  it(" should return an empty array when there are no reservations", () => {
    expect(getUnavailableTimes([])).toEqual([]);
  });

  it(" should return the occupied times correctly", () => {
    const mockReservations: ReservationTimes[] = [
      { apartment: "101", time: "10:00", user: "João" },
      { apartment: "202", time: "14:00", user: "Maria" },
    ];

    const result = getUnavailableTimes(mockReservations);

    expect(result).toEqual(["10:00", "14:00"]);
  });

  it(" should return only the times, without duplicates", () => {
    const mockReservations: ReservationTimes[] = [
      { apartment: "101", time: "10:00", user: "João" },
      { apartment: "202", time: "10:00", user: "Maria" },
    ];

    const result = getUnavailableTimes(mockReservations);

    expect(result).toEqual(["10:00", "10:00"]);
    expect(result).toHaveLength(2);
  });
});
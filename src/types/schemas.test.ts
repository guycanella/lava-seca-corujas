import { describe, it, expect } from "vitest";
import { BodyLoginSchema, CreateReservationSchema, formSchema, GetQuerySchema, payloadLoginSchema, ReservationSchema, ReservationType, UserResponseSchema } from "./index";

const validUUID = "550e8400-e29b-41d4-a716-446655440000";
const validDateISOWithZ = "2025-10-16T10:00:00Z";
const validDateISOLocal = "2025-10-16T10:00:00"; // sem Z
const validDateISO = "2025-10-16";

describe("formSchema (Login)", () => {
  it(" should accept valid email and password", () => {
    const result = formSchema.safeParse({
      email: "teste@example.com",
      password: "senha123",
    });

    expect(result.success).toBe(true);
  });

  it(" should reject invalid email", () => {
    const result = formSchema.safeParse({
      email: "email-invalido",
      password: "senha123",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain("email");
    }
  });

  it(" should reject empty email", () => {
    const result = formSchema.safeParse({
      email: "",
      password: "senha123",
    });

    expect(result.success).toBe(false);
  });

  it(" should reject empty password", () => {
    const result = formSchema.safeParse({
      email: "teste@example.com",
      password: "",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain("password");
    }
  });

  it(" should accept email with spaces (which will be trimmed)", () => {
    const result = formSchema.safeParse({
      email: "  teste@example.com  ",
      password: "senha123",
    });

    expect(result.success).toBe(true);
  });

  it(" should reject when missing fields", () => {
    const result = formSchema.safeParse({});

    expect(result.success).toBe(false);
  });
});

describe("payloadLoginSchema", () => {
    it(" should accept valid email and password", () => {
      const res = payloadLoginSchema.safeParse({
        email: "user@example.com",
        password: "abc12345",
      });

      expect(res.success).toBe(true);
    });
  
    it(" should reject invalid email", () => {
      const res = payloadLoginSchema.safeParse({
        email: "invalid-email",
        password: "abc12345",
      });

      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error.issues[0].path).toContain("email");
      }
    });
  
    it(" should reject when missing fields", () => {
      const res = payloadLoginSchema.safeParse({});

      expect(res.success).toBe(false);
    });
  });

  describe("GetQuerySchema", () => {
    it(" should accept day in YYYY-MM-DD format and valid machine", () => {
      const res = GetQuerySchema.safeParse({
        day: validDateISO,
        machine: "washer",
      });

      expect(res.success).toBe(true);
    });
  
    it(" should reject invalid day format", () => {
      for (const day of ["16-10-2025", "2025/10/16", "2025-1-1", "20251016", ""]) {
        const res = GetQuerySchema.safeParse({ day, machine: "washer" });

        expect(res.success).toBe(false);
      }
    });
  
    it(" should reject invalid machine", () => {
      const res = GetQuerySchema.safeParse({
        day: validDateISO,
        machine: "invalid",
      });

      expect(res.success).toBe(false);
    });
});

describe("CreateReservationSchema", () => {
    it(" should accept start_time ISO and valid equipment", () => {
      const res1 = CreateReservationSchema.safeParse({
        start_time: validDateISOWithZ,
        equipment: "dryer",
      });

      expect(res1.success).toBe(true);
  
      const res2 = CreateReservationSchema.safeParse({
        start_time: validDateISOLocal, // without Z
        equipment: "washer",
      });

      expect(res2.success).toBe(true);
    });
  
    it("should reject invalid start_time", () => {
      for (const dt of ["", "not-a-date", "2025-13-40T25:61:00", "2025-10-16"]) {
        const res = CreateReservationSchema.safeParse({
          start_time: dt,
          equipment: "washer",
        });

        expect(res.success).toBe(false);
      }
    });
  
    it(" should reject invalid equipment", () => {
      const res = CreateReservationSchema.safeParse({
        start_time: validDateISOLocal,
        equipment: "invalid",
      });

      expect(res.success).toBe(false);
    });
});

describe("ReservationSchema", () => {
    const base = {
      id: validUUID,
      user_id: validUUID,
      apartment_id: validUUID,
      equipment: "washer" as const,
      start_time: validDateISOLocal,
      end_time: validDateISOLocal,
      apartments: { number: "101" },
      users_app: { email: "user@example.com", name: "João" },
    };
  
    it(" should accept a valid reservation (ISO local)", () => {
      const res = ReservationSchema.safeParse(base);

      expect(res.success).toBe(true);
    });
  
    it(" should accept a valid reservation (ISO Z/UTC)", () => {
      const res = ReservationSchema.safeParse({
        ...base,
        start_time: validDateISOWithZ,
        end_time: validDateISOWithZ,
      });

      expect(res.success).toBe(true);
    });
  
    it(" should reject when IDs are not UUIDs", () => {
      const res = ReservationSchema.safeParse({
        ...base,
        id: "123",
        user_id: "abc",
        apartment_id: "xyz",
      });

      expect(res.success).toBe(false);
    });
  
    it(" should reject invalid equipment", () => {
      const res = ReservationSchema.safeParse({
        ...base,
        equipment: "invalid",
      });

      expect(res.success).toBe(false);
    });
  
    it(" should reject users_app without valid email", () => {
      const res = ReservationSchema.safeParse({
        ...base,
        users_app: { name: "João", email: "invalid" },
      });

      expect(res.success).toBe(false);
    });
  
    it(" should reject apartments without number", () => {
      const res = ReservationSchema.safeParse({
        ...base,
        apartments: {} as ReservationType["apartments"],
      });

      expect(res.success).toBe(false);
    });
});

describe("UserResponseSchema", () => {
    const base = {
      id: validUUID,
      name: "João",
      email: "user@example.com",
      apartment_id: validUUID,
      apartment_number: "101",
    };
  
    it(" should accept a valid user", () => {
      const res = UserResponseSchema.safeParse(base);

      expect(res.success).toBe(true);
    });
  
    it(" should reject invalid email", () => {
      const res = UserResponseSchema.safeParse({ ...base, email: "invalid" });

      expect(res.success).toBe(false);
    });
  
    it(" should reject invalid UUIDs", () => {
      const res = UserResponseSchema.safeParse({
        ...base,
        id: "1",
        apartment_id: "2",
      });

      expect(res.success).toBe(false);
    });
});

describe("BodyLoginSchema", () => {
    it(" should accept valid payload", () => {
      const res = BodyLoginSchema.safeParse({
        email: "user@example.com",
        password: "secret12",
      });

      expect(res.success).toBe(true);
    });
  
    it(" should reject payload with invalid email", () => {
      const res = BodyLoginSchema.safeParse({
        email: "invalid",
        password: "secret12",
      });
      expect(res.success).toBe(false);
    });
  
    it(" should reject payload when missing fields", () => {
      const res = BodyLoginSchema.safeParse({});

      expect(res.success).toBe(false);
    });
});
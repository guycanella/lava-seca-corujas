import { describe, it, expect } from "vitest";
import { formatName } from "@/lib/utils";

describe("formatName", () => {
    it("should return 'Usuário' when name is undefined", () => {
        expect(formatName(undefined)).toBe("Usuário");
    });

    it("should return 'Usuário' when name is an empty string", () => {
        expect(formatName("")).toBe("Usuário");
    });

    it("should return the first name when there are spaces", () => {
        expect(formatName("João Silva")).toBe("João");
    });

    it("should return the full name when there are no spaces", () => {
        expect(formatName("João")).toBe("João");
    });

    it("should handle multiple spaces", () => {
        expect(formatName("Maria da Silva Santos")).toBe("Maria");
    });
});
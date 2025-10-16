import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";
import React, { forwardRef, ImgHTMLAttributes } from "react";
import type { ImageProps, StaticImageData } from "next/image";

// Clean up the DOM after each test
afterEach(() => {
  cleanup();
});

type StaticRequire = {
  default: StaticImageData;
};

function normalizeSrc(src: ImageProps["src"]): string {
  if (typeof src === "string") return src;

  if (typeof src === "object" && "src" in src) {
    return (src as StaticImageData).src;
  }

  if (typeof src === "object" && "default" in src) {
    const def = (src as StaticRequire).default;
    return def.src;
  }

  return "";
}

vi.mock("next/image", () => {
  return {
    __esModule: true,
    default: forwardRef<HTMLImageElement, ImageProps>(function NextImageMock(
      { src, alt, width, height, loading, className, style, onClick, onLoad, onError, draggable, title },
      ref
    ) {
      const imgProps: ImgHTMLAttributes<HTMLImageElement> = {
        src: normalizeSrc(src),
        alt,
        width,
        height,
        loading,
        className,
        style,
        onClick,
        onLoad,
        onError,
        draggable,
        title,
      };

      return React.createElement("img", { ref, ...imgProps });
    }),
  };
});
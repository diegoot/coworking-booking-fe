"use client";

import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

/**
 * Overlay/dialog shell for the intercepted room detail route. Closes by
 * navigating back (`router.back()`), which drops the intercepted modal and
 * returns to whatever was rendered before (typically Home).
 */
export function ModalShell({ children }: { children: ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        router.back();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [router]);

  return (
    <div className="modal modal-open" onClick={() => router.back()}>
      <div
        role="dialog"
        aria-modal="true"
        className="modal-box relative max-w-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="Close"
          className="btn btn-sm btn-circle btn-ghost absolute right-4 top-4"
        >
          ✕
        </button>
        {children}
      </div>
      <div className="modal-backdrop" />
    </div>
  );
}

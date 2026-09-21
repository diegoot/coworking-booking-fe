"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import {
  createRoomRequestSchema,
  type CreateRoomRequest,
} from "@/lib/schemas/room";
import { createRoomAction } from "@/lib/actions/create-room";

/**
 * Unlike `BookingForm`, `createRoomAction` never redirects, so on
 * success this calls `router.refresh()` itself to pick up the newly
 * created room in the sibling `RoomsList`.
 *
 * `useForm`'s type params are split into input vs. output because
 * `createRoomRequestSchema` uses `z.coerce.number()`: the raw form
 * values RHF collects from `<input>` elements are strings (`z.input<...>`),
 * while the resolver's validated/transformed result — what actually
 * reaches `onSubmit` and `createRoomAction` — is real numbers
 * (`CreateRoomRequest`, i.e. `z.output<...>`). Without this split,
 * `zodResolver` and `useForm`'s generics disagree on whether
 * capacity/pricePerHour are strings or numbers.
 */
export function CreateRoomForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<
    z.input<typeof createRoomRequestSchema>,
    unknown,
    CreateRoomRequest
  >({
    resolver: zodResolver(createRoomRequestSchema),
  });

  async function onSubmit(values: CreateRoomRequest) {
    setServerError(null);
    const result = await createRoomAction(values);
    if (result?.error) {
      setServerError(result.error);
      return;
    }
    reset();
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-4"
      noValidate
    >
      <div className="flex flex-col gap-1">
        <label
          htmlFor="room-name"
          className="text-sm font-medium text-zinc-900 dark:text-zinc-50"
        >
          Name
        </label>
        <input
          id="room-name"
          type="text"
          aria-invalid={errors.name ? true : undefined}
          aria-describedby={errors.name ? "room-name-error" : undefined}
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:ring-zinc-100"
          {...register("name")}
        />
        {errors.name && (
          <p id="room-name-error" role="alert" className="text-sm text-red-600">
            {errors.name.message}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <label
          htmlFor="room-capacity"
          className="text-sm font-medium text-zinc-900 dark:text-zinc-50"
        >
          Capacity
        </label>
        <input
          id="room-capacity"
          type="number"
          min={1}
          step={1}
          aria-invalid={errors.capacity ? true : undefined}
          aria-describedby={errors.capacity ? "room-capacity-error" : undefined}
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:ring-zinc-100"
          {...register("capacity")}
        />
        {errors.capacity && (
          <p
            id="room-capacity-error"
            role="alert"
            className="text-sm text-red-600"
          >
            {errors.capacity.message}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <label
          htmlFor="room-price"
          className="text-sm font-medium text-zinc-900 dark:text-zinc-50"
        >
          Price per hour
        </label>
        <input
          id="room-price"
          type="number"
          min={0.01}
          step="0.01"
          aria-invalid={errors.pricePerHour ? true : undefined}
          aria-describedby={errors.pricePerHour ? "room-price-error" : undefined}
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:ring-zinc-100"
          {...register("pricePerHour")}
        />
        {errors.pricePerHour && (
          <p id="room-price-error" role="alert" className="text-sm text-red-600">
            {errors.pricePerHour.message}
          </p>
        )}
      </div>

      {serverError && (
        <p role="alert" className="text-sm text-red-600">
          {serverError}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-2 flex items-center justify-center gap-2 rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
      >
        {isSubmitting && (
          <svg
            className="h-4 w-4 animate-spin"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        )}
        {isSubmitting ? "Creating..." : "Create room"}
      </button>
    </form>
  );
}

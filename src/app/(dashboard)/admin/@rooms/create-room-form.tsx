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
      className="card card-border bg-base-100 shadow-sm flex w-full flex-col gap-4 p-4"
      noValidate
    >
      <div className="flex flex-col gap-1">
        <label htmlFor="room-name" className="label font-medium">
          Name
        </label>
        <input
          id="room-name"
          type="text"
          aria-invalid={errors.name ? true : undefined}
          aria-describedby={errors.name ? "room-name-error" : undefined}
          className="input w-full"
          {...register("name")}
        />
        {errors.name && (
          <p id="room-name-error" role="alert" className="text-sm text-error">
            {errors.name.message}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <label htmlFor="room-capacity" className="label font-medium">
            Capacity
          </label>
          <input
            id="room-capacity"
            type="number"
            min={1}
            step={1}
            aria-invalid={errors.capacity ? true : undefined}
            aria-describedby={
              errors.capacity ? "room-capacity-error" : undefined
            }
            className="input w-full"
            {...register("capacity")}
          />
          {errors.capacity && (
            <p
              id="room-capacity-error"
              role="alert"
              className="text-sm text-error"
            >
              {errors.capacity.message}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="room-price" className="label font-medium">
            Price per hour
          </label>
          <input
            id="room-price"
            type="number"
            min={0.01}
            step="0.01"
            aria-invalid={errors.pricePerHour ? true : undefined}
            aria-describedby={
              errors.pricePerHour ? "room-price-error" : undefined
            }
            className="input w-full"
            {...register("pricePerHour")}
          />
          {errors.pricePerHour && (
            <p
              id="room-price-error"
              role="alert"
              className="text-sm text-error"
            >
              {errors.pricePerHour.message}
            </p>
          )}
        </div>
      </div>

      {serverError && (
        <div role="alert" className="alert alert-error text-sm">
          <span>{serverError}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="btn btn-primary mt-2"
      >
        {isSubmitting && (
          <span className="loading loading-spinner loading-sm" aria-hidden="true" />
        )}
        {isSubmitting ? "Creating..." : "Create room"}
      </button>
    </form>
  );
}

"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  createBookingRequestSchema,
  type AvailabilitySlot,
  type CreateBookingRequest,
} from "@/lib/schemas/booking";
import { createBookingAction } from "@/lib/actions/create-booking";
import { formatSlotTime } from "@/lib/utils/format-slot-time";

/**
 * Client Component: lets the user pick one of today's free slots for
 * `roomId` and submits straight to `createBookingAction` (same pattern
 * as `register-form.tsx` — call the Server Action directly from
 * `onSubmit`, it redirects to `/bookings` itself on success and only
 * ever returns `{ error }` here). `roomId` is fixed from the prop and
 * never user-editable; selecting a slot fills `startTime`/`endTime`
 * with that slot's own ISO strings via `setValue` so the Zod resolver
 * validates the exact shape `createBookingAction` expects.
 */
export function BookingForm({
  roomId,
  slots,
}: {
  roomId: string;
  slots: AvailabilitySlot[];
}) {
  const [serverError, setServerError] = useState<string | null>(null);
  const freeSlots = slots.filter((slot) => slot.status === "free");

  const [selectedStart, setSelectedStart] = useState<string | null>(null);

  const {
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CreateBookingRequest>({
    resolver: zodResolver(createBookingRequestSchema),
    defaultValues: { roomId, startTime: "", endTime: "" },
  });

  function handleSlotSelect(slot: AvailabilitySlot) {
    setSelectedStart(slot.start);
    setValue("startTime", slot.start, { shouldValidate: true });
    setValue("endTime", slot.end, { shouldValidate: true });
  }

  async function onSubmit(values: CreateBookingRequest) {
    setServerError(null);
    const result = await createBookingAction(values);
    if (result?.error) {
      setServerError(result.error);
    }
  }

  const hasFreeSlots = freeSlots.length > 0;

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-4"
      noValidate
    >
      <fieldset
        className="flex flex-col gap-2"
        aria-describedby={errors.startTime ? "slot-error" : undefined}
      >
        <legend className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
          Select a time slot
        </legend>

        {hasFreeSlots ? (
          <div className="flex flex-col gap-2">
            {freeSlots.map((slot) => {
              const isSelected = selectedStart === slot.start;
              return (
                <label
                  key={slot.start}
                  className={`flex cursor-pointer items-center justify-between rounded-md border px-3 py-2 text-sm transition-colors focus-within:ring-2 focus-within:ring-zinc-900 dark:focus-within:ring-zinc-100 ${
                    isSelected
                      ? "border-zinc-900 bg-zinc-100 dark:border-zinc-100 dark:bg-zinc-800"
                      : "border-zinc-300 dark:border-zinc-700"
                  }`}
                >
                  <span className="text-zinc-900 dark:text-zinc-50">
                    {formatSlotTime(slot.start)} &ndash;{" "}
                    {formatSlotTime(slot.end)}
                  </span>
                  <input
                    type="radio"
                    name="slot"
                    value={slot.start}
                    checked={isSelected}
                    onChange={() => handleSlotSelect(slot)}
                    className="h-4 w-4 accent-zinc-900 dark:accent-zinc-100"
                  />
                </label>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            No available slots for this room today.
          </p>
        )}

        {errors.startTime && (
          <p id="slot-error" role="alert" className="text-sm text-red-600">
            Please select an available time slot
          </p>
        )}
      </fieldset>

      {serverError && (
        <p role="alert" className="text-sm text-red-600">
          {serverError}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting || !hasFreeSlots}
        className="mt-2 rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
      >
        {isSubmitting ? "Booking..." : "Book now"}
      </button>
    </form>
  );
}

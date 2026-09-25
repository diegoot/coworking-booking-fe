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
import { isPast } from "@/lib/utils/is-past";

/**
 * Client Component: shows every one of today's slots for `roomId` in a
 * single list — free slots are selectable, busy ones are shown grayed
 * out and disabled instead of hidden, so the user sees the whole day at
 * a glance without a separate read-only availability list next to the
 * form (that duplicated the same information twice). Submits straight
 * to `createBookingAction` (same pattern as `register-form.tsx` — call
 * the Server Action directly from `onSubmit`, it redirects to
 * `/bookings` itself on success and only ever returns `{ error }`
 * here). `roomId` is fixed from the prop and never user-editable;
 * selecting a slot fills `startTime`/`endTime` with that slot's own ISO
 * strings via `setValue` so the Zod resolver validates the exact shape
 * `createBookingAction` expects.
 *
 * `date` is always today (`getBusinessToday()`, see `page.tsx`) — there's
 * no date picker — so a `free` slot earlier today (nobody booked it, but
 * its time has already gone by) is still possible and, same as
 * `isBookingPast`, the backend's `createBooking` doesn't reject booking
 * into the past. A past slot is shown the same way a busy one is
 * (grayed out, disabled, no radio), just labeled "Past" instead of
 * "Busy" so it's clear why it can't be picked.
 */
export function BookingForm({
  roomId,
  date,
  slots,
}: {
  roomId: string;
  date: string;
  slots: AvailabilitySlot[];
}) {
  const [serverError, setServerError] = useState<string | null>(null);
  const hasSelectableSlots = slots.some(
    (slot) => slot.status === "free" && !isPast(slot.start)
  );

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

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-2"
      noValidate
    >
      <h2 id="slot-label" className="text-sm font-medium text-base-content">
        Select your time slot (date: {date})
      </h2>

      <fieldset
        className="card card-border bg-base-100 shadow-sm mb-2 flex flex-col gap-3 p-4"
        aria-labelledby="slot-label"
        aria-describedby={errors.startTime ? "slot-error" : undefined}
      >
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {slots.map((slot) => {
            const isPastSlot = isPast(slot.start);
            const isSelectable = slot.status === "free" && !isPastSlot;
            const isSelected = isSelectable && selectedStart === slot.start;
            return (
              <label
                key={slot.start}
                className={`flex flex-col items-center gap-1 rounded-xl border-2 px-2 py-3 text-center text-sm transition-colors ${
                  isSelectable
                    ? `cursor-pointer focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 ${
                        isSelected
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-base-300 hover:border-primary hover:bg-primary/5"
                      }`
                    : "cursor-not-allowed border-base-200 bg-base-200/50 opacity-60"
                }`}
              >
                <span className="font-medium">
                  {formatSlotTime(slot.start)}
                </span>
                <span
                  className={
                    isSelectable ? "text-xs opacity-80" : "text-xs opacity-70"
                  }
                >
                  {isSelectable
                    ? formatSlotTime(slot.end)
                    : isPastSlot
                      ? "Past"
                      : "Busy"}
                </span>
                {isSelectable && (
                  <input
                    type="radio"
                    name="slot"
                    value={slot.start}
                    checked={isSelected}
                    onChange={() => handleSlotSelect(slot)}
                    className="sr-only"
                  />
                )}
              </label>
            );
          })}
        </div>

        {errors.startTime && (
          <p id="slot-error" role="alert" className="text-sm text-error">
            Please select an available time slot
          </p>
        )}
      </fieldset>

      {serverError && (
        <div role="alert" className="alert alert-error text-sm">
          <span>{serverError}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting || !hasSelectableSlots}
        className="btn btn-primary mt-2"
      >
        {isSubmitting ? "Booking..." : "Book now"}
      </button>
    </form>
  );
}

import { Coffee, Monitor, PenTool, Snowflake, Sun, Wifi } from "lucide-react";

// Hardcoded: the backend doesn't model per-room amenities yet, so every
// room shows the same list.
const amenities = [
  { label: "Fast wifi", Icon: Wifi },
  { label: "Air conditioning", Icon: Snowflake },
  { label: "Coffee machine", Icon: Coffee },
  { label: "TV screen", Icon: Monitor },
  { label: "Whiteboard", Icon: PenTool },
  { label: "Natural light", Icon: Sun },
];

/**
 * Shared between the room detail page/modal and the "New booking" room
 * summary, so amenities show up wherever a room is being considered,
 * without a "View details" link that would take the user away from
 * whatever they were doing there.
 */
export function RoomAmenities() {
  return (
    <ul className="flex flex-wrap gap-x-6 gap-y-3">
      {amenities.map(({ label, Icon }) => (
        <li
          key={label}
          className="flex items-center gap-2 text-sm font-medium text-base-content"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Icon className="h-4 w-4" aria-hidden="true" />
          </span>
          {label}
        </li>
      ))}
    </ul>
  );
}

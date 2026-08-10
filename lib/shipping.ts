export type DispatchState = {
  sameDay: boolean;
  label: string;
  shortLabel: string;
  detail: string;
  cutoffLabel: string;
};

function londonParts(date: Date) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/London",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);

  const get = (type: string) =>
    parts.find((part) => part.type === type)?.value || "";

  return {
    weekday: get("weekday"),
    hour: Number(get("hour")),
    minute: Number(get("minute")),
  };
}

export function getDispatchState(now = new Date()): DispatchState {
  const { weekday, hour } = londonParts(now);
  const workingDay = ["Mon", "Tue", "Wed", "Thu", "Fri"].includes(weekday);
  const sameDay = workingDay && hour < 12;

  return sameDay
    ? {
        sameDay: true,
        label: "Same-day dispatch available",
        shortLabel: "Order by 12:00 · same-day dispatch",
        detail:
          "Free UK shipping. Orders completed before 12:00 UK time, Monday to Friday, are scheduled for same-day dispatch.",
        cutoffLabel: "12:00 UK",
      }
    : {
        sameDay: false,
        label: "Next working-day dispatch",
        shortLabel: "After 12:00 · next working-day dispatch",
        detail:
          "Free UK shipping. Orders completed after the 12:00 UK cutoff, or on weekends, are scheduled for the next working-day dispatch.",
        cutoffLabel: "12:00 UK",
      };
}

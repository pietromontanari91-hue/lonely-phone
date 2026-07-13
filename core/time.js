export function italianClockParts(now = new Date()) {
  return {
    time: now.toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" }),
    date: now.toLocaleDateString("it-IT", { weekday: "long", day: "numeric", month: "long" }),
  };
}

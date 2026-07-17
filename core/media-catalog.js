// Repository media catalog for VYBE and Travels.
// To add media after uploading to GitHub, copy one entry below and update id, label, path (and poster for videos).
// Paths are repository-root relative so they can be reused by apps/vybe/ and apps/travels/.

export const IMAGE_ASSETS = [
  { id: "vybe-positano", label: "01 Positano", path: "apps/vybe/assets/images/01_positano.webp" },
  { id: "vybe-couple-trip", label: "02 Couple trip", path: "apps/vybe/assets/images/02_couple_trip.webp" },
  { id: "vybe-girls-dinner", label: "03 Girls dinner", path: "apps/vybe/assets/images/03_girls_dinner.webp" },
  { id: "vybe-rooftop-aperitivo", label: "04 Rooftop aperitivo", path: "apps/vybe/assets/images/04_rooftop_aperitivo.webp" },
  { id: "vybe-airport", label: "06 Airport", path: "apps/vybe/assets/images/06_airport.webp" },
  { id: "vybe-roadtrip", label: "10 Roadtrip", path: "apps/vybe/assets/images/10_roadtrip.webp" },
  { id: "vybe-concerto", label: "Concerto", path: "apps/vybe/assets/images/concerto.webp" },
  { id: "vybe-v01-poster", label: "V01 poster", path: "apps/vybe/assets/videos/v01_poster.jpg" },
  { id: "vybe-v02-poster", label: "V02 poster", path: "apps/vybe/assets/videos/v02_poster.jpg" },
  { id: "vybe-v03-poster", label: "V03 poster", path: "apps/vybe/assets/videos/v03_poster.jpg" },
  { id: "travels-brighton-01", label: "Brighton 01", path: "apps/travels/assets/images/brighton_01.webp" },
  { id: "travels-brighton-02", label: "Brighton 02", path: "apps/travels/assets/images/brighton_02.webp" },
  { id: "travels-brighton-03", label: "Brighton 03", path: "apps/travels/assets/images/brighton_03.webp" },
  { id: "travels-lisbon-01", label: "Lisbon 01", path: "apps/travels/assets/images/lisbon_01.webp" },
  { id: "travels-lisbon-02", label: "Lisbon 02", path: "apps/travels/assets/images/lisbon_02.webp" },
  { id: "travels-lisbon-03", label: "Lisbon 03", path: "apps/travels/assets/images/lisbon_03.webp" },
  { id: "travels-mykonos-01", label: "Mykonos 01", path: "apps/travels/assets/images/mykonos_01.webp" },
  { id: "travels-mykonos-02", label: "Mykonos 02", path: "apps/travels/assets/images/mykonos_02.webp" },
  { id: "travels-mykonos-03", label: "Mykonos 03", path: "apps/travels/assets/images/mykonos_03.webp" },
  { id: "travels-santorini-01", label: "Santorini 01", path: "apps/travels/assets/images/santorini_01.webp" },
  { id: "travels-santorini-02", label: "Santorini 02", path: "apps/travels/assets/images/santorini_02.webp" },
  { id: "travels-santorini-03", label: "Santorini 03", path: "apps/travels/assets/images/santorini_03.webp" }
];

export const VIDEO_ASSETS = [
  { id: "vybe-concerto", label: "Concerto", path: "apps/vybe/assets/videos/concerto.mp4", poster: "apps/vybe/assets/images/concerto.webp" },
  { id: "vybe-concerto-vybe", label: "Concerto VYBE", path: "apps/vybe/assets/videos/concerto_vybe.mp4", poster: "apps/vybe/assets/images/concerto.webp" },
  { id: "vybe-v01-club", label: "V01 Club", path: "apps/vybe/assets/videos/v01_club.mp4", poster: "apps/vybe/assets/videos/v01_poster.jpg" },
  { id: "vybe-v02-beach-sunset", label: "V02 Beach sunset", path: "apps/vybe/assets/videos/v02_beach_sunset.mp4", poster: "apps/vybe/assets/videos/v02_poster.jpg" },
  { id: "vybe-v03-aperitivo-night", label: "V03 Aperitivo night", path: "apps/vybe/assets/videos/v03_aperitivo_night.mp4", poster: "apps/vybe/assets/videos/v03_poster.jpg" }
];

export function resolveMediaPath(path){
  if(!path || /^(https?:|data:|blob:|\/)/.test(path)) return path;
  if(path.startsWith("apps/")) return new URL(`../${path}`, import.meta.url).href;
  return path;
}

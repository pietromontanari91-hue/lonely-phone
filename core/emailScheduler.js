import { readJSON, writeJSON } from "./storage.js";

export const INBOX_STORAGE_KEY = "inboxEmails";
export const LOCK_STORAGE_KEY = "lockNotifications";
export const SCHEDULED_EMAILS_KEY = "scheduledEmails";
export const INTERLINEE_DELIVERED_KEY = "interlineeEmailDelivered";

export const interlineeEmail = {
  id: "interlinee",
  sender: "Interlinee Mag",
  subject: "Il nuovo numero è in edicola",
  preview: "Soli in città... o quasi — il nuovo numero editoriale di Interlinee Mag.",
  time: "ora",
  read: false,
  bodyHtml: `
    <figure class="newsletter-cover">
      <img src="../../assets/images/interlinee-mag-agosto-2026.webp" alt="Copertina di Interlinee Magazine agosto 2026, Soli o quasi">
    </figure>
    <p class="newsletter-deck">Il nuovo numero di Interlinee è in edicola.</p>
    <h2>Soli… o quasi?</h2>
    <p>Quando la città rallenta, impariamo a guardarla davvero.</p>
    <p>Questo numero di <strong>Interlinee Mag</strong> osserva la solitudine urbana senza drammatizzarla: la tratta come un materiale, una luce laterale, un rumore di fondo che a volte diventa compagnia.</p>
    <p>Dentro trovi un itinerario lento tra bar ancora vuoti, cinema di quartiere, portoni aperti per sbaglio e messaggi vocali ascoltati due volte prima di rispondere.</p>
    <p class="pullquote">La città non cura la solitudine: le dà una scenografia abbastanza grande da renderla abitabile.</p>
    <h3>In questo numero</h3>
    <ul>
      <li>Un editoriale sulla differenza tra essere soli e restare disponibili.</li>
      <li>Tre micro-recensioni di film da guardare quando fuori piove.</li>
      <li>Una rubrica fotografica fatta di finestre, citofoni e tavolini per uno.</li>
    </ul>
    <p>Conserva questa email come una pagina strappata da una rivista: non serve leggerla in fretta.</p>`
};

export function getScheduledEmails() {
  return readJSON(SCHEDULED_EMAILS_KEY, []);
}

export function scheduleEmailDelivery(email, delaySeconds) {
  const event = {
    id: `${email.id || crypto.randomUUID()}-${Date.now()}`,
    targetAt: Date.now() + delaySeconds * 1000,
    email: { ...email, time: "ora", read: false }
  };
  const pending = getScheduledEmails().filter((item) => item.email.id !== event.email.id);
  pending.push(event);
  writeJSON(SCHEDULED_EMAILS_KEY, pending);
  return event;
}

export function removeUndeliveredInterlineeSeed() {
  if (localStorage.getItem(INTERLINEE_DELIVERED_KEY) === "true") return;

  const inboxEmails = readJSON(INBOX_STORAGE_KEY, null);
  if (!inboxEmails) return;

  const migrated = inboxEmails.filter((email) => {
    const isCurrentInterlinee = email.id === "interlinee";
    const isLegacyInterlinee = email.sender === "Interlinee" || email.subject === "Interlinee — Numero Zero";
    return !isCurrentInterlinee && !isLegacyInterlinee;
  });

  if (migrated.length !== inboxEmails.length) writeJSON(INBOX_STORAGE_KEY, migrated);
}

function addEmailToInbox(email) {
  const inboxEmails = readJSON(INBOX_STORAGE_KEY, []);
  const delivered = { ...email, time: "ora", read: false };
  writeJSON(INBOX_STORAGE_KEY, [delivered, ...inboxEmails.filter((item) => item.id !== delivered.id)]);
  if (delivered.id === interlineeEmail.id) localStorage.setItem(INTERLINEE_DELIVERED_KEY, "true");
}

function addLockNotification(email) {
  const notifications = readJSON(LOCK_STORAGE_KEY, []);
  const href = `apps/inbox/index.html#${email.id}`;
  writeJSON(LOCK_STORAGE_KEY, [
    { app: "inbox", title: email.sender, text: email.subject, time: "ora", href },
    ...notifications.filter((notification) => notification.href !== href)
  ]);
}

export function processDueScheduledEmails(now = Date.now()) {
  removeUndeliveredInterlineeSeed();
  const pending = getScheduledEmails();
  const due = pending.filter((event) => event.targetAt <= now);
  if (!due.length) return [];

  const waiting = pending.filter((event) => event.targetAt > now);
  due.forEach((event) => {
    addEmailToInbox(event.email);
    addLockNotification(event.email);
  });
  writeJSON(SCHEDULED_EMAILS_KEY, waiting);
  return due.map((event) => event.email);
}


export function resetInterlineeDelivery() {
  const inboxEmails = readJSON(INBOX_STORAGE_KEY, []);
  writeJSON(INBOX_STORAGE_KEY, inboxEmails.filter((email) => email.id !== interlineeEmail.id));

  const notifications = readJSON(LOCK_STORAGE_KEY, []);
  writeJSON(LOCK_STORAGE_KEY, notifications.filter((notification) => notification.href !== "apps/inbox/index.html#interlinee"));

  const pending = getScheduledEmails();
  writeJSON(SCHEDULED_EMAILS_KEY, pending.filter((event) => event.email.id !== interlineeEmail.id));

  localStorage.removeItem(INTERLINEE_DELIVERED_KEY);
}

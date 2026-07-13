import { readJSON, writeJSON } from "../../core/storage.js";
import { INBOX_STORAGE_KEY, interlineeEmail, removeUndeliveredInterlineeSeed, scheduleEmailDelivery } from "../../core/emailScheduler.js";
import { INBOX_EMAILS_CHANGED_EVENT, startSchedulerRunner } from "../../core/schedulerRunner.js";

const $ = (id) => document.getElementById(id);
const STORAGE_KEY = INBOX_STORAGE_KEY;
let currentEmailId = null;

const starterEmails = [
  {
    id: "pandrero-note",
    sender: "Pandrero Desk",
    subject: "Nota editoriale",
    preview: "La palette neutra è pronta: paper, dust blue, slate e charcoal.",
    time: "09:12",
    read: false,
    bodyHtml: "<p>Abbiamo preparato un linguaggio visivo più quieto e narrativo per Pandrero OS: superfici paper, accenti dust blue, testo slate e profondità charcoal.</p>"
  },
  {
    id: "martina-appunti",
    sender: "Martina",
    subject: "Appunti per stasera",
    preview: "Ho segnato due luoghi piccoli, entrambi con tavoli vicino alla finestra.",
    time: "08:47",
    read: true,
    bodyHtml: "<p>Ho segnato due luoghi piccoli, entrambi con tavoli vicino alla finestra. Scegli tu quale sembra meno rumoroso.</p>"
  }
];

removeUndeliveredInterlineeSeed();
let emails = normalizeEmails(readJSON(STORAGE_KEY, starterEmails));

function normalizeEmails(items) {
  return items.map((email, index) => ({
    ...email,
    id: email.id || `mail-${index}-${Date.now()}`,
    read: Boolean(email.read),
    bodyHtml: email.bodyHtml || `<p>${escapeHTML(email.preview || "")}</p>`
  }));
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[char]));
}

function filteredEmails() {
  const term = $("searchInput").value.trim().toLowerCase();
  if (!term) return emails;
  return emails.filter((email) => [email.sender, email.subject, email.preview].some((value) => String(value).toLowerCase().includes(term)));
}

function renderEmails(animatedIds = new Set(), persist = true) {
  const visibleEmails = filteredEmails();
  $("mailList").innerHTML = visibleEmails.length ? visibleEmails.map((email) => `
    <button class="mail-item ${email.read ? "" : "unread"} ${animatedIds.has(email.id) ? "new-mail" : ""}" data-id="${email.id}">
      <div class="mail-meta"><span>${escapeHTML(email.sender)}</span><time>${escapeHTML(email.time)}</time></div>
      <h3>${escapeHTML(email.subject)}</h3>
      <p>${escapeHTML(email.preview)}</p>
    </button>`).join("") : '<p class="empty">Nessuna email trovata.</p>';
  if (persist) writeJSON(STORAGE_KEY, emails);
}

function showList() {
  currentEmailId = null;
  $("detailView").hidden = true;
  $("listView").hidden = false;
  if (location.hash) history.replaceState(null, "", location.pathname);
}

function refreshDetail(email) {
  $("detailSender").textContent = email.sender;
  $("detailSubject").textContent = email.subject;
  $("detailTime").textContent = email.time;
  $("detailReadState").textContent = email.read ? "Letta" : "Non letta";
  $("detailBody").innerHTML = email.bodyHtml;
}

function openEmail(id) {
  const email = emails.find((item) => item.id === id);
  if (!email) return;
  currentEmailId = id;
  email.read = true;
  refreshDetail(email);
  $("listView").hidden = true;
  $("detailView").hidden = false;
  writeJSON(STORAGE_KEY, emails);
  renderEmails();
  if (location.hash !== `#${id}`) history.replaceState(null, "", `#${id}`);
}

function buildEmailFromForm() {
  const preview = $("preview").value.trim() || "Nuova email programmata.";
  return {
    id: crypto.randomUUID(),
    sender: $("sender").value.trim() || "Senza mittente",
    subject: $("subject").value.trim() || "Senza oggetto",
    preview,
    time: "ora",
    read: false,
    bodyHtml: `<p>${escapeHTML(preview)}</p>`
  };
}

function scheduleEmail(email, seconds) {
  const event = scheduleEmailDelivery(email, seconds);
  $("scheduleStatus").value = `Email programmata per ${new Date(event.targetAt).toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}`;
}

$("directorOpen").onclick = () => $("directorPanel").classList.add("open");
$("directorClose").onclick = () => $("directorPanel").classList.remove("open");
$("directorForm").onsubmit = (event) => {
  event.preventDefault();
  const email = buildEmailFromForm();
  const seconds = Number($("delay").value);
  $("directorPanel").classList.remove("open");
  scheduleEmail(email, seconds);
};
$("scheduleInterlinee").onclick = () => {
  const seconds = Number($("delay").value);
  scheduleEmail(interlineeEmail, seconds);
};
$("mailList").onclick = (event) => {
  const item = event.target.closest(".mail-item");
  if (item) openEmail(item.dataset.id);
};
$("backToList").onclick = showList;
$("searchInput").oninput = () => renderEmails(new Set(), false);
$("markAllRead").onclick = () => {
  emails = emails.map((email) => ({ ...email, read: true }));
  renderEmails();
};
window.addEventListener("hashchange", () => {
  const id = location.hash.slice(1);
  if (id) openEmail(id);
});

function syncEmailsFromStorage(nextEmails) {
  const previousIds = new Set(emails.map((email) => email.id));
  emails = normalizeEmails(nextEmails);
  const insertedIds = new Set(emails.filter((email) => !previousIds.has(email.id)).map((email) => email.id));
  renderEmails(insertedIds, false);

  if (currentEmailId) {
    const currentEmail = emails.find((email) => email.id === currentEmailId);
    if (currentEmail) refreshDetail(currentEmail);
  }
}

window.addEventListener(INBOX_EMAILS_CHANGED_EVENT, (event) => {
  syncEmailsFromStorage(event.detail?.emails || readJSON(STORAGE_KEY, starterEmails));
});

window.addEventListener("storage", (event) => {
  if (event.key !== STORAGE_KEY) return;
  if (!event.newValue) {
    syncEmailsFromStorage(readJSON(STORAGE_KEY, starterEmails));
    return;
  }
  try {
    syncEmailsFromStorage(JSON.parse(event.newValue));
  } catch {
    syncEmailsFromStorage(readJSON(STORAGE_KEY, starterEmails));
  }
});

startSchedulerRunner();

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("../../sw.js");
}

renderEmails();
const initialId = location.hash.slice(1);
if (initialId) openEmail(initialId);

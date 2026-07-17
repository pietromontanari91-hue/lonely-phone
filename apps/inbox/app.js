import { readJSON, writeJSON } from "../../core/storage.js";
import { INBOX_STORAGE_KEY, interlineeEmail, removeUndeliveredInterlineeSeed, scheduleEmailDelivery } from "../../core/emailScheduler.js";
import { INBOX_EMAILS_CHANGED_EVENT, startSchedulerRunner } from "../../core/schedulerRunner.js";
import { INBOX_STARTER_EMAILS } from "./content.js";

const $ = (id) => document.getElementById(id);
const STORAGE_KEY = INBOX_STORAGE_KEY;
let currentEmailId = null;

const cloneData = (value) => JSON.parse(JSON.stringify(value));
const starterEmails = cloneData(INBOX_STARTER_EMAILS);

removeUndeliveredInterlineeSeed();
let emails = normalizeEmails(readJSON(STORAGE_KEY, starterEmails));

function normalizeEmails(items) {
  return items.map((email, index) => ({
    ...email,
    id: email.id || `mail-${index}-${Date.now()}`,
    read: Boolean(email.read),
    bodyHtml: email.bodyHtml || paragraphsToHtml(email.bodyParagraphs || [email.preview || ""])
  }));
}

function escapeHTML(value) {
  return String(value).replace(/[&<>\"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[char]));
}

function paragraphsToHtml(paragraphs) {
  return paragraphs.map((paragraph) => `<p>${escapeHTML(paragraph)}</p>`).join("");
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
  const bodyParagraphs = $("composeBody").value.split(/\n+/).map((line) => line.trim()).filter(Boolean);
  return normalizeEmails([{
    id: crypto.randomUUID(),
    sender: $("sender").value.trim() || "Senza mittente",
    subject: $("subject").value.trim() || "Senza oggetto",
    preview,
    time: $("composeTime").value.trim() || "ora",
    read: $("composeRead").value === "true",
    bodyParagraphs: bodyParagraphs.length ? bodyParagraphs : [preview]
  }])[0];
}

function scheduleEmail(email, seconds) {
  const event = scheduleEmailDelivery(email, seconds);
  $("scheduleStatus").value = `Email programmata per ${new Date(event.targetAt).toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}`;
}

$("directorOpen").onclick = () => $("directorPanel").classList.add("open");
$("composeOpen").onclick = () => $("directorPanel").classList.add("open");
$("directorClose").onclick = () => $("directorPanel").classList.remove("open");
$("directorForm").onsubmit = (event) => {
  event.preventDefault();
  const email = buildEmailFromForm();
  const seconds = Number($("delay").value);
  $("directorPanel").classList.remove("open");
  scheduleEmail(email, seconds);
};
$("addEmailNow").onclick = () => {
  const email = buildEmailFromForm();
  emails.unshift(email);
  renderEmails(new Set([email.id]));
  $("directorPanel").classList.remove("open");
};
$("resetInboxContent").onclick = () => {
  emails = normalizeEmails(cloneData(INBOX_STARTER_EMAILS));
  writeJSON(STORAGE_KEY, emails);
  renderEmails(new Set(), false);
  showList();
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

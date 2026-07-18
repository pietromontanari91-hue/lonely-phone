const KEY = "planCalendarData";
const IT = ["Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno", "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"];
const WD = ["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"];
const $ = (id) => document.getElementById(id);
const clone = (obj) => JSON.parse(JSON.stringify(obj));
let state = load();
let logoClicks = [];
let selectedEvent = null;

function localIsoDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function load() {
  const init = clone(window.PLAN_INITIAL_DATA);
  try {
    const saved = JSON.parse(localStorage.getItem(KEY));
    if (saved) return { ...init, ...saved, categories: saved.categories || init.categories, events: saved.events || init.events };
  } catch {}
  return init;
}

function save() {
  localStorage.setItem(KEY, JSON.stringify({ events: state.events, categories: state.categories, currentDate: state.currentDate, currentView: state.currentView }));
}

function d(value) { return new Date(value.length === 10 ? `${value}T00:00` : value); }
function datePart(value) { return value.slice(0, 10); }
function cat(id) { return state.categories.find((c) => c.id === id) || state.categories[0]; }
function visible(event) { const category = cat(event.category); return category && category.visible !== false; }
function sameDay(a, b) { return localIsoDate(a) === localIsoDate(b); }
function fmtDate(value) { return d(value).toLocaleDateString("it-IT", { weekday: "long", day: "numeric", month: "long", year: "numeric" }); }
function fmtTime(value) { return value && value.includes("T") ? value.slice(11, 16) : "—"; }
function monthStart(date) { return new Date(date.getFullYear(), date.getMonth(), 1); }
function addDays(date, count) { const next = new Date(date); next.setDate(next.getDate() + count); return next; }
function addMonths(date, count) { const next = new Date(date); next.setMonth(next.getMonth() + count); return next; }
function monday(date) { const next = new Date(date); next.setDate(next.getDate() - ((next.getDay() + 6) % 7)); return new Date(next.getFullYear(), next.getMonth(), next.getDate()); }
function displayDate(value) { return localIsoDate(value).split("-").reverse().join("/"); }
function defaultDateTime(day, time) { return `${day}T${time}`; }
function normalizeDateTime(value, time) { return value.includes("T") ? value : defaultDateTime(value, time); }

function eventOccursOnDay(event, dayStart) {
  const nextDay = addDays(dayStart, 1);
  if (event.allDay) {
    return d(event.start) <= dayStart && d(event.end) >= dayStart;
  }
  return d(event.start) < nextDay && d(event.end) > dayStart;
}

function eventsForDay(day) {
  return state.events.filter((event) => visible(event) && eventOccursOnDay(event, day)).sort((a, b) => a.start.localeCompare(b.start));
}

function render() {
  save();
  const cur = d(state.currentDate);
  const start = monday(cur);
  $("periodTitle").textContent = state.currentView === "month" ? `${IT[cur.getMonth()]} ${cur.getFullYear()}` : `${displayDate(start)} – ${displayDate(addDays(start, 6))}`;
  $("monthViewButton").classList.toggle("active", state.currentView === "month");
  $("weekViewButton").classList.toggle("active", state.currentView === "week");
  renderMini();
  renderCats();
  state.currentView === "month" ? renderMonth() : renderWeek();
}

function renderCats() {
  const box = $("categoryList");
  box.innerHTML = "";
  state.categories.forEach((category) => {
    const label = document.createElement("label");
    const input = document.createElement("input");
    const dot = document.createElement("span");
    label.className = "category-item";
    input.type = "checkbox";
    input.checked = category.visible !== false;
    dot.className = "dot";
    dot.style.background = category.color;
    input.onchange = (event) => { category.visible = event.target.checked; render(); };
    label.append(input, dot, document.createTextNode(category.name));
    box.append(label);
  });
}

function renderMini() {
  const cur = d(state.currentDate);
  const first = monthStart(cur);
  const start = addDays(first, -((first.getDay() + 6) % 7));
  $("miniTitle").textContent = `${IT[cur.getMonth()]} ${cur.getFullYear()}`;
  const box = $("miniCalendar");
  box.innerHTML = "";
  for (let i = 0; i < 42; i++) {
    const day = addDays(start, i);
    const button = document.createElement("button");
    button.type = "button";
    button.className = `mini-day${day.getMonth() !== cur.getMonth() ? " out" : ""}${sameDay(day, cur) ? " selected" : ""}`;
    button.textContent = day.getDate();
    button.onclick = () => { state.currentDate = localIsoDate(day); render(); };
    box.append(button);
  }
}

function eventButton(event, day) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = `event${event.allDay ? " all-day" : ""}`;
  if (event.allDay && day) {
    const start = datePart(event.start);
    const end = datePart(event.end);
    const dayString = localIsoDate(day);
    const rowStart = day.getDay() === 1 || dayString === start;
    const rowEnd = day.getDay() === 0 || dayString === end;
    button.classList.add(rowStart ? "range-start" : "range-middle");
    if (rowEnd) button.classList.add("range-end");
  }
  button.style.setProperty("--event-color", cat(event.category).color);
  button.textContent = (event.allDay ? "" : `${fmtTime(event.start)} `) + event.title;
  button.onclick = (ev) => { ev.stopPropagation(); openModal(event.id); };
  return button;
}

function renderMonth() {
  const cur = d(state.currentDate);
  const first = monthStart(cur);
  const start = addDays(first, -((first.getDay() + 6) % 7));
  const root = $("calendarRoot");
  root.innerHTML = `<div class="month-weekdays">${WD.map((w) => `<div>${w}</div>`).join("")}</div><div class="month-grid"></div>`;
  const grid = root.querySelector(".month-grid");
  for (let i = 0; i < 42; i++) {
    const day = addDays(start, i);
    const cell = document.createElement("div");
    cell.className = `day-cell${day.getMonth() !== cur.getMonth() ? " out" : ""}`;
    cell.innerHTML = `<div class="day-number">${day.getDate()}</div>`;
    eventsForDay(day).forEach((event) => cell.append(eventButton(event, day)));
    grid.append(cell);
  }
}

function renderWeek() {
  const start = monday(d(state.currentDate));
  const root = $("calendarRoot");
  root.innerHTML = "";
  const week = document.createElement("div");
  week.className = "week";
  week.append(document.createElement("div"));
  for (let i = 0; i < 7; i++) {
    const day = addDays(start, i);
    const head = document.createElement("div");
    head.className = "week-head";
    head.textContent = `${WD[i]} ${day.getDate()}`;
    week.append(head);
  }
  const all = document.createElement("div");
  all.className = "all-day-row";
  all.innerHTML = '<div class="all-day-label">Tutto il giorno</div>';
  for (let i = 0; i < 7; i++) {
    const day = addDays(start, i);
    const slot = document.createElement("div");
    slot.className = "all-day-slot";
    eventsForDay(day).filter((event) => event.allDay).forEach((event) => slot.append(eventButton(event, day)));
    all.append(slot);
  }
  week.append(all);
  const body = document.createElement("div");
  body.className = "week-body";
  const labels = document.createElement("div");
  labels.className = "hour-labels";
  for (let h = 6; h <= 23; h++) {
    const label = document.createElement("div");
    label.className = "hour-label";
    label.textContent = `${String(h).padStart(2, "0")}:00`;
    labels.append(label);
  }
  body.append(labels);
  for (let i = 0; i < 7; i++) {
    const col = document.createElement("div");
    col.className = "week-day-col";
    placeTimed(col, addDays(start, i));
    body.append(col);
  }
  week.append(body);
  root.append(week);
}

function placeTimed(col, day) {
  eventsForDay(day).filter((event) => !event.allDay).forEach((event) => {
    const start = d(event.start);
    const end = d(event.end);
    const top = ((start.getHours() + start.getMinutes() / 60) - 6) * 58;
    const height = Math.max(34, ((end - start) / 36e5) * 58);
    const button = document.createElement("button");
    button.className = "timed-event";
    button.style.cssText = `--event-color:${cat(event.category).color};top:${top}px;height:${height}px`;
    button.textContent = `${fmtTime(event.start)} ${event.title}`;
    button.onclick = () => openModal(event.id);
    col.append(button);
  });
}

function addDetail(details, term, value, dotColor) {
  const dt = document.createElement("dt");
  dt.textContent = term;
  const dd = document.createElement("dd");
  if (dotColor) {
    const dot = document.createElement("span");
    dot.className = "dot inline-dot";
    dot.style.background = dotColor;
    dd.append(dot, document.createTextNode(` ${value}`));
  } else {
    dd.textContent = value;
  }
  details.append(dt, dd);
}

function openModal(id) {
  selectedEvent = id;
  const event = state.events.find((item) => item.id === id);
  const category = cat(event.category);
  $("modalTitle").textContent = event.title;
  const details = $("modalDetails");
  details.textContent = "";
  addDetail(details, "Data", fmtDate(event.start));
  addDetail(details, "Inizio", event.allDay ? "Tutto il giorno" : fmtTime(event.start));
  addDetail(details, "Fine", event.allDay ? fmtDate(event.end) : fmtTime(event.end));
  addDetail(details, "Categoria", category.name, category.color);
  addDetail(details, "Note", event.notes || "—");
  $("quickTitle").value = event.title;
  $("eventModal").classList.remove("hidden");
}

function setError(message = "") { $("eventFormError").textContent = message; }

function syncAllDayFields() {
  const allDay = $("eventAllDay").checked;
  const currentStartTime = fmtTime($("eventStart").value) === "—" ? "09:00" : fmtTime($("eventStart").value);
  const currentEndTime = fmtTime($("eventEnd").value) === "—" ? "10:00" : fmtTime($("eventEnd").value);
  const startDate = datePart($("eventStartDate").value || $("eventStart").value || state.currentDate);
  const endDate = datePart($("eventEndDate").value || $("eventEnd").value || startDate);
  $("eventStartDate").value = startDate;
  $("eventEndDate").value = endDate;
  $("eventStart").value = allDay ? normalizeDateTime($("eventStart").value || startDate, "09:00") : `${startDate}T${currentStartTime}`;
  $("eventEnd").value = allDay ? normalizeDateTime($("eventEnd").value || endDate, "10:00") : `${endDate}T${currentEndTime}`;
  document.querySelectorAll(".all-day-field").forEach((field) => field.classList.toggle("hidden", !allDay));
  document.querySelectorAll(".timed-field").forEach((field) => field.classList.toggle("hidden", allDay));
}

function fillDirector() {
  const select = $("eventSelect");
  select.textContent = "";
  state.events.forEach((event) => {
    const option = document.createElement("option");
    option.value = event.id;
    option.textContent = `${event.title} — ${datePart(event.start)}`;
    select.append(option);
  });
  const cats = $("eventCategory");
  cats.textContent = "";
  state.categories.forEach((category) => {
    const option = document.createElement("option");
    option.value = category.id;
    option.textContent = category.name;
    cats.append(option);
  });
  $("directorMonth").value = state.currentDate.slice(0, 7);
  loadForm(select.value);
}

function loadForm(id) {
  const event = state.events.find((item) => item.id === id);
  setError();
  if (!event) return;
  $("eventTitle").value = event.title;
  $("eventAllDay").checked = event.allDay;
  $("eventCategory").value = event.category;
  $("eventNotes").value = event.notes || "";
  $("eventStartDate").value = datePart(event.start);
  $("eventEndDate").value = datePart(event.end);
  $("eventStart").value = normalizeDateTime(event.start, "09:00");
  $("eventEnd").value = normalizeDateTime(event.end, "10:00");
  syncAllDayFields();
}

function validateEvent(event) {
  if (!event.start || !event.end) return "Inserisci una data di inizio e una data di fine.";
  if (event.allDay && event.end < event.start) return "La data di fine non può precedere la data di inizio.";
  if (!event.allDay && d(event.end) < d(event.start)) return "L'orario di fine non può precedere l'orario di inizio.";
  return "";
}

function upsert() {
  const id = $("eventSelect").value || `evt-${Date.now()}`;
  const allDay = $("eventAllDay").checked;
  const event = {
    id,
    title: $("eventTitle").value || "Nuovo evento",
    start: allDay ? $("eventStartDate").value : $("eventStart").value,
    end: allDay ? $("eventEndDate").value : $("eventEnd").value,
    allDay,
    category: $("eventCategory").value,
    notes: $("eventNotes").value,
  };
  const error = validateEvent(event);
  if (error) { setError(error); return; }
  const index = state.events.findIndex((item) => item.id === id);
  index >= 0 ? state.events.splice(index, 1, event) : state.events.push(event);
  setError();
  fillDirector();
  $("eventSelect").value = id;
  loadForm(id);
  render();
}

function bind() {
  $("prevButton").onclick = () => { const cur = d(state.currentDate); state.currentDate = localIsoDate(state.currentView === "month" ? addMonths(cur, -1) : addDays(cur, -7)); render(); };
  $("nextButton").onclick = () => { const cur = d(state.currentDate); state.currentDate = localIsoDate(state.currentView === "month" ? addMonths(cur, 1) : addDays(cur, 7)); render(); };
  $("todayButton").onclick = () => { state.currentDate = localIsoDate(new Date()); render(); };
  $("monthViewButton").onclick = () => { state.currentView = "month"; render(); };
  $("weekViewButton").onclick = () => { state.currentView = "week"; render(); };
  $("miniPrev").onclick = () => { state.currentDate = localIsoDate(addMonths(d(state.currentDate), -1)); render(); };
  $("miniNext").onclick = () => { state.currentDate = localIsoDate(addMonths(d(state.currentDate), 1)); render(); };
  $("closeModal").onclick = () => $("eventModal").classList.add("hidden");
  $("saveQuickEdit").onclick = () => { const event = state.events.find((item) => item.id === selectedEvent); if (event) { event.title = $("quickTitle").value; render(); openModal(event.id); } };
  $("deleteModalEvent").onclick = () => {
    if (!selectedEvent) return;
    state.events = state.events.filter((event) => event.id !== selectedEvent);
    selectedEvent = null;
    $("eventModal").classList.add("hidden");
    render();
  };
  $("logoButton").onclick = () => { const now = Date.now(); logoClicks = logoClicks.filter((time) => now - time < 1200); logoClicks.push(now); if (logoClicks.length >= 4) { fillDirector(); $("directorPanel").classList.remove("hidden"); logoClicks = []; } };
  $("closeDirector").onclick = () => $("directorPanel").classList.add("hidden");
  $("eventSelect").onchange = (event) => loadForm(event.target.value);
  $("eventAllDay").onchange = syncAllDayFields;
  $("directorMonth").onchange = (event) => { state.currentDate = `${event.target.value}-01`; render(); };
  $("newEvent").onclick = () => { const id = `evt-${Date.now()}`; state.events.push({ id, title: "Nuovo evento", start: `${state.currentDate}T09:00`, end: `${state.currentDate}T10:00`, allDay: false, category: state.categories[0].id, notes: "" }); fillDirector(); $("eventSelect").value = id; loadForm(id); render(); };
  $("saveEvent").onclick = upsert;
  $("deleteEvent").onclick = () => { state.events = state.events.filter((event) => event.id !== $("eventSelect").value); fillDirector(); render(); };
  $("resetContent").onclick = () => { state = clone(window.PLAN_INITIAL_DATA); state.currentView = "month"; save(); fillDirector(); render(); };
  $("clearEvents").onclick = () => { state.events = []; fillDirector(); render(); };
  $("cleanMode").onclick = () => { $("directorPanel").classList.add("hidden"); $("appShell").classList.add("clean"); };
}

bind();
render();

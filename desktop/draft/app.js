(() => {
  const STORAGE_KEY = "draftDocument";
  const initial = window.DRAFT_INITIAL_DOCUMENT || { title: "Documento senza titolo", body: "", typingText: "" };
  const $ = (id) => document.getElementById(id);
  const editor = $("editor"), title = $("documentTitle"), saveState = $("saveState"), page = $("page"), pageScale = $("pageScale"), workspace = $("workspace"), panel = $("directorPanel");
  let saveTimer, typingTimer, typingQueue = "", logoClicks = [], typedSinceStats = 0, typingActive = false, typingPrepared = false;
  const speeds = { slow: 115, normal: 62, fast: 28 };

  function escapeHtml(text) { return text.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c])); }
  function textToHtml(text) {
    const parts = (text || "").replace(/\r\n/g, "\n").split(/\n{2,}/);
    return parts.map((p, i) => i === 0 && p.trim() === initial.title ? `<h1>${escapeHtml(p)}</h1>` : `<p>${escapeHtml(p).replace(/\n/g, "<br>") || "<br>"}</p>`).join("");
  }
  function initialHtml() { return `<h1>${escapeHtml(initial.title)}</h1>${initial.body ? textToHtml(initial.body) : "<p><br></p>"}`; }
  function plainDocumentText() { return editor.innerText.replace(/\n{3,}/g, "\n\n").trim(); }
  function load() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      title.value = saved?.title || initial.title;
      editor.innerHTML = saved?.html || initialHtml();
      if (saved?.fontFamily) editor.style.fontFamily = saved.fontFamily;
      if (saved?.fontSize) editor.style.fontSize = `${saved.fontSize}pt`;
    } catch { title.value = initial.title; editor.innerHTML = initialHtml(); }
    syncDirector(); $("typingText").value = initial.typingText || initial.body || ""; updateStats();
  }
  function saveNow() {
    clearTimeout(saveTimer);
    saveTimer = null;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ title: title.value, html: editor.innerHTML, fontFamily: editor.style.fontFamily, fontSize: parseInt(editor.style.fontSize, 10) || 12 }));
    saveState.textContent = "Salvato sul dispositivo";
  }
  function scheduleSave() {
    saveState.textContent = "Salvataggio...";
    clearTimeout(saveTimer);
    saveTimer = setTimeout(saveNow, 550);
  }
  function setTypingStatus(status) { $("typingStatus").textContent = status; }
  function updateStats() {
    const text = editor.innerText.trim();
    const words = text ? text.split(/\s+/).filter(Boolean).length : 0;
    $("wordCount").textContent = `${words} ${words === 1 ? "parola" : "parole"}`;
    $("charCount").textContent = `${editor.innerText.replace(/\s/g, "").length} caratteri`;
    $("pageCount").textContent = `Pagina ${Math.max(1, Math.ceil(editor.scrollHeight / 1123))}`;
  }
  function command(cmd, value = null) { editor.focus(); document.execCommand(cmd, false, value); updateStats(); scheduleSave(); }
  function syncDirector() { $("directorTitle").value = title.value; $("directorText").value = plainDocumentText(); }
  function placeCaretEnd() { const r = document.createRange(); r.selectNodeContents(editor); r.collapse(false); const s = getSelection(); s.removeAllRanges(); s.addRange(r); editor.focus(); }
  function placeCaretInside(node, atEnd = true) { const r = document.createRange(); r.selectNodeContents(node); r.collapse(!atEnd); setRange(r); editor.focus(); }
  function hasEditorSelection() { const s = getSelection(); return s.rangeCount && editor.contains(s.getRangeAt(0).startContainer); }
  function selectionRange() { if (!hasEditorSelection()) placeCaretEnd(); return getSelection().getRangeAt(0); }
  function setRange(range) { const s = getSelection(); s.removeAllRanges(); s.addRange(range); }
  function closestBlock(node) { for (let n = node; n && n !== editor; n = n.parentNode) if (/^(P|DIV|LI|H[1-6])$/.test(n.nodeName)) return n; return null; }
  function removePlaceholderBreak(block) { if (block && block.childNodes.length === 1 && block.firstChild.nodeName === "BR") block.textContent = ""; }
  function insertTextNode(text) { const range = selectionRange(); const block = closestBlock(range.startContainer); removePlaceholderBreak(block); const node = document.createTextNode(text); range.insertNode(node); range.setStartAfter(node); range.collapse(true); setRange(range); }
  function insertLineBreak() { const range = selectionRange(); const br = document.createElement("br"); range.insertNode(br); range.setStartAfter(br); range.collapse(true); setRange(range); }
  function insertNewParagraph() {
    const range = selectionRange();
    const block = closestBlock(range.startContainer);
    const paragraph = document.createElement("p");
    paragraph.appendChild(document.createElement("br"));
    if (block && block.parentNode === editor) block.after(paragraph); else editor.appendChild(paragraph);
    const nextRange = document.createRange(); nextRange.setStart(paragraph, 0); nextRange.collapse(true); setRange(nextRange);
  }
  function insertAutoText(text) {
    for (let i = 0; i < text.length; i += 1) {
      if (text[i] === "\n" && text[i + 1] === "\n") { insertNewParagraph(); i += 1; }
      else if (text[i] === "\n") insertLineBreak();
      else insertTextNode(text[i]);
    }
  }
  function keepCaretVisible() { const sel = getSelection(); if (!sel.rangeCount) return; const rect = sel.getRangeAt(0).getBoundingClientRect(); const area = workspace.getBoundingClientRect(); if (rect.bottom > area.bottom - 48) workspace.scrollTop += rect.bottom - area.bottom + 72; }
  function ensureTitleHeading() {
    let heading = editor.querySelector("h1");
    if (!heading) { heading = document.createElement("h1"); editor.prepend(heading); }
    heading.textContent = title.value || initial.title;
    return heading;
  }
  function emptyParagraphAfter(heading) { const paragraph = document.createElement("p"); paragraph.appendChild(document.createElement("br")); heading.after(paragraph); return paragraph; }
  function paragraphAfterTitle() {
    const heading = ensureTitleHeading();
    let paragraph = heading.nextElementSibling && heading.nextElementSibling.matches("p") ? heading.nextElementSibling : null;
    if (!paragraph) paragraph = emptyParagraphAfter(heading);
    return paragraph;
  }
  function prepareTypingTarget() {
    if ($("typingMode").value === "replace") {
      const headingText = title.value || initial.title;
      editor.innerHTML = `<h1>${escapeHtml(headingText)}</h1>`;
      placeCaretInside(emptyParagraphAfter(editor.querySelector("h1")), false);
    } else if ($("appendPosition").value === "after-title") placeCaretInside(paragraphAfterTitle(), true);
    else if ($("appendPosition").value === "end") placeCaretEnd();
    else if (!hasEditorSelection()) placeCaretEnd();
    editor.focus(); typedSinceStats = 0;
  }
  function finishTyping(status = "Completata") { clearTimeout(typingTimer); typingTimer = null; typingActive = false; typingPrepared = false; updateStats(); saveNow(); keepCaretVisible(); setTypingStatus(status); }
  function stopTyping() { clearTimeout(typingTimer); typingTimer = null; typingActive = false; typingPrepared = false; updateStats(); saveNow(); keepCaretVisible(); setTypingStatus("Interrotta"); }
  function typeNext() {
    if (!typingQueue.length) { typingQueue = ""; finishTyping("Completata"); return; }
    if (!typingActive) { typingActive = true; setTypingStatus("Digitazione in corso"); }
    const ch = typingQueue[0];
    if (ch === "\n" && typingQueue[1] === "\n") { insertAutoText("\n\n"); typingQueue = typingQueue.slice(2); }
    else { insertAutoText(ch); typingQueue = typingQueue.slice(1); }
    typedSinceStats += 1;
    if (typedSinceStats >= 12 || /[.,;:!?\n]/.test(ch)) { typedSinceStats = 0; updateStats(); scheduleSave(); keepCaretVisible(); }
    const base = speeds[$("typingSpeed").value] || speeds.normal;
    const variation = $("naturalTyping").checked ? Math.random() * base * 0.9 : 0;
    typingTimer = setTimeout(typeNext, base + variation + (/[.,;:!?]/.test(ch) ? base * 4 : 0));
  }

  document.querySelectorAll("[data-command]").forEach((b) => b.addEventListener("click", () => command(b.dataset.command)));
  document.querySelectorAll("[data-align]").forEach((b) => b.addEventListener("click", () => command(`justify${b.dataset.align[0].toUpperCase()}${b.dataset.align.slice(1)}`)));
  $("fontFamily").addEventListener("change", (e) => { editor.style.fontFamily = e.target.value; command("fontName", e.target.value); });
  $("fontSize").addEventListener("change", (e) => { editor.style.fontSize = `${e.target.value}pt`; scheduleSave(); editor.focus(); });
  $("lineSpacing").addEventListener("click", () => { editor.style.lineHeight = editor.style.lineHeight === "2" ? "1.55" : "2"; scheduleSave(); });
  function updateZoom() { const scale = parseInt($("zoomSelect").value, 10) / 100; const baseHeight = Math.max(1123, page.offsetHeight); page.style.transform = `scale(${scale})`; pageScale.style.width = `${794 * scale}px`; pageScale.style.height = `${baseHeight * scale}px`; }
  $("zoomSelect").addEventListener("change", updateZoom);
  editor.addEventListener("input", () => { updateStats(); scheduleSave(); });
  title.addEventListener("input", () => { scheduleSave(); syncDirector(); });
  $("draftLogo").addEventListener("click", () => { const now = Date.now(); logoClicks = logoClicks.filter((t) => now - t < 1200).concat(now); if (logoClicks.length >= 4) { panel.hidden = !panel.hidden; document.body.classList.remove("clean-filming"); syncDirector(); logoClicks = []; } });
  $("replaceDocument").onclick = () => { title.value = $("directorTitle").value; editor.innerHTML = textToHtml($("directorText").value); updateStats(); scheduleSave(); };
  $("restoreInitial").onclick = () => { title.value = initial.title; editor.innerHTML = initialHtml(); $("typingText").value = initial.typingText || initial.body || ""; syncDirector(); updateStats(); scheduleSave(); };
  $("clearDocument").onclick = () => { editor.innerHTML = `<h1>${escapeHtml(title.value || initial.title)}</h1><p><br></p>`; updateStats(); scheduleSave(); };
  $("showCursor").onchange = (e) => document.body.classList.toggle("hide-caret", !e.target.checked);
  $("startTyping").onclick = () => { clearTimeout(typingTimer); typingActive = false; typingPrepared = false; typingQueue = ""; prepareTypingTarget(); typingPrepared = true; typingQueue = $("typingText").value; const delay = Number($("typingDelay").value); setTypingStatus(delay > 0 ? "In attesa" : "Digitazione in corso"); typingTimer = setTimeout(typeNext, delay * 1000); };
  $("stopTyping").onclick = stopTyping;
  $("completeTyping").onclick = () => { clearTimeout(typingTimer); const text = typingPrepared ? typingQueue : $("typingText").value; if (!typingPrepared) prepareTypingTarget(); insertAutoText(text); typingQueue = ""; finishTyping("Completata"); };
  $("cleanMode").onclick = () => { saveNow(); panel.hidden = true; document.body.classList.add("clean-filming"); };
  $("closeDirector").onclick = () => { panel.hidden = true; };
  editor.addEventListener("keydown", (event) => {
    if (!(event.ctrlKey || event.metaKey)) return;
    const key = event.key.toLowerCase();
    if (["b", "i", "u", "z", "y", "s"].includes(key)) event.preventDefault();
    if (key === "b") command("bold");
    else if (key === "i") command("italic");
    else if (key === "u") command("underline");
    else if (key === "z" && event.shiftKey) command("redo");
    else if (key === "z") command("undo");
    else if (key === "y") command("redo");
    else if (key === "s") saveNow();
  });
  load();
  updateZoom();
})();

import { resolveMediaPath } from "./media-catalog.js";

let stylesReady = false;
let activeOverlay = null;

function ensureStyles(){
  if(stylesReady) return;
  const style = document.createElement("style");
  style.textContent = `
    .repo-picker{margin:6px 0 12px}.repo-picker-summary{display:flex;align-items:center;gap:10px;min-height:72px;padding:9px;border-radius:16px;background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.18)}.repo-picker-thumb-wrap{position:relative;flex:0 0 auto}.repo-picker-summary img{width:58px;height:58px;object-fit:cover;border-radius:13px;background:rgba(0,0,0,.16)}.repo-picker-empty-thumb{width:58px;height:58px;border-radius:13px;background:rgba(0,0,0,.16);display:grid;place-items:center;font-size:22px;opacity:.72}.repo-picker-label{flex:1;min-width:0;font-size:12px;line-height:1.25;overflow:hidden;text-overflow:ellipsis}.repo-picker-actions{display:flex;gap:7px;flex-wrap:wrap;justify-content:flex-end}.repo-picker-action{border:0;border-radius:13px;padding:10px 12px;background:rgba(255,255,255,.16);color:inherit;font:inherit;font-size:12px;touch-action:manipulation}.repo-picker-action.primary{background:linear-gradient(145deg,#ff36aa,#945cff);color:#fff}.repo-picker-action.remove{background:rgba(255,255,255,.10)}.repo-picker-overlay{position:fixed;inset:0;z-index:1000;display:flex;align-items:center;justify-content:center;background:rgba(18,0,12,.62);padding:calc(env(safe-area-inset-top) + 18px) 18px calc(env(safe-area-inset-bottom) + 18px)}.repo-picker-library{width:min(680px,100%);max-height:calc(100dvh - 36px);overflow-y:auto;overscroll-behavior:contain;-webkit-overflow-scrolling:touch;border-radius:28px;background:rgba(35,12,28,.92);border:1px solid rgba(255,255,255,.24);box-shadow:0 24px 70px rgba(0,0,0,.32);color:#fff}.repo-picker-library-header{position:sticky;top:0;z-index:2;display:flex;align-items:center;gap:12px;justify-content:space-between;padding:14px;background:rgba(35,12,28,.96);backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);border-bottom:1px solid rgba(255,255,255,.16)}.repo-picker-library-header h3{margin:0;font-size:17px}.repo-picker-close{border:0;border-radius:13px;padding:9px 12px;background:rgba(255,255,255,.14);color:inherit;font:inherit}.repo-picker-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px;padding:14px}.repo-picker-tile{position:relative;min-height:118px;border:1px solid rgba(255,255,255,.22);border-radius:17px;background:rgba(255,255,255,.12);padding:7px;color:inherit;text-align:left;touch-action:manipulation}.repo-picker-tile img{width:100%;aspect-ratio:1.15;display:block;object-fit:cover;border-radius:12px;background:rgba(0,0,0,.18)}.repo-picker-tile span{display:block;margin-top:6px;font-size:11px;line-height:1.2;overflow:hidden;text-overflow:ellipsis}.repo-picker-tile.is-selected{border-color:#fff;box-shadow:0 0 0 3px rgba(255,255,255,.38),0 12px 28px rgba(0,0,0,.18)}.repo-picker-none{min-height:72px;display:grid;place-items:center;text-align:center}.repo-picker-video-mark{position:absolute;margin:8px;padding:5px 7px;border-radius:999px;background:rgba(0,0,0,.55);color:#fff;font-size:11px}@media(min-width:620px){.repo-picker-grid{grid-template-columns:repeat(3,minmax(0,1fr))}}@media(min-width:860px){.repo-picker-grid{grid-template-columns:repeat(4,minmax(0,1fr))}}
  `;
  document.head.appendChild(style);
  stylesReady = true;
}

function labelFor(asset){return asset?.label || asset?.path?.split("/").pop() || "Nessuno";}

export function createMediaPicker({ container, assets, value = "", optional = false, type = "image", title = "Scegli media", onChange }){
  ensureStyles();
  let selectedPath = value;
  let selectedAsset = assets.find(asset => asset.path === value) || null;
  container.classList.add("repo-picker");

  function pick(asset){
    selectedAsset = asset;
    selectedPath = asset?.path || "";
    render();
    closeOverlay();
    onChange?.({ asset, path: selectedPath });
  }

  function closeOverlay(){
    activeOverlay?.remove();
    activeOverlay = null;
  }

  function openOverlay(){
    closeOverlay();
    const overlay = document.createElement("div");
    overlay.className = "repo-picker-overlay";
    overlay.innerHTML = `
      <div class="repo-picker-library" role="dialog" aria-modal="true" aria-label="${title}">
        <div class="repo-picker-library-header">
          <h3>${title}</h3>
          <button type="button" class="repo-picker-close">Chiudi</button>
        </div>
        <div class="repo-picker-grid">
          ${optional ? `<button type="button" class="repo-picker-tile repo-picker-none ${!selectedPath ? "is-selected" : ""}" data-empty="1"><span>Nessuno</span></button>` : ""}
          ${assets.map((asset,index)=>`
            <button type="button" class="repo-picker-tile ${asset.path === selectedPath ? "is-selected" : ""}" data-index="${index}">
              ${type === "video" ? `<b class="repo-picker-video-mark">Video</b>` : ""}
              <img src="${resolveMediaPath(asset.poster || asset.path)}" alt="">
              <span>${labelFor(asset)}</span>
            </button>`).join("")}
        </div>
      </div>`;
    overlay.addEventListener("click", event => {
      if(event.target === overlay || event.target.closest(".repo-picker-close")) closeOverlay();
      const tile = event.target.closest(".repo-picker-tile");
      if(!tile || !overlay.contains(tile)) return;
      if(tile.dataset.empty) pick(null);
      else pick(assets[Number(tile.dataset.index)]);
    });
    document.body.appendChild(overlay);
    activeOverlay = overlay;
  }

  function render(){
    const previewSrc = selectedAsset ? (selectedAsset.poster || selectedAsset.path) : selectedPath;
    container.innerHTML = `
      <div class="repo-picker-summary">
        <div class="repo-picker-thumb-wrap">
          ${type === "video" && selectedPath ? `<b class="repo-picker-video-mark">Video</b>` : ""}
          ${previewSrc ? `<img src="${resolveMediaPath(previewSrc)}" alt="">` : `<div class="repo-picker-empty-thumb">＋</div>`}
        </div>
        <span class="repo-picker-label">${selectedPath ? labelFor(selectedAsset) : "Nessuno selezionato"}</span>
        <div class="repo-picker-actions">
          <button type="button" class="repo-picker-action primary" data-open="1">${selectedPath ? "Cambia" : "Scegli"}</button>
          ${optional && selectedPath ? `<button type="button" class="repo-picker-action remove" data-remove="1">Rimuovi</button>` : ""}
        </div>
      </div>`;
  }

  container.addEventListener("click", event => {
    if(event.target.closest("[data-open]")) openOverlay();
    if(event.target.closest("[data-remove]")) pick(null);
  });

  render();
  return { get value(){return selectedPath;}, get asset(){return selectedAsset;}, setValue(path){ selectedPath = path || ""; selectedAsset = assets.find(asset => asset.path === selectedPath) || null; render(); } };
}

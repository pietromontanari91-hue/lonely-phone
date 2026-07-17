import { IMAGE_ASSETS, resolveMediaPath } from "../../core/media-catalog.js";
import { createMediaPicker } from "../../core/media-picker.js";
const STORAGE_KEY = "travelsBoardsReal";
const cloneData = (value) => JSON.parse(JSON.stringify(value));
const defaults=cloneData(TRAVELS_BOARDS);
let boards=JSON.parse(localStorage.getItem(STORAGE_KEY)||"null")||cloneData(defaults);
let editing=false,currentId=null;
const boardPickers=[1,2,3].map(number => createMediaPicker({
  container: document.getElementById(`newBoardImagePicker${number}`),
  assets: IMAGE_ASSETS,
  title: `Scegli Immagine ${number}`,
  onChange: ({ path }) => { document.getElementById(`newBoardImage${number}`).value = path; validateNewBoardImages(); }
}));
function validateNewBoardImages(){
  const message=document.getElementById("newBoardValidation");
  if(!message) return true;
  const images=["newBoardImage1","newBoardImage2","newBoardImage3"].map(id=>document.getElementById(id).value.trim()).filter(Boolean);
  if(images.length!==3){ message.textContent=images.length ? "Seleziona esattamente tre immagini." : ""; return false; }
  if(new Set(images).size!==images.length){ message.textContent="Ogni slot deve usare un’immagine diversa."; return false; }
  message.textContent=""; return true;
}

function save(){localStorage.setItem(STORAGE_KEY,JSON.stringify(boards))}
function imagePath(img){return resolveMediaPath(img && img.includes("/") ? img : `assets/images/${img}`)}
function render(filter=""){
  document.getElementById("boards").innerHTML=boards
    .filter(b=>(b.title+" "+b.subtitle).toLowerCase().includes(filter.toLowerCase()))
    .map(b=>`
      <article class="board glass">
        <div class="board-title">
          <div><h2>${b.title}</h2><p>${b.subtitle}</p></div>
          ${editing?`<button data-edit="${b.id}">✎</button>`:""}
        </div>
        <div class="collage">
          ${b.images.map(img=>`<img src="${imagePath(img)}" alt="">`).join("")}
        </div>
        <span class="count">3 idee salvate</span>
      </article>
    `).join("");
}


document.getElementById("newBoardBtn").onclick=()=>{document.getElementById("travelsDirectorPanel").classList.remove("open");document.getElementById("newBoardModal").classList.add("open")};
document.getElementById("cancelNewBoardBtn").onclick=()=>document.getElementById("newBoardModal").classList.remove("open");
document.getElementById("resetBoardsBtn").onclick=()=>{
  boards=cloneData(defaults);
  localStorage.removeItem(STORAGE_KEY);
  render(document.getElementById("searchInput").value);
  document.getElementById("travelsDirectorPanel").classList.remove("open");
};
document.getElementById("newBoardForm").onsubmit=(event)=>{
  event.preventDefault();
  const title=document.getElementById("newBoardTitle").value.trim();
  const subtitle=document.getElementById("newBoardSubtitle").value.trim();
  const images=["newBoardImage1","newBoardImage2","newBoardImage3"].map(id=>document.getElementById(id).value.trim()).filter(Boolean);
  if(!title || !validateNewBoardImages())return;
  boards.unshift({id:`board-${Date.now()}`,title,subtitle,images});
  save();
  render(document.getElementById("searchInput").value);
  event.target.reset();
  boardPickers.forEach(picker=>picker.setValue(""));
  validateNewBoardImages();
  document.getElementById("newBoardModal").classList.remove("open");
};

document.getElementById("editMode").onclick=()=>{
  editing=!editing;
  document.getElementById("editMode").textContent=editing?"Fine":"Modifica titoli";
  document.getElementById("travelsDirectorPanel").classList.remove("open");
  render(document.getElementById("searchInput").value);
};
document.getElementById("closeDirectorBtn").onclick=()=>document.getElementById("travelsDirectorPanel").classList.remove("open");
let directorTaps=0,directorTapReset=null;
document.querySelector(".topbar").addEventListener("pointerup",()=>{
  directorTaps++;
  clearTimeout(directorTapReset);
  if(directorTaps>=4){
    document.getElementById("travelsDirectorPanel").classList.add("open");
    directorTaps=0;
  }
  directorTapReset=setTimeout(()=>directorTaps=0,1200);
});
document.getElementById("searchInput").addEventListener("input",e=>render(e.target.value));
document.addEventListener("click",e=>{
  const btn=e.target.closest("[data-edit]");
  if(!btn)return;
  currentId=btn.dataset.edit;
  const board=boards.find(b=>b.id===currentId);
  document.getElementById("titleInput").value=board.title;
  document.getElementById("subtitleInput").value=board.subtitle;
  document.getElementById("modal").classList.add("open");
});
document.getElementById("cancelBtn").onclick=()=>document.getElementById("modal").classList.remove("open");
document.getElementById("saveBtn").onclick=()=>{
  const board=boards.find(b=>b.id===currentId);
  board.title=document.getElementById("titleInput").value.trim()||board.title;
  board.subtitle=document.getElementById("subtitleInput").value.trim()||board.subtitle;
  save();render(document.getElementById("searchInput").value);
  document.getElementById("modal").classList.remove("open");
};
render();

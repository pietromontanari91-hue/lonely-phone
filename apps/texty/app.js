const cloneData = (value) => JSON.parse(JSON.stringify(value));
const seedChats=cloneData(TEXTY_CHATS);
let chats=JSON.parse(localStorage.getItem("textyChats")||"null")||cloneData(seedChats);
let current=null,sceneSnapshot=null,recTimer=null,recSeconds=0;
const list=document.getElementById("chatList"),messages=document.getElementById("messages");

function save(){localStorage.setItem("textyChats",JSON.stringify(chats))}
function now(){return new Date().toLocaleTimeString("it-IT",{hour:"2-digit",minute:"2-digit"})}
function audioHTML(m){return `<div class="audio"><button class="play">▶</button><div class="wave">${"<i></i>".repeat(16)}</div><span>${m.duration||"0:09"}</span></div>`}
function renderList(filter=""){
 list.innerHTML=chats.filter(c=>c.title.toLowerCase().includes(filter.toLowerCase())).map(c=>`<div class="chatrow" data-id="${c.id}">
 <div class="avatar">${c.avatar}</div><div class="rowtext"><b>${c.title}</b><p>${c.preview||""}</p></div>
 <div class="rowmeta">${c.time||""}${c.unread?`<div class="badge">${c.unread}</div>`:""}</div></div>`).join("");
 refreshSelect();
}
function renderMessages(){
 messages.innerHTML=current.messages.map(m=>{
 if(m.type==="day")return `<div class="day">${m.text}</div>`;
 return `<div class="msg ${m.side}">${m.sender?`<span class="sender">${m.sender}</span>`:""}${m.audio?audioHTML(m):m.text}<span class="time">${m.time}</span></div>`;
 }).join("");
 messages.scrollTop=messages.scrollHeight;
}
function openChat(id){
 current=chats.find(c=>c.id===id);sceneSnapshot=JSON.stringify(current.messages);
 document.getElementById("chatTitle").textContent=current.title;document.getElementById("chatAvatar").textContent=current.avatar;
 document.getElementById("chatStatus").textContent=current.status;document.getElementById("listScreen").classList.remove("active");
 document.getElementById("chatScreen").classList.add("active");renderMessages();fillSettings();
}
function addMessage(chat,side,text="",sender="",time=now(),audio=false,duration="0:09"){
 chat.messages.push({side,text,sender,time,audio,duration});chat.preview=audio?"Messaggio vocale":(sender?sender+": ":"")+text;chat.time=time;save();
 if(current&&chat.id===current.id)renderMessages();renderList(document.getElementById("searchInput").value);
}
function refreshSelect(){
 const options=chats.map(c=>`<option value="${c.id}">${c.title}</option>`).join("");
 document.getElementById("messageChat").innerHTML=options;
 document.getElementById("sceneChat").innerHTML=options;
 if(current){
   document.getElementById("messageChat").value=current.id;
   document.getElementById("sceneChat").value=current.id;
 }
}
function getSceneChat(){
 const id=document.getElementById("sceneChat").value;
 return chats.find(c=>c.id===id)||current||chats[0];
}
function fillSettings(){
 if(!current)return;document.getElementById("editTitle").value=current.title;document.getElementById("editStatus").value=current.status;document.getElementById("editAvatar").value=current.avatar;
}
renderList();

let directorTapCount=0;
document.getElementById("listScreen").addEventListener("pointerup",()=>{
 directorTapCount++;
 if(directorTapCount===4){
   document.getElementById("directorPanel").classList.add("open");
   directorTapCount=0;
 }
 setTimeout(()=>directorTapCount=0,1200);
});


document.addEventListener("click",e=>{
 const row=e.target.closest(".chatrow");if(row)openChat(row.dataset.id);
 if(e.target.closest(".back")){document.getElementById("chatScreen").classList.remove("active");document.getElementById("listScreen").classList.add("active")}
 if(e.target.closest("#sendBtn")){const i=document.getElementById("textInput");if(current&&i.value.trim())addMessage(current,"out",i.value.trim());i.value=""}
 const play=e.target.closest(".play");if(play)play.textContent=play.textContent==="▶"?"❚❚":"▶";
});
document.getElementById("searchInput").addEventListener("input",e=>renderList(e.target.value));
document.getElementById("textInput").addEventListener("keydown",e=>{if(e.key==="Enter"&&current){addMessage(current,"out",e.target.value.trim());e.target.value=""}});

document.getElementById("directorBtn").onclick=()=>{
 refreshSelect();
 document.getElementById("directorPanel").classList.add("open");
};
document.getElementById("closePanel").onclick=()=>document.getElementById("directorPanel").classList.remove("open");
document.querySelectorAll("[data-tab]").forEach(b=>b.onclick=()=>{
 document.querySelectorAll("[data-tab]").forEach(x=>x.classList.remove("active"));document.querySelectorAll(".tab").forEach(x=>x.classList.remove("active"));
 b.classList.add("active");document.getElementById("tab-"+b.dataset.tab).classList.add("active");
});

document.getElementById("createGroupBtn").onclick=()=>{
 const title=document.getElementById("groupName").value.trim(),members=document.getElementById("groupMembers").value.split(",").map(x=>x.trim()).filter(Boolean),first=document.getElementById("groupFirstMessage").value.trim();
 if(!title)return;
 const id="group-"+Date.now();const c={id,title,avatar:String(Math.max(members.length,2)),status:`${members.length||2} partecipanti`,preview:first||"Nuovo gruppo",time:now(),unread:0,group:true,messages:[{type:"day",text:"Oggi"}]};
 if(first)c.messages.push({side:"in",sender:members[0]||"Martina",text:first,time:now()});
 chats.unshift(c);save();renderList();openChat(id);document.getElementById("directorPanel").classList.remove("open");
};
document.getElementById("incomingBtn").onclick=()=>{
 const chat=getSceneChat();
 if(chat)addMessage(chat,"in","Stiamo già andando, tu dove sei?",chat.group?"Martina":"");
};
document.getElementById("typingBtn").onclick=()=>{
 const chat=getSceneChat();
 if(!chat)return;
 if(!current || current.id!==chat.id) openChat(chat.id);
 document.getElementById("directorPanel").classList.remove("open");
 setTimeout(()=>{
   const t=document.createElement("div");
   t.className="typing";
   t.textContent="sta scrivendo…";
   messages.appendChild(t);
   messages.scrollTop=messages.scrollHeight;
   setTimeout(()=>t.remove(),2500);
 },120);
};
document.getElementById("incomingAudioBtn").onclick=()=>{
 const chat=getSceneChat();
 if(chat)addMessage(chat,"in","",chat.group?"Giulia":"",now(),true,"0:11");
};
document.getElementById("resetBtn").onclick=()=>{
 const chat=getSceneChat();
 if(!chat)return;
 if(current && current.id===chat.id && sceneSnapshot){
   chat.messages=JSON.parse(sceneSnapshot);
 }else{
   const seed=seedChats.find(c=>c.id===chat.id);
   if(seed)chat.messages=cloneData(seed.messages);
 }
 save();
 if(current && current.id===chat.id)renderMessages();
 renderList(document.getElementById("searchInput").value);
};

function addFromPanel(side){
 const chat=chats.find(c=>c.id===document.getElementById("messageChat").value),text=document.getElementById("messageText").value.trim(),sender=document.getElementById("messageSender").value.trim(),time=document.getElementById("messageTime").value||now();
 if(chat&&text)addMessage(chat,side,text,sender,time);document.getElementById("messageText").value="";
}
document.getElementById("addIncomingBtn").onclick=()=>addFromPanel("in");
document.getElementById("addOutgoingBtn").onclick=()=>addFromPanel("out");
document.getElementById("saveChatBtn").onclick=()=>{if(!current)return;current.title=document.getElementById("editTitle").value;current.status=document.getElementById("editStatus").value;current.avatar=document.getElementById("editAvatar").value||"T";save();renderList();openChat(current.id)};
document.getElementById("clearAllBtn").onclick=()=>{localStorage.removeItem("textyChats");chats=cloneData(seedChats);save();renderList();document.getElementById("directorPanel").classList.remove("open")};

const mic=document.getElementById("micBtn"),input=document.getElementById("textInput"),recording=document.getElementById("recording");
mic.onclick=()=>{
 if(!current)return;
 if(!recTimer){recSeconds=0;input.classList.add("hidden");recording.classList.add("show");mic.textContent="■";recTimer=setInterval(()=>{recSeconds++;document.getElementById("timer").textContent=`${Math.floor(recSeconds/60)}:${String(recSeconds%60).padStart(2,"0")}`},1000)}
 else{clearInterval(recTimer);recTimer=null;input.classList.remove("hidden");recording.classList.remove("show");mic.textContent="●";addMessage(current,"out","", "",now(),true,`0:${String(Math.max(recSeconds,1)).padStart(2,"0")}`)}
};
document.getElementById("cancelRec").onclick=()=>{clearInterval(recTimer);recTimer=null;input.classList.remove("hidden");recording.classList.remove("show");mic.textContent="●"};

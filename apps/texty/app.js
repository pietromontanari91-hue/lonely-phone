const STORAGE_KEY = "textyDataV2";
const LEGACY_KEY = "textyChats";
const cloneData = (value) => JSON.parse(JSON.stringify(value));
const initialData = window.TEXTY_INITIAL_DATA || { currentUserId: "protagonista", chats: [] };
let state = loadState();
let chats = state.chats;
let current = null, recTimer = null, recSeconds = 0;
const list = document.getElementById("chatList"), messages = document.getElementById("messages");
const input = document.getElementById("textInput");

function freshState(){
  const cloned = cloneData(initialData);
  return { currentUserId: cloned.currentUserId, runtimeMessageCounter: 0, chats: cloned.chats };
}
function reconcileWithInitialData(saved){
  const next = saved && Array.isArray(saved.chats) ? saved : freshState();
  next.currentUserId = initialData.currentUserId || next.currentUserId || "protagonista";
  next.runtimeMessageCounter = next.runtimeMessageCounter || 0;
  const savedChats = Array.isArray(next.chats) ? next.chats : [];
  const reconciled = initialData.chats.map(seed => {
    const existing = savedChats.find(chat => chat.id === seed.id);
    const runtimeMessages = (existing?.messages || []).filter(message => message.runtime);
    return { ...cloneData(seed), messages: [...cloneData(seed.messages || []), ...runtimeMessages] };
  });
  const runtimeChats = savedChats.filter(chat => chat.runtime && !initialData.chats.some(seed => seed.id === chat.id));
  next.chats = [...reconciled, ...runtimeChats];
  return next;
}
function loadState(){
  const stored = localStorage.getItem(STORAGE_KEY);
  if(stored){
    try{
      const reconciled = reconcileWithInitialData(JSON.parse(stored));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(reconciled));
      return reconciled;
    }catch(e){}
  }
  const next = freshState();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
}
function save(){localStorage.setItem(STORAGE_KEY, JSON.stringify(state))}
function resetToInitial(){state = freshState(); chats = state.chats; save();}
function localTimestamp(date){
  const pad = (value) => String(value).padStart(2,"0");
  return `${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}
function latestMessageDate(chat){
  const latest = [...(chat.messages || [])].reverse().find(message => message.timestamp || message.time);
  const parsed = latest ? new Date(latest.timestamp || latest.time) : null;
  return parsed && !Number.isNaN(parsed.getTime()) ? parsed : new Date();
}
function timestampForMessage(chat, explicitTime=""){
  const value = explicitTime.trim();
  if(/^\d{2}:\d{2}$/.test(value)){
    const [hours, minutes] = value.split(":").map(Number);
    const base = latestMessageDate(chat);
    return localTimestamp(new Date(base.getFullYear(), base.getMonth(), base.getDate(), hours, minutes, 0));
  }
  return localTimestamp(new Date());
}
function directorTimeValue(){return document.getElementById("messageTime").value || ""}
function displayTime(timestamp){
  if(!timestamp)return "";
  const d = new Date(timestamp);
  if(Number.isNaN(d.getTime()))return timestamp;
  return d.toLocaleTimeString("it-IT",{hour:"2-digit",minute:"2-digit"});
}
function preview(chat){
  const last = [...chat.messages].reverse().find(m => m.type !== "day");
  if(!last)return "";
  const prefix = chat.participants && last.senderId !== state.currentUserId ? `${last.senderName}: ` : "";
  return last.type === "audio" ? `${prefix}Messaggio vocale` : `${prefix}${last.text || ""}`;
}
function chatTime(chat){
  const last = [...chat.messages].reverse().find(m => m.timestamp || m.time);
  return last ? displayTime(last.timestamp || last.time) : "";
}
function appendText(parent, tag, text, className){const el=document.createElement(tag); if(className)el.className=className; el.textContent=text; parent.appendChild(el); return el;}
function audioNode(m){
  const box=document.createElement("div"); box.className="audio";
  const play=appendText(box,"button","▶","play"); play.type="button";
  const wave=document.createElement("div"); wave.className="wave"; for(let i=0;i<16;i++)wave.appendChild(document.createElement("i")); box.appendChild(wave);
  appendText(box,"span",m.duration||"0:09"); return box;
}
function renderList(filter=""){
  list.textContent="";
  chats.filter(c=>c.title.toLowerCase().includes(filter.toLowerCase())).forEach(c=>{
    const row=document.createElement("div"); row.className="chatrow"; row.dataset.id=c.id;
    appendText(row,"div",c.avatar || c.initials || c.title.slice(0,2),"avatar");
    const text=document.createElement("div"); text.className="rowtext"; appendText(text,"b",c.title); appendText(text,"p",preview(c)); row.appendChild(text);
    const meta=document.createElement("div"); meta.className="rowmeta"; meta.append(document.createTextNode(chatTime(c))); if(c.unread){appendText(meta,"div",String(c.unread),"badge")} row.appendChild(meta);
    list.appendChild(row);
  });
  refreshSelect(); refreshRuntimeSelect();
}
function renderMessages(){
  messages.textContent="";
  if(!current)return;
  let lastDay="";
  current.messages.forEach(m=>{
    const stamp = m.timestamp ? new Date(m.timestamp) : null;
    const day = stamp && !Number.isNaN(stamp.getTime()) ? stamp.toLocaleDateString("it-IT",{weekday:"long",day:"numeric",month:"long"}) : "";
    if(day && day!==lastDay){appendText(messages,"div",day,"day"); lastDay=day;}
    const side = m.senderId === state.currentUserId || m.side === "out" ? "out" : "in";
    const bubble=document.createElement("div"); bubble.className=`msg ${side}`;
    if(side==="in" && current.participants?.length>2)appendText(bubble,"span",m.senderName || m.sender || "", "sender");
    if(m.type === "audio" || m.audio)bubble.appendChild(audioNode(m)); else bubble.append(document.createTextNode(m.text || ""));
    appendText(bubble,"span",displayTime(m.timestamp || m.time),"time"); messages.appendChild(bubble);
  });
  messages.scrollTop=messages.scrollHeight;
  refreshRuntimeSelect();
}
function openChat(id){
  current=chats.find(c=>c.id===id); if(!current)return;
  document.getElementById("chatTitle").textContent=current.title; document.getElementById("chatAvatar").textContent=current.avatar || current.initials || "T";
  document.getElementById("chatStatus").textContent=current.status || `${current.participants?.length || 0} partecipanti`;
  document.getElementById("listScreen").classList.remove("active"); document.getElementById("chatScreen").classList.add("active"); renderMessages(); fillSettings(); refreshSelect();
}
function runtimeId(){state.runtimeMessageCounter=(state.runtimeMessageCounter||0)+1; return `runtime-${String(state.runtimeMessageCounter).padStart(4,"0")}`;}
function addMessage(chat,side,text="",sender="",explicitTime="",audio=false,duration="0:09"){
  const isOut = side === "out";
  const participant = isOut ? chat.participants?.find(p=>p.id===state.currentUserId) : chat.participants?.find(p=>p.name===sender) || chat.participants?.find(p=>p.id!==state.currentUserId);
  chat.messages.push({id:runtimeId(), senderId:isOut ? state.currentUserId : (participant?.id || "runtime-sender"), senderName:isOut ? (participant?.name || "Emma") : (sender || participant?.name || "Martina"), text, timestamp:timestampForMessage(chat, explicitTime), type:audio?"audio":"text", state:isOut?"sent":"delivered", duration, runtime:true});
  save(); if(current&&chat.id===current.id)renderMessages(); renderList(document.getElementById("searchInput").value);
}
function sendCurrent(){if(!current)return; const text=input.value.trim(); if(!text)return; addMessage(current,"out",text); input.value="";}
function refreshSelect(){
  const selects=[document.getElementById("messageChat"),document.getElementById("sceneChat")];
  selects.forEach(sel=>{sel.textContent=""; chats.forEach(c=>{const o=document.createElement("option"); o.value=c.id; o.textContent=c.title; sel.appendChild(o)}); if(current)sel.value=current.id;});
}
function refreshRuntimeSelect(){
  const sel=document.getElementById("runtimeMessageSelect"); if(!sel)return; sel.textContent=""; const chat=getSceneChat();
  (chat?.messages||[]).filter(m=>m.runtime).forEach(m=>{const o=document.createElement("option"); o.value=m.id; o.textContent=`${displayTime(m.timestamp)} ${m.senderName}: ${m.text || m.type}`; sel.appendChild(o)});
}
function getSceneChat(){const id=document.getElementById("sceneChat").value; return chats.find(c=>c.id===id)||current||chats[0];}
function fillSettings(){if(!current)return; document.getElementById("editTitle").value=current.title; document.getElementById("editStatus").value=current.status||""; document.getElementById("editAvatar").value=current.avatar||current.initials||"";}
renderList();

let directorTapCount=0;
document.getElementById("listScreen").addEventListener("pointerup",()=>{directorTapCount++; if(directorTapCount===4){document.getElementById("directorPanel").classList.add("open"); directorTapCount=0;} setTimeout(()=>directorTapCount=0,1200);});
document.addEventListener("click",e=>{const row=e.target.closest(".chatrow"); if(row)openChat(row.dataset.id); if(e.target.closest(".back")){document.getElementById("chatScreen").classList.remove("active");document.getElementById("listScreen").classList.add("active")} if(e.target.closest("#sendBtn"))sendCurrent(); const play=e.target.closest(".play"); if(play)play.textContent=play.textContent==="▶"?"❚❚":"▶";});
document.getElementById("searchInput").addEventListener("input",e=>renderList(e.target.value));
input.addEventListener("keydown",e=>{if(e.key==="Enter"){e.preventDefault(); sendCurrent();}});
document.getElementById("directorBtn").onclick=()=>{refreshSelect(); refreshRuntimeSelect(); document.getElementById("directorPanel").classList.add("open")};
document.getElementById("closePanel").onclick=()=>document.getElementById("directorPanel").classList.remove("open");
document.querySelectorAll("[data-tab]").forEach(b=>b.onclick=()=>{document.querySelectorAll("[data-tab]").forEach(x=>x.classList.remove("active"));document.querySelectorAll(".tab").forEach(x=>x.classList.remove("active")); b.classList.add("active");document.getElementById("tab-"+b.dataset.tab).classList.add("active");});

document.getElementById("createGroupBtn").onclick=()=>{const title=document.getElementById("groupName").value.trim(),members=document.getElementById("groupMembers").value.split(",").map(x=>x.trim()).filter(Boolean),first=document.getElementById("groupFirstMessage").value.trim(); if(!title)return; const id=`runtime-chat-${Date.now()}`; const participants=[{id:state.currentUserId,name:"Emma"},...members.map((name,i)=>({id:`runtime-member-${Date.now()}-${i}`,name}))]; const c={id,title,avatar:String(Math.max(members.length+1,2)),status:`${participants.length} partecipanti`,participants,messages:[],runtime:true}; if(first)c.messages.push({id:runtimeId(),senderId:participants[1]?.id||state.currentUserId,senderName:participants[1]?.name||"Emma",text:first,timestamp:timestampForMessage(c),type:"text",state:"delivered",runtime:true}); chats.unshift(c);save();renderList();openChat(id);document.getElementById("directorPanel").classList.remove("open")};
document.getElementById("incomingBtn").onclick=()=>{const chat=getSceneChat(); if(chat)addMessage(chat,"in","Stiamo già andando, tu dove sei?",chat.participants?.find(p=>p.id!==state.currentUserId)?.name||"",directorTimeValue())};
document.getElementById("typingBtn").onclick=()=>{const chat=getSceneChat(); if(!chat)return; if(!current || current.id!==chat.id)openChat(chat.id); document.getElementById("directorPanel").classList.remove("open"); setTimeout(()=>{const t=appendText(messages,"div","sta scrivendo…","typing"); messages.scrollTop=messages.scrollHeight; setTimeout(()=>t.remove(),2500)},120)};
document.getElementById("incomingAudioBtn").onclick=()=>{const chat=getSceneChat(); if(chat)addMessage(chat,"in","",chat.participants?.find(p=>p.id!==state.currentUserId)?.name||"",directorTimeValue(),true,"0:11")};
document.getElementById("resetBtn").onclick=()=>{const chat=getSceneChat(); if(!chat)return; const seed=initialData.chats.find(item=>item.id===chat.id); if(seed){const resetChat=cloneData(seed); Object.keys(chat).forEach(key=>delete chat[key]); Object.assign(chat, resetChat)}else{chat.messages=chat.messages.filter(message=>!message.runtime)} save(); if(current && current.id===chat.id){current=chat; openChat(chat.id)} renderList(document.getElementById("searchInput").value)};
document.getElementById("deleteRuntimeBtn").onclick=()=>{const chat=getSceneChat(), sel=document.getElementById("runtimeMessageSelect"); if(!chat||!sel.value)return; chat.messages=chat.messages.filter(m=>m.id!==sel.value || !m.runtime); save(); if(current&&current.id===chat.id)renderMessages(); renderList(document.getElementById("searchInput").value)};
function addFromPanel(side){const chat=chats.find(c=>c.id===document.getElementById("messageChat").value),text=document.getElementById("messageText").value.trim(),sender=document.getElementById("messageSender").value.trim(),time=directorTimeValue(); if(chat&&text)addMessage(chat,side,text,sender,time); document.getElementById("messageText").value="";}
document.getElementById("addIncomingBtn").onclick=()=>addFromPanel("in"); document.getElementById("addOutgoingBtn").onclick=()=>addFromPanel("out");
document.getElementById("saveChatBtn").onclick=()=>{if(!current)return;current.title=document.getElementById("editTitle").value;current.status=document.getElementById("editStatus").value;current.avatar=document.getElementById("editAvatar").value||"T";save();renderList();openChat(current.id)};
document.getElementById("clearAllBtn").onclick=()=>{localStorage.removeItem(LEGACY_KEY); resetToInitial(); current=null; renderList(); document.getElementById("chatScreen").classList.remove("active"); document.getElementById("listScreen").classList.add("active"); document.getElementById("directorPanel").classList.remove("open")};
const mic=document.getElementById("micBtn"),recording=document.getElementById("recording");
mic.onclick=()=>{if(!current)return; if(!recTimer){recSeconds=0;input.classList.add("hidden");recording.classList.add("show");mic.textContent="■";recTimer=setInterval(()=>{recSeconds++;document.getElementById("timer").textContent=`${Math.floor(recSeconds/60)}:${String(recSeconds%60).padStart(2,"0")}`},1000)} else{clearInterval(recTimer);recTimer=null;input.classList.remove("hidden");recording.classList.remove("show");mic.textContent="●";addMessage(current,"out","","","",true,`0:${String(Math.max(recSeconds,1)).padStart(2,"0")}`)}};
document.getElementById("cancelRec").onclick=()=>{clearInterval(recTimer);recTimer=null;input.classList.remove("hidden");recording.classList.remove("show");mic.textContent="●"};

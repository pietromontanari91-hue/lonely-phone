const $=id=>document.getElementById(id);
const cloneData = (value) => JSON.parse(JSON.stringify(value));
const callsyContacts = cloneData(CALLSY_CONTACTS);
const defaultCaller = callsyContacts[0] || { name: "Martina", avatar: "M" };
let targetTime=null,scheduler=null,ringTimer=null,activeCallTimer=null,callSeconds=0,audioContext=null;

function showScreen(id){
  document.querySelectorAll(".screen").forEach(s=>s.classList.remove("active"));
  $(id).classList.add("active");
}

function updateClock(){
  const d=new Date();
  const t=d.toLocaleTimeString("it-IT",{hour:"2-digit",minute:"2-digit"});
  $("statusTime").textContent=t;
  $("callStatusTime").textContent=t;
  $("lockClock").textContent=t;
  $("lockDate").textContent=d.toLocaleDateString("it-IT",{weekday:"long",day:"numeric",month:"long"});
}
updateClock();
setInterval(updateClock,30000);
$("callerName").value = defaultCaller.name;
$("callerAvatar").value = defaultCaller.avatar;

function setupCaller(){
  const name=$("callerName").value.trim()||defaultCaller.name;
  const av=$("callerAvatar").value.trim()||defaultCaller.avatar||name.charAt(0).toUpperCase();
  $("incomingName").textContent=name;
  $("callName").textContent=name;
  $("incomingAvatar").textContent=av;
  $("callAvatar").textContent=av;
}

function beep(){
  try{
    audioContext=audioContext||new (window.AudioContext||window.webkitAudioContext)();
    const osc=audioContext.createOscillator();
    const gain=audioContext.createGain();
    osc.frequency.value=640;
    gain.gain.value=.07;
    osc.connect(gain);
    gain.connect(audioContext.destination);
    osc.start();
    osc.stop(audioContext.currentTime+.18);
  }catch(e){}
  if(navigator.vibrate)navigator.vibrate([250,120,250]);
}

function startRinging(){
  clearInterval(scheduler);
  scheduler=null;
  targetTime=null;
  setupCaller();
  showScreen("incoming");
  $("countdown").textContent="Chiamata in corso";
  beep();
  ringTimer=setInterval(beep,1800);
}

function scheduleCall(seconds){
  clearInterval(scheduler);
  targetTime=Date.now()+seconds*1000;
  scheduler=setInterval(()=>{
    const left=Math.max(0,Math.ceil((targetTime-Date.now())/1000));
    $("countdown").textContent=left>0?`Chiamata tra ${left} secondi`:"Chiamata in arrivo";
    if(Date.now()>=targetTime)startRinging();
  },200);
}

function stopRinging(){
  clearInterval(ringTimer);
  ringTimer=null;
  if(navigator.vibrate)navigator.vibrate(0);
}

function startCall(){
  stopRinging();
  showScreen("incall");
  callSeconds=0;
  $("callTimer").textContent="00:00";
  activeCallTimer=setInterval(()=>{
    callSeconds++;
    const m=String(Math.floor(callSeconds/60)).padStart(2,"0");
    const s=String(callSeconds%60).padStart(2,"0");
    $("callTimer").textContent=`${m}:${s}`;
  },1000);
}

function resetAll(){
  clearInterval(scheduler);
  clearInterval(activeCallTimer);
  stopRinging();
  scheduler=null;
  targetTime=null;
  $("countdown").textContent="Nessuna chiamata programmata";
  $("panel").classList.remove("open");
  showScreen("standby");
}

$("directorTrigger").onclick=()=>$("panel").classList.add("open");
$("closePanel").onclick=()=>$("panel").classList.remove("open");
$("armCallBtn").onclick=()=>{
  setupCaller();
  const seconds=Number($("delay").value);
  $("panel").classList.remove("open");
  showScreen("standby");
  scheduleCall(seconds);
};
$("testCallBtn").onclick=()=>{
  $("panel").classList.remove("open");
  startRinging();
};
$("cancelScheduledBtn").onclick=()=>{
  clearInterval(scheduler);
  scheduler=null;
  targetTime=null;
  $("countdown").textContent="Chiamata annullata";
};
$("resetBtn").onclick=resetAll;
$("acceptBtn").onclick=startCall;
$("declineBtn").onclick=()=>{
  stopRinging();
  showScreen("standby");
};
$("endCallBtn").onclick=()=>{
  clearInterval(activeCallTimer);
  showScreen("standby");
};

let taps=0,tapReset=null;
$("standby").addEventListener("pointerup",()=>{
  taps++;
  clearTimeout(tapReset);
  if(taps>=4){
    $("panel").classList.add("open");
    taps=0;
  }
  tapReset=setTimeout(()=>taps=0,1200);
});

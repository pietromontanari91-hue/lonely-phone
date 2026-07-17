const VYBE_STORAGE_KEY = "vybePosts";
const cloneData = (value) => JSON.parse(JSON.stringify(value));
const people = cloneData(VYBE_CONTENT.stories);
let posts = JSON.parse(localStorage.getItem(VYBE_STORAGE_KEY) || "null") || cloneData(VYBE_CONTENT.posts);
const storiesEl = document.getElementById("stories");
const feedEl = document.getElementById("feed");
const toastEl = document.getElementById("toast");
const storyView = document.getElementById("storyView");
const storyImage = document.getElementById("storyImage");

function formatNumber(value){
  return value.toLocaleString("it-IT");
}

function renderStories(){
  storiesEl.innerHTML = people.map(person => `
    <button class="story" data-image="${person.image}" aria-label="Apri storia di ${person.user}">
      <div class="story-ring">
        <div class="avatar" style="background-image:url('${person.image}')"></div>
      </div>
      <span>${person.user}</span>
    </button>
  `).join("");
}

function savePosts(){
  localStorage.setItem(VYBE_STORAGE_KEY, JSON.stringify(posts));
}

function renderFeed(){
  feedEl.innerHTML = posts.map((post,index) => `
    <article class="card glass">
      <div class="card-head">
        <div class="avatar" style="background-image:url('${post.image}')"></div>
        <div class="meta">
          <b>${post.user}</b>
          <small>${post.place}</small>
        </div>
        <span>•••</span>
      </div>

      <div class="media">
        ${post.video
          ? `<video muted loop playsinline autoplay preload="metadata" poster="${post.poster}">
              <source src="${post.video}" type="video/mp4">
            </video>`
          : `<img src="${post.image}" alt="">`}
        <div class="location">${post.place}</div>
        <div class="heart-burst">♥</div>
      </div>

      <div class="actions">
        <button class="action like" aria-label="Mi piace">♡</button>
        <button class="action" aria-label="Commenta">◯</button>
        <button class="action" aria-label="Condividi">↗</button>
        <button class="action save" aria-label="Salva">⌑</button>
      </div>

      <div class="copy">
        <div class="likes">${formatNumber(post.likes)} Mi piace</div>
        <div class="caption"><b>${post.user}</b>${post.caption}</div>
        <div class="comments">Visualizza tutti i ${18 + index * 7} commenti</div>
      </div>
    </article>
  `).join("");
}

function toggleLike(card, forceLike = false){
  const button = card.querySelector(".like");
  const counter = card.querySelector(".likes");
  const isLiked = button.classList.contains("liked");

  if(forceLike && isLiked) return;

  const current = parseInt(counter.textContent.replace(/\D/g,""),10);
  button.classList.toggle("liked");
  button.textContent = button.classList.contains("liked") ? "♥" : "♡";
  counter.textContent =
    formatNumber(button.classList.contains("liked") ? current + 1 : current - 1)
    + " Mi piace";
}

function showToast(){
  toastEl.classList.add("show");
  setTimeout(() => toastEl.classList.remove("show"),1200);
}

function openStory(image){
  storyImage.src = image;
  storyView.classList.add("open");
  setTimeout(closeStory,5000);
}

function closeStory(){
  storyView.classList.remove("open");
}

document.addEventListener("click",event => {
  const like = event.target.closest(".like");
  if(like) toggleLike(like.closest(".card"));

  const save = event.target.closest(".save");
  if(save){
    save.textContent = save.textContent === "⌑" ? "▣" : "⌑";
    showToast();
  }

  const story = event.target.closest(".story");
  if(story) openStory(story.dataset.image);

  if(event.target.id === "storyClose" || event.target.id === "storyView"){
    closeStory();
  }
});


const postPanel = document.getElementById("postPanel");
document.getElementById("createPostBtn").onclick = () => postPanel.classList.add("open");
document.getElementById("closePostPanel").onclick = () => postPanel.classList.remove("open");
document.getElementById("resetPostsBtn").onclick = () => {
  posts = cloneData(VYBE_CONTENT.posts);
  localStorage.removeItem(VYBE_STORAGE_KEY);
  renderFeed();
  observeVideos();
  postPanel.classList.remove("open");
};
document.getElementById("postForm").onsubmit = (event) => {
  event.preventDefault();
  const image = document.getElementById("postImage").value.trim();
  const video = document.getElementById("postVideo").value.trim();
  posts.unshift({
    user: document.getElementById("postUser").value.trim() || "nuovo.user",
    place: document.getElementById("postPlace").value.trim() || "Nuovo luogo",
    image,
    poster: image,
    video: video || undefined,
    caption: document.getElementById("postCaption").value.trim() || "Nuovo post",
    likes: Number(document.getElementById("postLikes").value) || 0
  });
  savePosts();
  renderFeed();
  observeVideos();
  event.target.reset();
  postPanel.classList.remove("open");
};

let lastTap = 0;
document.addEventListener("pointerup",event => {
  const media = event.target.closest(".media");
  if(!media) return;

  const now = Date.now();
  if(now - lastTap < 330){
    const card = media.closest(".card");
    toggleLike(card,true);

    const heart = media.querySelector(".heart-burst");
    heart.classList.remove("show");
    void heart.offsetWidth;
    heart.classList.add("show");
  }
  lastTap = now;
});

renderStories();
renderFeed();

const observer=new IntersectionObserver(entries=>{
 entries.forEach(e=>{
   const v=e.target;
   if(e.isIntersecting){v.play().catch(()=>{});}else{v.pause();}
 });
},{threshold:.6});
function observeVideos(){
 document.querySelectorAll("video").forEach(v=>observer.observe(v));
}
observeVideos();

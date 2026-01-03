let canvas = document.getElementById("targetCanvas");
let ctx = canvas.getContext("2d");

let img = new Image();
let shots = [];
let center = null;
let mode = "shot";
let lang = "ar";

const MAX_FREE_SHOTS = 10;

// حالة الاشتراك
let IS_PRO = localStorage.getItem("shehaby_pro") === "true";

let LANG = null;

fetch("lang.json")
  .then(r => r.json())
  .then(d => {
    LANG = d;
    applyLanguage();
    updateProUI();
  });

/* ---------- اللغة ---------- */

document.getElementById("langToggle").onclick = () => {
  lang = lang === "ar" ? "en" : "ar";
  document.getElementById("langToggle").innerText = lang === "ar" ? "EN" : "AR";
  applyLanguage();
};

function applyLanguage() {
  if (!LANG) return;
  document.getElementById("setCenterBtn").innerText = LANG.ui.setCenter[lang];
  document.getElementById("undoBtn").innerText = LANG.ui.undo[lang];
  document.getElementById("analyzeBtn").innerText = LANG.ui.analyze[lang];
}

/* ---------- صورة الهدف ---------- */

document.getElementById("imageInput").addEventListener("change", e => {
  const file = e.target.files[0];
  if (!file) return;

  img = new Image();
  img.onload = () => {
    canvas.width = img.width;
    canvas.height = img.height;
    redraw();
  };
  img.src = URL.createObjectURL(file);
});

/* ---------- التحكم ---------- */

document.getElementById("setCenterBtn").onclick = () => mode = "center";

document.getElementById("undoBtn").onclick = () => {
  shots.pop();
  redraw();
};

canvas.addEventListener("click", e => {
  if (!img.src) return;

  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;

  const x = (e.clientX - rect.left) * scaleX;
  const y = (e.clientY - rect.top) * scaleY;

  if (mode === "center") {
    center = { x, y };
    mode = "shot";
  } else {
    if (!IS_PRO && shots.length >= MAX_FREE_SHOTS) {
      openUpgrade();
      return;
    }
    shots.push({ x, y });
  }
  redraw();
});

/* ---------- الرسم ---------- */

function redraw() {
  ctx.clearRect(0,0,canvas.width,canvas.height);
  if (img.src) ctx.drawImage(img,0,0,canvas.width,canvas.height);

  if (center) {
    ctx.fillStyle = "red";
    ctx.beginPath();
    ctx.arc(center.x, center.y, 6, 0, Math.PI*2);
    ctx.fill();
  }

  ctx.fillStyle = "blue";
  shots.forEach((s,i)=>{
    ctx.beginPath();
    ctx.arc(s.x, s.y, 4, 0, Math.PI*2);
    ctx.fill();
    ctx.fillText(i+1, s.x+6, s.y);
  });
}

/* ---------- التحليل ---------- */

document.getElementById("analyzeBtn").onclick = () => {
  if (!center || shots.length === 0) return;

  let counts = {left:0,right:0,up:0,down:0};

  shots.forEach(s=>{
    if (s.x < center.x-10) counts.left++;
    if (s.x > center.x+10) counts.right++;
    if (s.y < center.y-10) counts.up++;
    if (s.y > center.y+10) counts.down++;
  });

  let error = Object.keys(counts).reduce((a,b)=>counts[a]>counts[b]?a:b);
  let text = LANG.errors[error][lang];

  if (IS_PRO) {
    text += " — " + LANG.errors[error]["fix_"+lang];
  } else {
    text += " — " + LANG.free.no_fix[lang];
  }

  document.getElementById("analysisText").innerText = text;
};

/* ---------- Pro ---------- */

function openUpgrade() {
  document.getElementById("upgradeOverlay").style.display = "block";
}

function closeUpgrade() {
  document.getElementById("upgradeOverlay").style.display = "none";
}

document.getElementById("activateProBtn").onclick = () => {
  const code = document.getElementById("proCodeInput").value.trim();
  if (code === "SHEHABY2024") {
    localStorage.setItem("shehaby_pro", "true");
    IS_PRO = true;
    closeUpgrade();
    updateProUI();
    alert("تم تفعيل النسخة الاحترافية بنجاح");
  } else {
    alert("كود غير صحيح");
  }
};

function updateProUI() {
  document.getElementById("proBadge").style.display = IS_PRO ? "inline-block" : "none";
}

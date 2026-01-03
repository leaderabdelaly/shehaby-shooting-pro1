/* ==============================
   Shehaby Shooting Pro
   app.js – Mobile & Desktop Fixed
   ============================== */

const targetInput = document.getElementById("targetInput");
const targetImg = document.getElementById("targetImg");
const targetContainer = document.getElementById("targetContainer");
const analyzeBtn = document.getElementById("analyzeBtn");
const resultBox = document.getElementById("result");

let shots = [];
let centerPoint = null;

/* ==============================
   Helpers
   ============================== */

function getScaledPosition(event) {
  const rect = targetImg.getBoundingClientRect();

  const scaleX = targetImg.naturalWidth / rect.width;
  const scaleY = targetImg.naturalHeight / rect.height;

  const clientX = event.touches ? event.touches[0].clientX : event.clientX;
  const clientY = event.touches ? event.touches[0].clientY : event.clientY;

  const x = (clientX - rect.left) * scaleX;
  const y = (clientY - rect.top) * scaleY;

  return { x, y, scaleX, scaleY };
}

function drawDot(x, y, className) {
  const rect = targetImg.getBoundingClientRect();

  const scaleX = targetImg.naturalWidth / rect.width;
  const scaleY = targetImg.naturalHeight / rect.height;

  const dot = document.createElement("div");
  dot.className = className;

  dot.style.left = `${x / scaleX}px`;
  dot.style.top = `${y / scaleY}px`;

  targetContainer.appendChild(dot);
}

/* ==============================
   Load Target Image
   ============================== */

targetInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    targetImg.src = reader.result;
    targetImg.style.display = "block";
    resetAll();
  };
  reader.readAsDataURL(file);
});

function resetAll() {
  shots = [];
  centerPoint = null;
  resultBox.innerHTML = "";
  document.querySelectorAll(".shot, .center").forEach(el => el.remove());
}

/* ==============================
   Set Center Point
   ============================== */

targetImg.addEventListener("dblclick", setCenter);
targetImg.addEventListener("touchstart", (e) => {
  if (e.touches.length === 2) {
    setCenter(e);
  }
});

function setCenter(event) {
  event.preventDefault();
  if (!targetImg.src) return;

  document.querySelectorAll(".center").forEach(el => el.remove());

  const pos = getScaledPosition(event);
  centerPoint = { x: pos.x, y: pos.y };

  drawDot(pos.x, pos.y, "center");
}

/* ==============================
   Add Shot
   ============================== */

targetImg.addEventListener("click", addShot);
targetImg.addEventListener("touchend", addShot);

function addShot(event) {
  if (!targetImg.src || !centerPoint) return;

  const pos = getScaledPosition(event);

  shots.push({ x: pos.x, y: pos.y });

  drawDot(pos.x, pos.y, "shot");
}

/* ==============================
   Analysis
   ============================== */

analyzeBtn.addEventListener("click", analyzeShots);

function analyzeShots() {
  if (!centerPoint || shots.length === 0) {
    resultBox.innerHTML = "❌ حدد مركز الهدف والطلقات أولاً";
    return;
  }

  let dx = 0;
  let dy = 0;

  shots.forEach(s => {
    dx += s.x - centerPoint.x;
    dy += s.y - centerPoint.y;
  });

  dx /= shots.length;
  dy /= shots.length;

  let direction = "";

  if (Math.abs(dx) < 10 && Math.abs(dy) < 10) {
    direction = "تجميع ممتاز في المركز";
  } else if (dx > 0 && dy < 0) {
    direction = "يمين أعلى – شد زائد بالسبابة";
  } else if (dx < 0 && dy < 0) {
    direction = "يسار أعلى – رفع المعصم";
  } else if (dx > 0 && dy > 0) {
    direction = "يمين أسفل – جذب بالراحة";
  } else if (dx < 0 && dy > 0) {
    direction = "يسار أسفل – ضعف تثبيت";
  } else if (dx > 0) {
    direction = "يمين – ضغط جانبي";
  } else if (dx < 0) {
    direction = "يسار – لف القبضة";
  } else if (dy < 0) {
    direction = "أعلى – رفع الرأس";
  } else if (dy > 0) {
    direction = "أسفل – كسر المعصم";
  }

  resultBox.innerHTML = `
    <h3>نتيجة التحليل</h3>
    <p>عدد الطلقات: ${shots.length}</p>
    <p><strong>الخطأ الغالب:</strong> ${direction}</p>
  `;
}

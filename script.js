/* State & Storage */
const STORAGE_KEYS = {
  energy: "kitty_energy",
  history: "kitty_history",
  armedBox: "kitty_armed_box",
  pools: "kitty_pools"
};

const BOX_COSTS = { sweet: 10, heart: 25, romance: 50 };

let POOLS = {
  sweet: [
    "早安拥抱券", "夸夸卡×3", "随机自拍一张", "甜甜语音留言",
    "Hello Kitty贴纸包", "晚安读故事", "专属表情包制作",
    "5分钟按摩券", "选择今晚小零食权"
  ],
  heart: [
    "奶茶一杯", "一起看电影之夜", "选口红色号权",
    "周末小出游计划", "花束一束", "Hello Kitty抱枕",
    "精心做一顿饭", "甜蜜相册10张打印"
  ],
  romance: [
    "烛光晚餐", "专属约会日（你定主题）", "手写情书+视频",
    "定制相册&纪念册", "惊喜盲行程", "高质量写真拍摄",
    "主题房布置（Hello Kitty风）"
  ]
};

let energy = 0;
let drawHistory = [];
let armedBox = null; // sweet | heart | romance | null

/* Utils */
const $ = (sel, parent = document) => parent.querySelector(sel);
const $$ = (sel, parent = document) => Array.from(parent.querySelectorAll(sel));
const now = () => new Date();
const formatTime = (d) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;

function loadState() {
  energy = Number(localStorage.getItem(STORAGE_KEYS.energy) || 0);
  try {
    drawHistory = JSON.parse(localStorage.getItem(STORAGE_KEYS.history) || "[]");
  } catch { drawHistory = []; }
  armedBox = localStorage.getItem(STORAGE_KEYS.armedBox) || null;
  try {
    const savedPools = JSON.parse(localStorage.getItem(STORAGE_KEYS.pools) || "null");
    if (savedPools && typeof savedPools === "object") POOLS = savedPools;
  } catch {}
}

function saveState() {
  localStorage.setItem(STORAGE_KEYS.energy, String(energy));
  localStorage.setItem(STORAGE_KEYS.history, JSON.stringify(drawHistory));
  if (armedBox) localStorage.setItem(STORAGE_KEYS.armedBox, armedBox); else localStorage.removeItem(STORAGE_KEYS.armedBox);
  localStorage.setItem(STORAGE_KEYS.pools, JSON.stringify(POOLS));
}

function renderEnergy() { 
  const energyEl = $("#energy-value");
  if (energyEl) {
    energyEl.textContent = String(energy);
    // 添加动画效果
    energyEl.classList.remove('energy-ping');
    void energyEl.offsetWidth; // 强制重排
    energyEl.classList.add('energy-ping');
  }
  
  // 更新能量条
  const energyFill = $(".energy-fill");
  if (energyFill) {
    const percentage = Math.min(100, (energy / 999) * 100);
    energyFill.style.width = percentage + '%';
  }
  
  // 更新能量条的 aria 属性
  const energyBar = $(".energy-bar");
  if (energyBar) {
    energyBar.setAttribute('aria-valuenow', String(energy));
  }
}

function renderHistory() {
  const list = $("#history-list");
  if (!list) return; // 如果元素不存在，直接返回（可能在其他页面）
  
  list.innerHTML = "";
  drawHistory.slice().reverse().forEach(item => {
    const li = document.createElement("li");
    li.className = "history-item";
    li.innerHTML = `
      <span class="tag">${item.boxLabel}</span>
      <div>
        <div>${item.reward}</div>
        <div class="muted" style="margin-top:2px;">${item.time}</div>
      </div>
      <span class="muted">${item.cost ? ('- ' + item.cost) : ''}</span>
    `;
    list.appendChild(li);
  });
}

/* Energy */
function addEnergy(amount, note) {
  const add = Number(amount) || 0;
  if (add <= 0) {
    console.log('Invalid energy amount:', amount);
    return;
  }
  
  console.log('Adding energy:', add, 'note:', note);
  energy += add;
  
  // 记录到历史
  drawHistory.push({
    box: "energy",
    boxLabel: "恋爱能量",
    reward: note ? `+${add}｜${note}` : `+${add}`,
    cost: 0,
    time: formatTime(now())
  });
  
  saveState();
  renderEnergy();
  renderHistory();
  
  console.log('Current energy:', energy);
}

/* Draw Logic */
function draw(boxKey) {
  const cost = BOX_COSTS[boxKey];
  if (energy < cost) {
    vibrate(120);
    toast(`能量不足，需要 ${cost}`);
    return null;
  }
  energy -= cost;
  renderEnergy();
  const pool = POOLS[boxKey];
  const reward = pool[Math.floor(Math.random() * pool.length)];
  const record = {
    box: boxKey,
    boxLabel: boxLabel(boxKey),
    reward,
    cost,
    time: formatTime(now())
  };
  drawHistory.push(record);
  saveState();
  renderHistory();
  return record;
}

function boxLabel(key) {
  if (key === "sweet") return "甜心小确幸";
  if (key === "heart") return "心动宝贝";
  return "浪漫时光盒子";
}

/* UI helpers */
function toast(msg) {
  const div = document.createElement("div");
  div.textContent = msg;
  Object.assign(div.style, {
    position: "fixed", left: "50%", top: "16px", transform: "translateX(-50%)",
    background: "#000", color: "#fff", padding: "8px 12px", borderRadius: "999px",
    opacity: "0.9", zIndex: 1000, fontSize: "12px"
  });
  document.body.appendChild(div);
  setTimeout(() => div.remove(), 1600);
}

function vibrate(ms) { if (navigator.vibrate) try { navigator.vibrate(ms); } catch {} }

/* Reveal */
const revealDialog = $("#reveal-dialog");
const revealContent = $("#reveal-content");
const revealTitle = $("#reveal-title");
let revealNextDrawKey = null;

function openReveal(record) {
  revealTitle.textContent = `${record.boxLabel} · 恭喜获得`;
  revealContent.innerHTML = `
    <div style="display:grid;gap:8px;justify-items:center;">
      <div style="font-size:40px;">🎁</div>
      <div style="font-weight:700;color:#ff3d8f;">${record.reward}</div>
      <div class="muted">消耗能量 ${record.cost}</div>
    </div>
  `;
  fireConfetti();
  if (!revealDialog.open) revealDialog.showModal();
}

/* Confetti */
function fireConfetti() {
  const layer = $("#confetti-layer");
  const canvas = document.createElement("canvas");
  canvas.width = window.innerWidth; canvas.height = window.innerHeight;
  canvas.style.position = "absolute"; canvas.style.inset = 0;
  layer.appendChild(canvas);
  const ctx = canvas.getContext("2d");
  const pieces = Array.from({ length: 180 }).map(() => ({
    x: Math.random() * canvas.width,
    y: -20 - Math.random() * canvas.height * 0.3,
    w: 6 + Math.random() * 6,
    h: 10 + Math.random() * 10,
    vy: 1 + Math.random() * 3,
    vx: -1 + Math.random() * 2,
    r: Math.random() * Math.PI,
    vr: -0.2 + Math.random() * 0.4,
    color: ["#ff3d8f", "#ff6fa8", "#ffd6e7", "#f7b500", "#a0e7e5"][Math.floor(Math.random()*5)]
  }));
  let start = performance.now();
  function frame(t) {
    const dt = Math.min(32, t - start); start = t;
    ctx.clearRect(0,0,canvas.width,canvas.height);
    pieces.forEach(p => {
      p.x += p.vx; p.y += p.vy; p.r += p.vr * (dt/16);
      if (p.y > canvas.height + 20) { p.y = -20; p.x = Math.random()*canvas.width; }
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r);
      ctx.fillStyle = p.color; ctx.fillRect(-p.w/2, -p.h/2, p.w, p.h);
      ctx.restore();
    });
    raf = requestAnimationFrame(frame);
  }
  let raf = requestAnimationFrame(frame);
  setTimeout(() => { cancelAnimationFrame(raf); canvas.remove(); }, 2200);
}

/* Shake detection */
// Removed shake detection; switch to multi-tap progress

/* Box interactions */
function performDrawWithAnimation(key) {
  console.log('performDrawWithAnimation called with key:', key);
  const card = document.querySelector(`.box-card[data-box="${key}"]`);
  console.log('card found:', card);
  const box3d = card ? $(".box-3d", card) : null;
  console.log('box3d found:', box3d);
  if (!box3d) {
    console.error('box3d not found');
    return;
  }
  
  setTimeout(() => box3d.classList.add("open"), 120);
  const record = draw(key);
  console.log('draw result:', record);
  
  if (record) {
    setTimeout(() => openReveal(record), 400);
  } else {
    // not enough energy
    setTimeout(() => { 
      if (box3d) box3d.classList.remove("open"); 
    }, 500);
  }
}

// Multi-tap to open: require N taps within time to trigger draw
const TAP_REQUIRE = { sweet: 1, heart: 1, romance: 1 }; // 改为单击即可
const TAP_WINDOW_MS = 1400;
const DECAY_INTERVAL = 300; // ms
const tapState = { sweet: { c:0,t:0 }, heart: { c:0,t:0 }, romance: { c:0,t:0 } };

function bindTapProgress() {
  console.log('bindTapProgress called');
  const boxes = $$(".box-card");
  console.log('Found boxes:', boxes.length);
  
  boxes.forEach(card => {
    const key = card.dataset.box;
    console.log('Binding box:', key);
    
    const progressEl = document.querySelector(`.tap-progress[data-box="${key}"]`);
    const req = TAP_REQUIRE[key] || 1;
    
    const updateBar = () => {
      const ratio = Math.min(1, tapState[key].c / req);
      progressEl && (progressEl.style.setProperty('--tap', `${Math.round(ratio*100)}%`));
    };
    
    const reset = () => { 
      tapState[key].c = 0; 
      tapState[key].t = 0; 
      updateBar(); 
    };
    
    const clickTarget = $(".box-3d", card);
    if (!clickTarget) {
      console.error('clickTarget not found for', key);
      return;
    }
    
    console.log('Adding click listener to', key);
    clickTarget.addEventListener("click", (e) => {
      console.log('Click detected on', key);
      e.preventDefault();
      e.stopPropagation();
      
      const nowT = Date.now();
      if (!tapState[key].t || nowT - tapState[key].t > TAP_WINDOW_MS) tapState[key].c = 0;
      tapState[key].t = nowT; 
      tapState[key].c += 1; 
      updateBar();
      spawnHearts(clickTarget);
      
      console.log(`Tap count for ${key}: ${tapState[key].c}/${req}`);
      
      if (tapState[key].c >= req) { 
        reset(); 
        performDrawWithAnimation(key); 
      }
    });
    // decay over time
    setInterval(() => {
      if (!tapState[key].t) return;
      if (Date.now() - tapState[key].t > DECAY_INTERVAL && tapState[key].c > 0) {
        tapState[key].c = Math.max(0, tapState[key].c - 0.2);
        updateBar();
      }
    }, DECAY_INTERVAL);
  });
}

function spawnHearts(anchorEl) {
  const layer = document.createElement('div');
  layer.className = 'heart-layer';
  anchorEl.appendChild(layer);
  const count = 8;
  for (let i = 0; i < count; i++) {
    const s = document.createElement('div');
    s.textContent = '❤';
    s.style.position = 'absolute';
    s.style.left = '50%'; s.style.top = '60%';
    s.style.transform = `translate(-50%, -50%) scale(${0.6 + Math.random()*0.8})`;
    s.style.color = ['#ff3d8f','#ff6fa8','#ffd6e7'][Math.floor(Math.random()*3)];
    s.style.opacity = '0.9';
    layer.appendChild(s);
    const dx = (Math.random()*120 - 60);
    const dy =  - (60 + Math.random()*80);
    const duration = 600 + Math.random()*500;
    const start = performance.now();
    const anim = (t) => {
      const p = Math.min(1, (t - start)/duration);
      s.style.transform = `translate(${dx*p}px, ${dy*p}px) scale(${1-p*0.2})`;
      s.style.opacity = String(0.9*(1-p));
      if (p < 1) requestAnimationFrame(anim); else s.remove();
    };
    requestAnimationFrame(anim);
  }
  setTimeout(() => layer.remove(), 1200);
}

/* Bindings */
function bind() {
  // 补给站添加能量
  const btnAddCustom = $("#btn-add-custom");
  if (btnAddCustom) {
    btnAddCustom.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      const energyInput = $("#custom-energy");
      const noteInput = $("#custom-note");
      
      if (!energyInput) {
        console.error('Energy input not found');
        return;
      }
      
      const v = Number(energyInput.value || 0);
      const note = noteInput ? noteInput.value.trim() : "";
      
      if (v <= 0) {
        toast("请输入有效的能量值");
        return;
      }
      
      addEnergy(v, note || "能量补给");
      energyInput.value = "";
      if (noteInput) noteInput.value = "";
      
      toast(`成功添加 ${v} 能量！`);
    });
    
    // 支持回车键提交
    const energyInput = $("#custom-energy");
    const noteInput = $("#custom-note");
    
    if (energyInput) {
      energyInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          btnAddCustom.click();
        }
      });
    }
    
    if (noteInput) {
      noteInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          btnAddCustom.click();
        }
      });
    }
  } else {
    console.error('btn-add-custom not found');
  }

  // Draw buttons
  $$(".btn-draw").forEach(btn => btn.addEventListener("click", () => {
    const key = btn.dataset.box; performDrawWithAnimation(key);
    revealNextDrawKey = key;
  }));

  // Arm removed

  // 移除重复的点击事件绑定，使用 bindTapProgress 中的多点击系统

  // Reveal actions
  $("#btn-close-reveal").addEventListener("click", () => revealDialog.close());
  $("#btn-draw-again").addEventListener("click", (e) => { e.preventDefault(); if (revealNextDrawKey) performDrawWithAnimation(revealNextDrawKey); });

  // History
  const btnClearHistory = $("#btn-clear-history");
  if (btnClearHistory) {
    btnClearHistory.addEventListener("click", () => { 
      drawHistory = []; 
      saveState(); 
      renderHistory(); 
    });
  }

  // Help dialog
  const help = $("#help-dialog");
  if ($("#btn-help")) {
    $("#btn-help").addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (help && typeof help.showModal === 'function') {
        help.showModal();
      } else if (help) {
        help.style.display = 'block';
      }
    });
  }

  // Settings
  if ($("#btn-settings")) {
    $("#btn-settings").addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      openSettings();
    });
  }
  const btnSavePools = $("#btn-save-pools");
  const btnResetPools = $("#btn-reset-pools");
  const btnPreviewPools = $("#btn-preview-pools");
  
  if (btnSavePools) btnSavePools.addEventListener("click", onSavePools);
  if (btnResetPools) btnResetPools.addEventListener("click", onResetPools);
  if (btnPreviewPools) btnPreviewPools.addEventListener("click", onPreviewPools);
}

/* 计算在一起的天数 */
function calculateDaysTogether() {
  // 在一起的日期：2023年1月24日
  const startDate = new Date('2023-01-24');
  const today = new Date();
  
  // 重置时间为0点，只计算天数差异
  startDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  
  // 计算天数差
  const diffTime = today - startDate;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
}

function updateDaysDisplay() {
  const daysElement = $("#days-count");
  if (daysElement) {
    const days = calculateDaysTogether();
    daysElement.textContent = days.toString();
    console.log('在一起天数:', days);
  }
}

/* Init */
function init() {
  loadState();
  renderEnergy();
  renderHistory();
  updateDaysDisplay(); // 更新在一起天数
  bind();
  bindTapProgress();
}


document.addEventListener("DOMContentLoaded", init);

/* Settings logic */
function openSettings() {
  const dlg = document.getElementById("settings-dialog");
  if (!dlg) return;
  
  const tSweet = document.getElementById("pool-sweet");
  const tHeart = document.getElementById("pool-heart");
  const tRom = document.getElementById("pool-romance");
  
  if (tSweet) tSweet.value = (POOLS.sweet || []).join("\n");
  if (tHeart) tHeart.value = (POOLS.heart || []).join("\n");
  if (tRom) tRom.value = (POOLS.romance || []).join("\n");
  
  if (typeof dlg.showModal === 'function') {
    dlg.showModal();
  } else {
    dlg.style.display = 'block';
  }
}

function onSavePools(e) {
  // Form uses method=dialog; keep default to close
  const tSweet = document.getElementById("pool-sweet").value;
  const tHeart = document.getElementById("pool-heart").value;
  const tRom = document.getElementById("pool-romance").value;
  const parse = (s) => s.split(/\r?\n/).map(x => x.trim()).filter(Boolean);
  const next = {
    sweet: parse(tSweet),
    heart: parse(tHeart),
    romance: parse(tRom)
  };
  if (!next.sweet.length || !next.heart.length || !next.romance.length) {
    e.preventDefault();
    toast("请至少为每个盲盒填写一条奖励");
    return;
  }
  POOLS = next;
  saveState();
  toast("已保存自定义奖池");
}

function onResetPools(e) {
  e.preventDefault();
  POOLS = {
    sweet: [
      "早安拥抱券", "夸夸卡×3", "随机自拍一张", "甜甜语音留言",
      "Hello Kitty贴纸包", "晚安读故事", "专属表情包制作",
      "5分钟按摩券", "选择今晚小零食权"
    ],
    heart: [
      "奶茶一杯", "一起看电影之夜", "选口红色号权",
      "周末小出游计划", "花束一束", "Hello Kitty抱枕",
      "精心做一顿饭", "甜蜜相册10张打印"
    ],
    romance: [
      "烛光晚餐", "专属约会日（你定主题）", "手写情书+视频",
      "定制相册&纪念册", "惊喜盲行程", "高质量写真拍摄",
      "主题房布置（Hello Kitty风）"
    ]
  };
  saveState();
  openSettings();
  toast("已恢复默认奖池");
}

function onPreviewPools(e) {
  e.preventDefault();
  // Use current textarea values without saving
  const parse = (s) => s.split(/\r?\n/).map(x => x.trim()).filter(Boolean);
  const sweet = parse(document.getElementById("pool-sweet").value);
  const heart = parse(document.getElementById("pool-heart").value);
  const romance = parse(document.getElementById("pool-romance").value);
  const sample = (arr) => arr.length ? arr[Math.floor(Math.random()*arr.length)] : "(空)";
  const lines = [
    `甜心小确幸：${Array.from({length:5}).map(()=>sample(sweet)).join("、")}`,
    `心动宝贝：${Array.from({length:5}).map(()=>sample(heart)).join("、")}`,
    `浪漫时光盒子：${Array.from({length:5}).map(()=>sample(romance)).join("、")}`
  ];
  toast(lines.join(" \n "));
}



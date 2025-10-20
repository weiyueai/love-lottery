const STORAGE_KEYS = {
  history: "kitty_history"
};

const $ = (sel, parent = document) => parent.querySelector(sel);
const $$ = (sel, parent = document) => Array.from(parent.querySelectorAll(sel));

function loadHistory() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.history) || "[]");
  } catch { return []; }
}

function renderHistoryList(items) {
  const list = $("#history-list");
  list.innerHTML = "";
  if (!items.length) {
    const div = document.createElement('div');
    div.className = 'empty';
    div.textContent = '这里还没有记录，去抽一个小惊喜吧~';
    list.appendChild(div);
    return;
  }
  items.slice().reverse().forEach((item, idx) => {
    const li = document.createElement("li");
    li.className = "history-item";
    li.innerHTML = `
      <span class="tag ${tagClass(item.box)}">${emoji(item.box)} ${item.boxLabel}</span>
      <div>
        <div class="text">${escapeHtml(item.reward||'')}</div>
        <div class="history-actions-inline">
          <button class="btn ghost mini" data-action="edit" data-id="${item._id||''}">编辑 ✏️</button>
          <button class="btn ghost mini" data-action="delete" data-id="${item._id||''}">删除 🗑️</button>
        </div>
      </div>
      <span class="muted right">${item.time}${item.cost ? `<br>- ${item.cost}` : ''}</span>
    `;
    list.appendChild(li);
  });
  bindRowActions();
}

function tagClass(box) {
  if (box === 'sweet') return 'sweet';
  if (box === 'heart') return 'heart';
  if (box === 'romance') return 'romance';
  if (box === 'energy') return 'energy';
  return '';
}

function emoji(box) {
  if (box === 'sweet') return '🍬';
  if (box === 'heart') return '💘';
  if (box === 'romance') return '🌹';
  if (box === 'energy') return '🔋';
  return '✨';
}

function exportCsv(items) {
  const headers = ["时间","类型","内容","消耗"];
  const rows = items.map(i => [i.time, i.boxLabel, (i.reward||'').replaceAll('\n',' '), i.cost||0]);
  const csv = [headers, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(",")).join("\r\n");
  const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = 'kitty-history.csv'; a.click(); URL.revokeObjectURL(url);
}

function bind(items) {
  $("#btn-clear-history").addEventListener("click", () => { localStorage.setItem(STORAGE_KEYS.history, "[]"); renderHistoryList([]); });
  $("#btn-export").addEventListener("click", () => exportCsv(items));
  $("#manual-add").addEventListener("click", onManualAdd);
  
  // 登出按钮
  const logoutBtn = $("#btn-logout");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", (e) => {
      e.preventDefault();
      if (confirm('确定要退出登录吗？\n退出后需要重新输入密码才能访问。')) {
        sessionStorage.removeItem('kitty_logged_in');
        sessionStorage.removeItem('kitty_password');
        window.location.href = 'login.html';
      }
    });
  }
}

function bindRowActions() {
  $$("[data-action='edit']").forEach(btn => btn.addEventListener('click', () => {
    const id = btn.getAttribute('data-id');
    const items = loadHistory();
    const idx = findIndexById(items, id);
    if (idx === -1) return;
    const current = items[idx];
    const next = prompt('修改内容（点滴/奖励）：', current.reward || '');
    if (next == null) return;
    items[idx] = { ...current, reward: next };
    saveHistory(items);
    renderHistoryList(items);
  }));
  $$("[data-action='delete']").forEach(btn => btn.addEventListener('click', () => {
    const id = btn.getAttribute('data-id');
    let items = loadHistory();
    const idx = findIndexById(items, id);
    if (idx === -1) return;
    if (!confirm('确认删除这条记忆吗？')) return;
    items.splice(idx, 1);
    saveHistory(items);
    renderHistoryList(items);
  }));
}

function saveHistory(items) {
  localStorage.setItem(STORAGE_KEYS.history, JSON.stringify(items));
}

function ensureIds(items) {
  let changed = false;
  items.forEach(it => { if (!it._id) { it._id = `${Date.now()}_${Math.random().toString(36).slice(2,8)}`; changed = true; } });
  if (changed) saveHistory(items);
  return items;
}

function findIndexById(items, id) {
  if (!id) return -1;
  return items.findIndex(it => it._id === id);
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
}

document.addEventListener("DOMContentLoaded", () => {
  // 检查登录状态
  const isLoggedIn = sessionStorage.getItem('kitty_logged_in') === 'true';
  if (!isLoggedIn) {
    window.location.href = 'login.html';
    return;
  }
  
  const items = ensureIds(loadHistory());
  renderHistoryList(items);
  bind(items);
});

function onManualAdd() {
  const type = (document.getElementById('manual-type').value || 'sweet');
  const content = (document.getElementById('manual-content').value || '').trim();
  const cost = Number(document.getElementById('manual-cost').value || 0) || 0;
  const timeStr = document.getElementById('manual-time').value;
  if (!content) { alert('请填写内容'); return; }
  const items = ensureIds(loadHistory());
  const now = new Date();
  const dt = timeStr ? new Date(timeStr) : now;
  const record = {
    _id: `${Date.now()}_${Math.random().toString(36).slice(2,8)}`,
    box: type,
    boxLabel: type === 'sweet' ? '甜心小确幸' : type === 'heart' ? '心动宝贝' : type === 'romance' ? '浪漫时光盒子' : '恋爱能量',
    reward: content,
    cost: cost,
    time: `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,'0')}-${String(dt.getDate()).padStart(2,'0')} ${String(dt.getHours()).padStart(2,'0')}:${String(dt.getMinutes()).padStart(2,'0')}:${String(dt.getSeconds()).padStart(2,'0')}`
  };
  items.push(record);
  saveHistory(items);
  renderHistoryList(items);
  document.getElementById('manual-content').value = '';
  document.getElementById('manual-cost').value = '';
}



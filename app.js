const STORAGE_KEY = "baby-food-allergy-tracker";

const state = {
  baby: null,
  foods: [],
  symptoms: [],
};

const el = {
  babyForm: document.getElementById("baby-form"),
  babyName: document.getElementById("baby-name"),
  babyBirthday: document.getElementById("baby-birthday"),
  babyHistory: document.getElementById("baby-history"),
  babySummary: document.getElementById("baby-summary"),
  foodForm: document.getElementById("food-form"),
  foodName: document.getElementById("food-name"),
  foodDate: document.getElementById("food-date"),
  foodAmount: document.getElementById("food-amount"),
  foodRisk: document.getElementById("food-risk"),
  symptomForm: document.getElementById("symptom-form"),
  symptomFood: document.getElementById("symptom-food"),
  symptomDate: document.getElementById("symptom-date"),
  symptomNote: document.getElementById("symptom-note"),
  symptomSeverity: document.getElementById("symptom-severity"),
  board: document.getElementById("board"),
  stats: document.getElementById("stats"),
  exportBtn: document.getElementById("export-btn"),
  seedBtn: document.getElementById("seed-btn"),
  resetBtn: document.getElementById("reset-btn"),
};

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function load() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return;
  const parsed = JSON.parse(raw);
  state.baby = parsed.baby || null;
  state.foods = parsed.foods || [];
  state.symptoms = parsed.symptoms || [];
}

function formatDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function getAgeMonths(birthday) {
  if (!birthday) return "";
  const born = new Date(birthday);
  const today = new Date();
  let months = (today.getFullYear() - born.getFullYear()) * 12 + today.getMonth() - born.getMonth();
  if (today.getDate() < born.getDate()) months -= 1;
  return `${Math.max(months, 0)} 月龄`;
}

function symptomLevelRank(level) {
  return { 无异常: 0, 轻微: 1, 中等: 2, 严重: 3 }[level] ?? 0;
}

function overallStatus(foodId) {
  const linked = state.symptoms.filter((s) => s.foodId === foodId);
  const maxRank = linked.reduce((acc, cur) => Math.max(acc, symptomLevelRank(cur.severity)), 0);
  if (maxRank >= 3) return "建议立即停用并就医";
  if (maxRank === 2) return "暂停并咨询儿科医生";
  if (maxRank === 1) return "继续观察，暂不加量";
  return "可按计划逐步加量";
}

function riskClass(risk) {
  if (risk === "高") return "high";
  if (risk === "中") return "mid";
  return "low";
}

function renderBaby() {
  if (!state.baby) {
    el.babySummary.textContent = "尚未保存宝宝档案";
    return;
  }
  el.babySummary.textContent = `宝宝：${state.baby.name}｜${getAgeMonths(state.baby.birthday)}｜既往史：${state.baby.history || "无"}`;
}

function renderFoodOptions() {
  const options = state.foods.map((food) => `<option value="${food.id}">${food.name}</option>`).join("");
  el.symptomFood.innerHTML = options || `<option value="">请先添加食材</option>`;
}

function renderStats() {
  const severeCount = state.symptoms.filter((s) => symptomLevelRank(s.severity) >= 2).length;
  const done3Days = state.foods.filter((f) => state.symptoms.filter((s) => s.foodId === f.id).length >= 3).length;
  el.stats.innerHTML = `
    <article class="stat"><div class="label">食材总数</div><div class="value">${state.foods.length}</div></article>
    <article class="stat"><div class="label">观察记录</div><div class="value">${state.symptoms.length}</div></article>
    <article class="stat"><div class="label">≥中等反应</div><div class="value">${severeCount}</div></article>
    <article class="stat"><div class="label">完成3天观察</div><div class="value">${done3Days}</div></article>
  `;
}

function renderBoard() {
  if (!state.foods.length) {
    el.board.innerHTML = `<p class="muted">暂无食材记录。你可以点击“填充示例”快速查看界面效果。</p>`;
    return;
  }

  el.board.innerHTML = state.foods
    .map((food) => {
      const notes = state.symptoms
        .filter((s) => s.foodId === food.id)
        .sort((a, b) => a.date.localeCompare(b.date));
      const observeRate = Math.min((notes.length / 3) * 100, 100);
      const status = overallStatus(food.id);

      return `
      <article class="food-item">
        <div class="food-top">
          <h3>${food.name}</h3>
          <span class="tag ${riskClass(food.risk)}">${food.risk}风险</span>
        </div>
        <div class="tags">
          <span class="tag">首试：${formatDate(food.date)}</span>
          <span class="tag">份量：${food.amount}</span>
          <span class="tag">建议：${status}</span>
        </div>
        <div class="progress" title="3天观察进度"><span style="width: ${observeRate}%"></span></div>
        ${
          notes.length
            ? `<ul class="timeline">${notes.map((s) => `<li>${formatDate(s.date)}｜${s.severity}｜${s.note}</li>`).join("")}</ul>`
            : `<p class="muted">暂无观察记录</p>`
        }
      </article>`;
    })
    .join("");
}

function rerender() {
  renderBaby();
  renderFoodOptions();
  renderStats();
  renderBoard();
}

function addFood(food) {
  state.foods.push(food);
  save();
  rerender();
}

function addSymptom(record) {
  state.symptoms.push(record);
  save();
  rerender();
}

function fillDemoData() {
  if (state.foods.length || state.symptoms.length || state.baby) {
    alert("已有数据，请先清空后再填充示例。");
    return;
  }

  state.baby = { name: "小米", birthday: "2025-06-15", history: "轻度湿疹" };
  state.foods = [
    { id: "food-1", name: "南瓜泥", date: "2026-03-20", amount: "1 茶匙", risk: "低" },
    { id: "food-2", name: "鸡蛋黄", date: "2026-03-23", amount: "1/4 茶匙", risk: "中" },
  ];
  state.symptoms = [
    { foodId: "food-1", date: "2026-03-20", note: "无异常", severity: "无异常" },
    { foodId: "food-1", date: "2026-03-21", note: "无异常", severity: "无异常" },
    { foodId: "food-2", date: "2026-03-23", note: "嘴角轻微红", severity: "轻微" },
  ];

  save();
  rerender();
}

el.babyForm.addEventListener("submit", (event) => {
  event.preventDefault();
  state.baby = {
    name: el.babyName.value.trim(),
    birthday: el.babyBirthday.value,
    history: el.babyHistory.value.trim(),
  };
  save();
  rerender();
  el.babyForm.reset();
});

el.foodForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const food = {
    id: `food-${Date.now()}`,
    name: el.foodName.value.trim(),
    date: el.foodDate.value,
    amount: el.foodAmount.value.trim(),
    risk: el.foodRisk.value,
  };
  addFood(food);
  el.foodForm.reset();
});

el.symptomForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!el.symptomFood.value) {
    alert("请先添加食材");
    return;
  }
  const symptom = {
    foodId: el.symptomFood.value,
    date: el.symptomDate.value,
    note: el.symptomNote.value.trim(),
    severity: el.symptomSeverity.value,
  };
  addSymptom(symptom);
  el.symptomForm.reset();
});

el.seedBtn.addEventListener("click", fillDemoData);

el.exportBtn.addEventListener("click", () => {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `baby-food-record-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
});

el.resetBtn.addEventListener("click", () => {
  if (!confirm("确定清空所有数据？此操作不可撤销。")) return;
  state.baby = null;
  state.foods = [];
  state.symptoms = [];
  save();
  rerender();
});

load();
rerender();

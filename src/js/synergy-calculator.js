/**
 * NeuroGen × SetHubble — Synergy Income Calculator
 */
document.addEventListener("DOMContentLoaded", function () {
  const root = document.getElementById("synergy-calculator");
  if (!root) return;
  initSynergyCalc(root);
});

const COMMISSIONS = {
  neurogen: {
    free:  { levels: 3, l1: 0.25, l2plus: 0.03 },
    pro:   { levels: 5, l1: 0.50, l2plus: 0.05 },
  },
  sethubble: {
    plane:  { levels: 3, l1: 0.40, l2plus: 0.03 },
    rocket: { levels: 10, l1: 0.40, l2plus: 0.03 },
  },
};

function initSynergyCalc(root) {
  const els = {
    sliderStart: root.querySelector("#syn-start"),
    valStart: root.querySelector("#syn-start-val"),
    sliderStep: root.querySelector("#syn-step"),
    valStep: root.querySelector("#syn-step-val"),
    sliderConvPro: root.querySelector("#syn-conv-pro"),
    valConvPro: root.querySelector("#syn-conv-pro-val"),
    sliderConvRocket: root.querySelector("#syn-conv-rocket"),
    valConvRocket: root.querySelector("#syn-conv-rocket-val"),
    sliderRealism: root.querySelector("#syn-realism"),
    valRealism: root.querySelector("#syn-realism-val"),
  };

  function readValues() {
    return {
      start: parseInt(els.sliderStart?.value || 3),
      step: parseInt(els.sliderStep?.value || 3),
      depth: 10,
      convPro: parseInt(els.sliderConvPro?.value || 10),
      convRocket: parseInt(els.sliderConvRocket?.value || 2),
      realism: parseInt(els.sliderRealism?.value || 100) / 100,
    };
  }

  function attach(el, valEl, cb) {
    if (!el) return;
    el.addEventListener("input", () => {
      const v = parseInt(el.value);
      const suffix = el.dataset.suffix || "";
      const prefix = el.dataset.prefix || "";
      if (valEl) valEl.textContent = prefix + v.toLocaleString("ru-RU") + suffix;
      cb();
    });
  }

  const recalc = () => calculate(readValues());
  attach(els.sliderStart, els.valStart, recalc);
  attach(els.sliderStep, els.valStep, recalc);
  attach(els.sliderConvPro, els.valConvPro, recalc);
  attach(els.sliderConvRocket, els.valConvRocket, recalc);
  attach(els.sliderRealism, els.valRealism, recalc);

  recalc();
}

function calcNetwork(start, step, levels) {
  const network = [];
  for (let i = 1; i <= levels; i++) {
    network.push({ level: i, people: Math.round(start * Math.pow(step, i - 1)) });
  }
  return network;
}

function calculate(v) {
  const network = calcNetwork(v.start, v.step, v.depth);
  const fmt = (n) => Math.round(n).toLocaleString("ru-RU");
  const el = (id) => document.getElementById(id);

  let totalRaw = 0;
  const levelData = network.map(lv => {
    const adj = Math.round(lv.people * v.realism);
    totalRaw += lv.people;
    const proB = adj * v.convPro / 100;
    const rocketB = adj * v.convRocket / 100;
    return { ...lv, adjusted: adj, proBuyers: proB, rocketBuyers: rocketB };
  });

  const totalAdjusted = levelData.reduce((s, lv) => s + lv.adjusted, 0);
  const totalProBuyers = levelData.reduce((s, lv) => s + lv.proBuyers, 0);
  const totalRocketBuyers = levelData.reduce((s, lv) => s + lv.rocketBuyers, 0);

  // --- Block 2: Network ---
  if (el("syn-network-total")) el("syn-network-total").textContent = fmt(totalAdjusted);
  if (el("syn-network-pro")) el("syn-network-pro").textContent = fmt(totalProBuyers);
  if (el("syn-network-rocket")) el("syn-network-rocket").textContent = fmt(totalRocketBuyers);

  // --- Block 3: Income comparison ---
  function calcIncomeFor(data, ngCfg, shCfg) {
    let proIncome = 0;
    let rocketIncome = 0;
    for (const lv of data) {
      if (lv.level <= ngCfg.levels) {
        const rate = lv.level === 1 ? ngCfg.l1 : ngCfg.l2plus;
        proIncome += lv.proBuyers * 20 * rate;
      }
      if (lv.level <= shCfg.levels) {
        const rate = lv.level === 1 ? shCfg.l1 : shCfg.l2plus;
        rocketIncome += lv.rocketBuyers * 110 * rate;
      }
    }
    return { pro: proIncome, rocket: rocketIncome, total: proIncome + rocketIncome };
  }

  const plane = calcIncomeFor(levelData, COMMISSIONS.neurogen.free, COMMISSIONS.sethubble.plane);
  const rocket = calcIncomeFor(levelData, COMMISSIONS.neurogen.pro, COMMISSIONS.sethubble.rocket);
  const lost = rocket.total - plane.total;

  const show = (prefix, data) => {
    if (el(prefix + "-pro")) el(prefix + "-pro").textContent = "$" + fmt(data.pro);
    if (el(prefix + "-rocket")) el(prefix + "-rocket").textContent = "$" + fmt(data.rocket);
    if (el(prefix + "-total")) el(prefix + "-total").textContent = "$" + fmt(data.total);
  };
  show("syn-plane", plane);
  show("syn-rocket", rocket);

  if (el("syn-lost")) el("syn-lost").textContent = "$" + fmt(lost);
  if (el("syn-lost-num")) el("syn-lost-num").textContent = fmt(lost);

  // --- Block 4: Insight hook visibility ---
  const lossBlock = document.getElementById("syn-loss-block");
  if (lossBlock) {
    lossBlock.classList.remove("hidden");
  }

  // --- Network table ---
  const tbody = document.querySelector("#syn-table tbody");
  if (tbody) {
    let html = "";
    for (const lv of levelData) {
      const planeDepth = lv.level <= COMMISSIONS.neurogen.free.levels;
      const rocketDepth = lv.level <= COMMISSIONS.neurogen.pro.levels;
      html += `<tr class="border-b border-white/5">
        <td class="p-2 text-white font-bold">${lv.level}</td>
        <td class="p-2 text-gray-300">${fmt(lv.adjusted)}</td>
        <td class="p-2 text-gray-300">${fmt(lv.proBuyers)}</td>
        <td class="p-2 text-gray-300">${fmt(lv.rocketBuyers)}</td>
        <td class="p-2 ${planeDepth ? 'text-green-400' : 'text-gray-600'}">${planeDepth ? '✓' : '—'}</td>
        <td class="p-2 ${rocketDepth ? 'text-green-400' : 'text-gray-600'}">${rocketDepth ? '✓' : '—'}</td>
      </tr>`;
    }
    html += `<tr class="border-t-2 border-cyan-500/30 font-bold bg-white/5">
      <td class="p-2 text-cyan-400">Итого</td>
      <td class="p-2 text-cyan-400">${fmt(totalAdjusted)}</td>
      <td class="p-2 text-cyan-400">${fmt(totalProBuyers)}</td>
      <td class="p-2 text-cyan-400">${fmt(totalRocketBuyers)}</td>
      <td class="p-2 text-cyan-400">$${fmt(plane.total)}</td>
      <td class="p-2 text-cyan-400">$${fmt(rocket.total)}</td>
    </tr>`;
    tbody.innerHTML = html;
  }
}

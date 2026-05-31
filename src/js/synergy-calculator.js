(function () {
  'use strict';

  var CFG = {
    ng: {
      free:  { l1: 0.25, l2: 0.03, depth: 3 },
      pro:   { l1: 0.50, l2: 0.05, depth: 5 },
    },
    sh: {
      plane:  { depth: 3,  cap: 10000,   fee: 0.05, entryLabel: 'Plane' },
      rocket: { depth: 10, cap: 100000,  fee: 0.03, entryLabel: 'Rocket' },
      shuttle:{ depth: 10, cap: 12000000,fee: 0.01, entryLabel: 'Shuttle' },
      commL1: 0.40,
      commL2: 0.03,
      rocketPrice: 110,
      shuttlePrice: 350,
    },
    proPrice: 20,
    maxLevels: 10,
  };

  var ENTRY_COST = {
    free: 0,
    pro: CFG.proPrice,
    rocket: CFG.proPrice + CFG.sh.rocketPrice,
    shuttle: CFG.proPrice + CFG.sh.shuttlePrice,
  };

  document.addEventListener('DOMContentLoaded', function () {
    var root = document.getElementById('synergy-calculator');
    if (!root) return;
    var dom = getDOM(root);
    dom.allInputs.forEach(function (el) {
      if (!el) return;
      el.addEventListener('input', function () { return run(dom); });
      el.addEventListener('change', function () { return run(dom); });
    });
    run(dom);
  });

  function getDOM(root) {
    var $ = function (id) { return root.querySelector('#' + id) || document.getElementById(id); };
    var dom = {};
    var inputIds = [
      'inp-personal', 'val-personal',
      'inp-partner', 'val-partner',
      'inp-duplication', 'val-duplication',
      'toggle-sh',
      'sh-block',
      'inp-rocket', 'val-rocket',
      'inp-shuttle', 'val-shuttle',
    ];
    inputIds.forEach(function (id) { dom[id] = $(id); });
    dom.table = $('#results-table');
    dom.chart = $('#income-chart');
    dom.cta = $('#cta-button');
    dom.allInputs = [
      dom['inp-personal'], dom['inp-partner'], dom['inp-duplication'],
      dom['inp-rocket'], dom['inp-shuttle'], dom['toggle-sh'],
    ];
    return dom;
  }

  function read(dom) {
    var shOn = dom['toggle-sh'] && dom['toggle-sh'].checked;
    return {
      personal:   parseInt((dom['inp-personal']    && dom['inp-personal'].value)   || 10, 10),
      partner:    parseInt((dom['inp-partner']     && dom['inp-partner'].value)    || 3,  10),
      duplication:parseInt((dom['inp-duplication'] && dom['inp-duplication'].value)|| 100, 10),
      shEnabled:  shOn,
      rocketConv: shOn ? parseInt((dom['inp-rocket']  && dom['inp-rocket'].value)  || 5, 10) : 0,
      shuttleConv:shOn ? parseInt((dom['inp-shuttle'] && dom['inp-shuttle'].value) || 2, 10) : 0,
    };
  }

  function updateDisplay(v, dom) {
    setText(dom['val-personal'], v.personal);
    setText(dom['val-partner'], v.partner);
    setText(dom['val-duplication'], v.duplication + '%');
    toggle(dom['sh-block'], v.shEnabled);
    if (v.shEnabled) {
      setText(dom['val-rocket'], v.rocketConv + '%');
      setText(dom['val-shuttle'], v.shuttleConv + '%');
    }
  }

  var highlighted = 'pro';

  function run(dom) {
    var v = read(dom);
    updateDisplay(v, dom);
    var scenarios = calc(v);
    render(scenarios, dom);
    renderChart(scenarios, dom);
    if (!highlighted) highlighted = 'pro';
    applyHighlight(highlighted, scenarios, dom);
  }

  function buildNetwork(v) {
    var levels = [];
    var mult = v.partner * v.duplication / 100;
    for (var l = 1; l <= CFG.maxLevels; l++) {
      var people = l === 1
        ? v.personal
        : Math.round(v.personal * Math.pow(mult, l - 1));
      levels.push({
        level: l,
        people: people,
        proBuyers: people,
        rocketBuyers: people * v.rocketConv / 100,
        shuttleBuyers: people * v.shuttleConv / 100,
      });
    }
    return levels;
  }

  function calc(v) {
    var network = buildNetwork(v);
    var keys = ['free', 'pro', 'rocket', 'shuttle'];
    var statusMap = { free: 'free', pro: 'pro', rocket: 'pro', shuttle: 'pro' };
    var tariffMap = { free: 'plane', pro: 'plane', rocket: 'rocket', shuttle: 'shuttle' };

    var scenarios = {};
    keys.forEach(function (key) {
      scenarios[key] = calcScenario(network, statusMap[key], tariffMap[key], v);
    });

    var maxGross = scenarios.shuttle.grossIncome;
    keys.forEach(function (key) {
      scenarios[key].missed = Math.max(0, maxGross - scenarios[key].grossIncome);
    });

    return scenarios;
  }

  function calcScenario(network, status, tariff, v) {
    var ngCfg = CFG.ng[status];
    var shCfg = CFG.sh[tariff];
    var proPrice = CFG.proPrice;
    var proDepth = Math.min(ngCfg.depth, shCfg.depth);
    var shDepth = shCfg.depth;
    var entryCost = ENTRY_COST[tariff === 'plane' ? (status === 'pro' ? 'pro' : 'free') : (status === 'pro' ? tariff : 'free')];

    // Actually, entry cost is based on the key, not tariff
    // Let me handle this in the calc function
    
    var proIncomeL1 = 0, proIncomeL2plus = 0;
    var shIncomeL1 = 0, shIncomeL2plus = 0;
    var totalPeople = 0, totalProB = 0, totalRocketB = 0, totalShuttleB = 0;

    for (var i = 0; i < network.length; i++) {
      var lv = network[i];
      var levelNum = i + 1;
      totalPeople += lv.people;
      totalProB += lv.proBuyers;
      totalRocketB += lv.rocketBuyers;
      totalShuttleB += lv.shuttleBuyers;

      if (levelNum <= proDepth) {
        var rate = levelNum === 1 ? ngCfg.l1 : ngCfg.l2;
        var inc = lv.proBuyers * proPrice * rate;
        if (levelNum === 1) proIncomeL1 += inc; else proIncomeL2plus += inc;
      }
      if (levelNum <= shDepth) {
        var rateSH = levelNum === 1 ? CFG.sh.commL1 : CFG.sh.commL2;
        var rInc = lv.rocketBuyers * CFG.sh.rocketPrice * rateSH;
        var sInc = lv.shuttleBuyers * CFG.sh.shuttlePrice * rateSH;
        if (levelNum === 1) { shIncomeL1 += rInc + sInc; }
        else { shIncomeL2plus += rInc + sInc; }
      }
    }

    // Caps on L2+
    var isCapped = false;
    var l2Total = proIncomeL2plus + shIncomeL2plus;
    if (l2Total > shCfg.cap && shCfg.cap > 0) {
      isCapped = true;
      var ratio = shCfg.cap / l2Total;
      proIncomeL2plus *= ratio;
      shIncomeL2plus *= ratio;
    }

    var gross = Math.round(proIncomeL1 + proIncomeL2plus + shIncomeL1 + shIncomeL2plus);

    // Binary (only for Shuttle tariff)
    var binaryBonus = 0;
    if (tariff === 'shuttle') {
      var points = totalShuttleB * CFG.sh.shuttlePrice;
      binaryBonus = Math.floor(points / 1000) * 100;
    }

    // Net after fee + binary + entry
    var net = Math.round(gross * (1 - shCfg.fee) + binaryBonus);

    return {
      proIncome:  Math.round(proIncomeL1 + proIncomeL2plus),
      shIncome:   Math.round(shIncomeL1 + shIncomeL2plus),
      grossIncome: gross,
      netIncome: net,
      binaryBonus: binaryBonus,
      fee: shCfg.fee,
      capLimit: shCfg.cap,
      isCapped: isCapped,
      entryCost: 0, // will be set later
      missed: 0, // will be set later
      proDepth: proDepth,
      shDepth: shDepth,
      totalPeople: totalPeople,
      totalProB: Math.round(totalProB),
      totalRocketB: Math.round(totalRocketB),
      totalShuttleB: Math.round(totalShuttleB),
    };
  }

  function render(scenarios, dom) {
    var t = dom.table;
    if (!t) return;

    var fmt = function (n) { return Math.round(n).toLocaleString('ru-RU'); };
    var fmd = function (n) { return '$' + fmt(n); };

    var keys = ['free', 'pro', 'rocket', 'shuttle'];
    var keyNames = {
      free: 'FREE<br><span style="font-size:10px;color:#6b7280;">Plane</span>',
      pro: 'PRO<br><span style="font-size:10px;color:#6b7280;">Plane</span>',
      rocket: 'PRO + Rocket<br><span style="font-size:10px;color:#6b7280;">$130/год</span>',
      shuttle: 'PRO + Shuttle<br><span style="font-size:10px;color:#6b7280;">$370/год</span>',
    };

    var entryCosts = { free: 0, pro: 20, rocket: 130, shuttle: 370 };
    keys.forEach(function (k) { scenarios[k].entryCost = entryCosts[k]; });

    var rows = [];

    function cell(key, html, cls) {
      return '<td class="tc ' + (cls || '') + '" data-key="' + key + '">' + html + '</td>';
    }

    // Header
    rows.push('<tr class="tr-header"><td class="tc th"></td>');
    keys.forEach(function (k) {
      rows.push(cell(k, keyNames[k], 'col-header'));
    });
    rows.push('</tr>');

    // Entry cost
    rows.push('<tr class="tr-row"><td class="tc th">Стоимость входа</td>');
    keys.forEach(function (k) {
      rows.push(cell(k, fmd(entryCosts[k])));
    });
    rows.push('</tr>');

    // PRO depth description
    rows.push('<tr class="tr-row"><td class="tc th">Доход с PRO</td>');
    keys.forEach(function (k) {
      var s = scenarios[k];
      var txt;
      if (k === 'free') txt = '25% L1 · 3% L2-L3';
      else if (k === 'pro') txt = '50% L1 · 5% L2 — 🛑 3 ур. (Plane!)';
      else txt = '50% L1 · 5% L2-L5 ✅';
      rows.push(cell(k, txt, s.proDepth < 5 ? 'depth-warn' : 'depth-ok'));
    });
    rows.push('</tr>');

    // SH depth
    rows.push('<tr class="tr-row"><td class="tc th">Доход с тарифов SH</td>');
    keys.forEach(function (k) {
      var s = scenarios[k];
      var txt = s.shDepth < 10 ? '🛑 ' + s.shDepth + ' ур.' : '✅ до 10 ур.';
      if (k === 'shuttle') txt += ' + бесконечный бинар';
      rows.push(cell(k, txt, s.shDepth < 10 ? 'depth-warn' : 'depth-ok'));
    });
    rows.push('</tr>');

    // Cap
    rows.push('<tr class="tr-row"><td class="tc th">Лимит (L2+)</td>');
    keys.forEach(function (k) {
      rows.push(cell(k, fmd(scenarios[k].capLimit), scenarios[k].isCapped ? 'capped' : ''));
    });
    rows.push('</tr>');

    // Fee
    rows.push('<tr class="tr-row"><td class="tc th">Комиссия вывода</td>');
    keys.forEach(function (k) {
      rows.push(cell(k, (scenarios[k].fee * 100) + '%'));
    });
    rows.push('</tr>');

    // Gross income
    rows.push('<tr class="tr-row"><td class="tc th">Грязный доход</td>');
    keys.forEach(function (k) {
      rows.push(cell(k, '<span class="gross-val">' + fmd(scenarios[k].grossIncome) + '</span>', 'cell-gross'));
    });
    rows.push('</tr>');

    // Missed
    rows.push('<tr class="tr-row"><td class="tc th">Сгорело 🔴</td>');
    keys.forEach(function (k) {
      var m = scenarios[k].missed;
      var html = m > 0 ? '<span class="missed-val">-' + fmd(m) + '</span>' : '<span style="color:#22c55e;">$0</span>';
      rows.push(cell(k, html, m > 0 ? 'cell-missed' : ''));
    });
    rows.push('</tr>');

    // Binary bonus
    rows.push('<tr class="tr-row"><td class="tc th">+ Бинар</td>');
    keys.forEach(function (k) {
      var bb = scenarios[k].binaryBonus;
      rows.push(cell(k, bb > 0 ? '<span class="bonus-val">+' + fmd(bb) + '</span>' : '—'));
    });
    rows.push('</tr>');

    // Net income
    rows.push('<tr class="tr-row tr-net"><td class="tc th">Чистыми на руки</td>');
    keys.forEach(function (k) {
      var s = scenarios[k];
      var net = Math.round(s.grossIncome * (1 - s.fee) + s.binaryBonus - entryCosts[k]);
      rows.push(cell(k, '<span class="net-val">' + fmd(net) + '</span>', s.missed > 0 ? 'cell-net-warn' : 'cell-net-ok'));
    });
    rows.push('</tr>');

    t.innerHTML = rows.join('');

    // Click handler for highlight
    t.querySelectorAll('td[data-key]').forEach(function (td) {
      td.addEventListener('click', function () {
        highlighted = this.getAttribute('data-key');
        applyHighlight(highlighted, scenarios, dom);
      });
    });
  }

  function applyHighlight(key, scenarios, dom) {
    var t = dom.table;
    if (!t) return;
    t.querySelectorAll('.col-active').forEach(function (el) {
      el.classList.remove('col-active');
    });
    t.querySelectorAll('td[data-key="' + key + '"]').forEach(function (el) {
      el.classList.add('col-active');
    });

    highlighted = key;
    updateCTA(key, scenarios, dom);
  }

  function updateCTA(key, scenarios, dom) {
    if (!dom.cta) return;
    var btns = {
      free:  { text: '\u{1F525} \u041A\u0443\u043F\u0438\u0442\u044C PRO \u0437\u0430 $20',       href: 'https://t.me/sethubble_biz_bot?start=buy_pro' },
      pro:   { text: '\u{1F680} \u041A\u0443\u043F\u0438\u0442\u044C Rocket \u0437\u0430 $110',  href: 'https://t.me/sethubble_biz_bot?start=calculator_rocket' },
      rocket:{ text: '\u{1F6F8} \u041A\u0443\u043F\u0438\u0442\u044C Shuttle \u0437\u0430 $350', href: 'https://t.me/sethubble_biz_bot?start=calculator_shuttle' },
      shuttle:{text: '\u{1F389} \u041E\u043F\u0442\u0438\u043C\u0430\u043B\u044C\u043D\u0430\u044F \u043A\u043E\u043D\u0444\u0438\u0433\u0443\u0440\u0430\u0446\u0438\u044F', href: '#' },
    };
    var btn = btns[key] || btns.pro;
    dom.cta.textContent = btn.text;
    dom.cta.href = btn.href;
    dom.cta.className = key === 'shuttle' ? 'btn-disabled' : 'btn-main';
  }

  var chartInstance = null;

  function renderChart(scenarios, dom) {
    if (!dom.chart) return;
    if (chartInstance) { chartInstance.destroy(); chartInstance = null; }
    if (typeof Chart === 'undefined') {
      setTimeout(function () { renderChart(scenarios, dom); }, 300);
      return;
    }

    var keys = ['free', 'pro', 'rocket', 'shuttle'];
    var labels = keys.map(function (k) { return k.charAt(0).toUpperCase() + k.slice(1); });

    var grossData = keys.map(function (k) { return Math.round(scenarios[k].grossIncome); });
    var missedData = keys.map(function (k) { return Math.round(scenarios[k].missed); });

    var barColors = ['#3b82f6', '#3b82f6', '#22c55e', '#f59e0b'];
    var missedColors = ['rgba(239,68,68,0.5)', 'rgba(239,68,68,0.5)', 'rgba(0,0,0,0)', 'rgba(0,0,0,0)'];
    var missedBorders = ['rgba(239,68,68,0.9)', 'rgba(239,68,68,0.9)', 'rgba(0,0,0,0)', 'rgba(0,0,0,0)'];

    chartInstance = new Chart(dom.chart, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Доход',
            data: grossData,
            backgroundColor: barColors,
            borderColor: barColors,
            borderWidth: 1,
            borderRadius: 6,
            barPercentage: 0.65,
          },
          {
            label: 'Сгорело',
            data: missedData,
            backgroundColor: missedColors,
            borderColor: missedBorders,
            borderWidth: 2,
            borderRadius: 6,
            barPercentage: 0.65,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: function (ctx) {
                var k = keys[ctx.dataIndex];
                var s = scenarios[k];
                return ctx.dataset.label + ': $' + Math.round(ctx.parsed.y).toLocaleString('ru-RU');
              },
            },
          },
        },
        scales: {
          x: {
            stacked: true,
            ticks: { color: '#d1d5db', font: { size: 11, weight: 'bold' } },
            grid: { display: false },
          },
          y: {
            stacked: true,
            beginAtZero: true,
            ticks: {
              color: '#6b7280',
              font: { size: 10 },
              callback: function (val) { return '$' + val; },
            },
            grid: { color: 'rgba(255,255,255,0.05)' },
          },
        },
      },
    });
  }

  function setText(el, val) { if (el) el.textContent = val; }
  function toggle(el, show) { if (el) el.classList.toggle('hidden', !show); }
})();

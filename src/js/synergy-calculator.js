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

    // Слайдеры → бегунок меняет число
    var pairs = [
      { slider: 'inp-personal', num: 'num-personal' },
      { slider: 'inp-partner',  num: 'num-partner' },
      { slider: 'inp-duplication', num: 'num-duplication' },
      { slider: 'inp-rocket',   num: 'num-rocket' },
      { slider: 'inp-shuttle',  num: 'num-shuttle' },
    ];
    pairs.forEach(function (p) {
      var slider = dom[p.slider];
      var num = dom[p.num];
      if (!slider || !num) return;
      slider.addEventListener('input', function () {
        num.value = slider.value;
        run(dom);
      });
      num.addEventListener('input', function () {
        var v = parseInt(num.value, 10);
        if (isNaN(v)) return;
        var min = parseInt(num.min, 10);
        var max = parseInt(num.max, 10);
        if (v < min) v = min;
        if (v > max) v = max;
        num.value = v;
        slider.value = v;
        run(dom);
      });
    });

    // Тоггл SH
    var toggle = dom['toggle-sh'];
    if (toggle) {
      toggle.addEventListener('change', function () { run(dom); });
    }

    run(dom);
  });

  function getDOM(root) {
    var $ = function (id) { return root.querySelector('#' + id) || document.getElementById(id); };
    var dom = {};
    var inputIds = [
      'inp-personal', 'val-personal', 'num-personal',
      'inp-partner', 'val-partner', 'num-partner',
      'inp-duplication', 'val-duplication', 'num-duplication',
      'toggle-sh',
      'sh-block',
      'inp-rocket', 'val-rocket', 'num-rocket',
      'inp-shuttle', 'val-shuttle', 'num-shuttle',
    ];
    inputIds.forEach(function (id) { dom[id] = $(id); });
    dom.table = $('results-table');
    dom.chart = $('income-chart');
    dom.ctaPro = $('cta-button-pro');
    dom.ctaSh = $('cta-button-sh');
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
    setVal(dom['num-personal'], v.personal);
    setVal(dom['num-partner'], v.partner);
    setVal(dom['num-duplication'], v.duplication);
    toggle(dom['sh-block'], v.shEnabled);
    if (v.shEnabled) {
      setText(dom['val-rocket'], v.rocketConv + '%');
      setText(dom['val-shuttle'], v.shuttleConv + '%');
      setVal(dom['num-rocket'], v.rocketConv);
      setVal(dom['num-shuttle'], v.shuttleConv);
    }
  }

  var highlighted = 'pro';

  function run(dom) {
    var v = read(dom);
    updateDisplay(v, dom);
    var scenarios = calc(v);
    render(scenarios, dom, v);
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

    var proIncomeL1 = 0, proIncomeL2plus = 0;
    var shIncomeL1 = 0, shIncomeL2plus = 0;
    var totalPeople = 0, totalProB = 0, totalRocketB = 0, totalShuttleB = 0;
    var proLevels = [], shLevels = [];
    var capRatio = 1;

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
        proLevels.push({ level: levelNum, income: inc, rate: rate });
        if (levelNum === 1) proIncomeL1 += inc; else proIncomeL2plus += inc;
      }
      if (levelNum <= shDepth) {
        var rateSH = levelNum === 1 ? CFG.sh.commL1 : CFG.sh.commL2;
        var rInc = lv.rocketBuyers * CFG.sh.rocketPrice * rateSH;
        var sInc = lv.shuttleBuyers * CFG.sh.shuttlePrice * rateSH;
        var incSH = rInc + sInc;
        shLevels.push({ level: levelNum, income: incSH, rate: rateSH });
        if (levelNum === 1) { shIncomeL1 += incSH; }
        else { shIncomeL2plus += incSH; }
      }
    }

    // Caps on L2+ — сохраняем ratio для уровней
    var isCapped = false;
    var l2Total = proIncomeL2plus + shIncomeL2plus;
    if (l2Total > shCfg.cap && shCfg.cap > 0) {
      isCapped = true;
      capRatio = shCfg.cap / l2Total;
      proIncomeL2plus *= capRatio;
      shIncomeL2plus *= capRatio;
    }

    var gross = Math.round(proIncomeL1 + proIncomeL2plus + shIncomeL1 + shIncomeL2plus);

    // Бинар: ~30% от дохода (точная формула уточняется)
    var binaryBonus = 0;
    if (tariff === 'shuttle') {
      binaryBonus = Math.round(gross * 0.30);
    }

    var net = Math.round(gross * (1 - shCfg.fee) + binaryBonus);

    // Корректируем уровни L2+ по capRatio
    if (capRatio < 1) {
      proLevels.forEach(function (lv) {
        if (lv.level > 1) lv.income *= capRatio;
      });
      shLevels.forEach(function (lv) {
        if (lv.level > 1) lv.income *= capRatio;
      });
    }

    return {
      proIncome:  Math.round(proIncomeL1 + proIncomeL2plus),
      shIncome:   Math.round(shIncomeL1 + shIncomeL2plus),
      grossIncome: gross,
      netIncome: net,
      binaryBonus: Math.round(binaryBonus),
      fee: shCfg.fee,
      capLimit: shCfg.cap,
      isCapped: isCapped,
      entryCost: 0,
      missed: 0,
      proDepth: proDepth,
      shDepth: shDepth,
      totalPeople: totalPeople,
      totalProB: Math.round(totalProB),
      totalRocketB: Math.round(totalRocketB),
      totalShuttleB: Math.round(totalShuttleB),
      proLevels: proLevels,
      shLevels: shLevels,
      capRatio: capRatio,
    };
  }

  function render(scenarios, dom, v) {
    var c = dom.table;
    if (!c) return;

    var fmt = function (n) { return Math.round(n).toLocaleString('ru-RU'); };
    var fmd = function (n) { return '$' + fmt(n); };

    var keys = ['free', 'pro', 'rocket', 'shuttle'];
    var keyLabels = {
      free: 'FREE', pro: 'PRO',
      rocket: 'PRO+Rocket', shuttle: 'PRO+Shuttle',
    };
    var keySubs = {
      free: 'Plane', pro: 'Plane',
      rocket: '$110/год', shuttle: '$350/год',
    };

    var entryCosts = { free: 0, pro: 20, rocket: 130, shuttle: 370 };
    keys.forEach(function (k) { scenarios[k].entryCost = entryCosts[k]; });

    var colors = {
      free:   { border: 'rgba(59,130,246,0.3)', bg: 'rgba(59,130,246,0.05)', accent: '#3b82f6', netClr: '#f59e0b' },
      pro:    { border: 'rgba(59,130,246,0.5)', bg: 'rgba(59,130,246,0.08)', accent: '#3b82f6', netClr: '#22c55e' },
      rocket: { border: 'rgba(34,197,94,0.4)',  bg: 'rgba(34,197,94,0.06)',  accent: '#22c55e', netClr: '#22c55e' },
      shuttle:{ border: 'rgba(245,158,11,0.4)', bg: 'rgba(245,158,11,0.06)', accent: '#f59e0b', netClr: '#f59e0b' },
    };

    function levelGroupHtml(levels) {
      if (!levels || levels.length === 0) return '';
      var h = '<div class="card-income">';
      var l1 = levels[0];
      h += '<div class="card-row"><span>1 ур. (' + (l1.rate * 100) + '%)</span><span>' + fmd(Math.round(l1.income)) + '</span></div>';
      if (levels.length > 1) {
        var sum = 0;
        for (var i = 1; i < levels.length; i++) sum += levels[i].income;
        var minLv = levels[1].level;
        var maxLv = levels[levels.length - 1].level;
        h += '<div class="card-row"><span>' + minLv + '-' + maxLv + ' ур. (' + (levels[1].rate * 100) + '%)</span><span>' + fmd(Math.round(sum)) + '</span></div>';
      }
      h += '</div>';
      return h;
    }

    function expensesHtml(k) {
      var h = '<div class="card-section-label">📦 Расходы</div>';
      if (k === 'free') {
        h += '<div class="card-row"><span>Вход</span><span>Бесплатно</span></div>';
      } else {
        h += '<div class="card-row"><span>PRO-статус</span><span>$' + CFG.proPrice + '</span></div>';
        if (k === 'rocket') h += '<div class="card-row"><span>Rocket $110/год</span><span>$110</span></div>';
        if (k === 'shuttle') h += '<div class="card-row"><span>Shuttle $350/год</span><span>$350</span></div>';
      }
      return h;
    }

    var cards = [];
    keys.forEach(function (k) {
      var s = scenarios[k];
      var cl = colors[k];
      var net = Math.round(s.grossIncome * (1 - s.fee) + s.binaryBonus - entryCosts[k]);
      var feeAmt = Math.round(s.grossIncome * s.fee);

      var html = ''
        + '<div class="card" data-key="' + k + '" style="--card-border:' + cl.border + ';--card-bg:' + cl.bg + ';--card-accent:' + cl.accent + '">'
        + '<div class="card-header">'
          + '<div><div class="card-title" style="color:' + cl.accent + '">' + keyLabels[k] + '</div>'
          + '<div class="card-subtitle">' + keySubs[k] + '</div></div>'
          + '<div class="card-entry">' + fmd(entryCosts[k]) + '</div>'
        + '</div>'
        + expensesHtml(k);

      // PRO income
      html += '<div class="card-section-label">📈 Доход с PRO</div>'
        + levelGroupHtml(s.proLevels)
        + '<div class="card-total"><span>Всего PRO</span><span>' + fmd(s.proIncome) + '</span></div>';

      // SH income (только если тоггл включён)
      if (v.shEnabled && s.shIncome > 0) {
        html += '<div class="card-section-label">🚀 Доход с SetHubble</div>'
          + levelGroupHtml(s.shLevels)
          + '<div class="card-total"><span>Всего SH</span><span>' + fmd(s.shIncome) + '</span></div>';
        if (s.isCapped) {
          html += '<div class="card-cap-hit">🔴 Лимит ' + fmd(s.capLimit) + ' превышен</div>';
        }
        if (s.binaryBonus > 0) {
          html += '<div class="card-row card-binary"><span>💎 Бинар (~30% от дохода)</span><span>+' + fmd(s.binaryBonus) + '</span></div>';
          html += '<div class="card-binary-note">* Точный расчёт зависит от личных продаж и структуры сети. Показана примерная оценка.</div>';
        }
      }

      // Fee
      html += '<div class="card-row card-fee"><span>📊 Комиссия (' + (s.fee * 100) + '%)</span><span>-' + fmd(feeAmt) + '</span></div>';

      // Net
      html += '<div class="card-divider"></div>'
        + '<div class="card-net">'
        + '<div class="card-net-label">Чистыми на руки</div>'
        + '<div class="card-net-val" style="color:' + cl.netClr + '">' + fmd(net) + '</div>'
        + '</div>'
        + '</div>';

      cards.push(html);
    });

    c.innerHTML = '<div class="cards-grid">' + cards.join('') + '</div>';

    c.querySelectorAll('.card').forEach(function (card) {
      card.addEventListener('click', function () {
        highlighted = this.getAttribute('data-key');
        applyHighlight(highlighted, scenarios, dom);
      });
    });
  }

  function applyHighlight(key, scenarios, dom) {
    var c = dom.table;
    if (!c) return;
    c.querySelectorAll('.card-active').forEach(function (el) {
      el.classList.remove('card-active');
    });
    c.querySelectorAll('.card[data-key="' + key + '"]').forEach(function (el) {
      el.classList.add('card-active');
    });
    highlighted = key;
    updateCTA(dom);
  }

  function updateCTA(dom) {
    var cu = window.__CALC_USER || {};
    var xp = cu.xp || 0;
    var partnerId = cu.partnerId || '1123';
    var shRefUrl = cu.shRefUrl || 'https://sethubble.com/ru/p_qdr';
    var proProduct = xp >= 100 ? '103_97998' : '142_ee4e9';
    var proPrice = xp >= 100 ? '20' : '40';

    if (dom.ctaPro) {
      dom.ctaPro.textContent = '\u{1F525} \u041A\u0443\u043F\u0438\u0442\u044C PRO \u0437\u0430 $' + proPrice;
      dom.ctaPro.href = 'https://hubblepay.net/' + proProduct + '&afid=' + partnerId;
    }
    if (dom.ctaSh) {
      dom.ctaSh.href = shRefUrl;
    }
  }

  var chartInstance = null;

  var labelPlugin = {
    id: 'labelPlugin',
    afterDraw: function (chart) {
      var meta = chart.getDatasetMeta(0);
      var data = chart.data.datasets[0].data;
      var ctx = chart.ctx;
      meta.data.forEach(function (bar, i) {
        var val = data[i];
        if (!val || val === 0) return;
        ctx.fillStyle = '#d1d5db';
        ctx.font = 'bold 11px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillText('$' + Math.round(val).toLocaleString('ru-RU'), bar.x, bar.y - 6);
      });
    },
  };

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
    var barColors = ['#3b82f6', '#3b82f6', '#22c55e', '#f59e0b'];

    chartInstance = new Chart(dom.chart, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Доход',
          data: grossData,
          backgroundColor: barColors,
          borderColor: barColors,
          borderWidth: 1,
          borderRadius: 6,
          barPercentage: 0.55,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: function (ctx) {
                return '$' + Math.round(ctx.parsed.y).toLocaleString('ru-RU');
              },
            },
          },
        },
        scales: {
          x: {
            ticks: { color: '#d1d5db', font: { size: 11, weight: 'bold' } },
            grid: { display: false },
          },
          y: {
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
      plugins: [labelPlugin],
    });
  }

  function setText(el, val) { if (el) el.textContent = val; }
  function setVal(el, val) { if (el) el.value = val; }
  function toggle(el, show) { if (el) el.classList.toggle('hidden', !show); }
})();

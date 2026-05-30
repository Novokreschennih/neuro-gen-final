(function () {
  'use strict';

  var CFG = {
    ng: {
      free:  { l1: 0.25, l2: 0.03, depth: 3 },
      pro:   { l1: 0.50, l2: 0.05, depth: 5 },
    },
    sh: {
      plane:  { depth: 3,  price: 0   },
      rocket: { depth: 10, price: 110 },
      shuttle:{ depth: 10, price: 350 },
      commL1: 0.40,
      commL2: 0.03,
    },
  };

  document.addEventListener('DOMContentLoaded', function () {
    var root = document.getElementById('synergy-calculator');
    if (!root) return;
    var dom = getDOM(root);
    var handler = function () { return run(dom); };
    ['input', 'change'].forEach(function (evt) {
      dom.allInputs.forEach(function (el) {
        if (el) el.addEventListener(evt, handler);
      });
    });
    run(dom);
  });

  function getDOM(root) {
    var $ = function (id) { return root.querySelector('#' + id) || document.getElementById(id); };
    var dom = {};
    var ids = [
      'status-free', 'status-pro',
      'coins-yes', 'coins-no',
      'net-personal', 'net-personal-val',
      'net-viral', 'net-viral-val',
      'net-realism', 'net-realism-val',
      'conv-pro', 'conv-pro-val',
      'conv-sh', 'conv-sh-val',
      'tariff-plane', 'tariff-rocket', 'tariff-shuttle',
      'tariff-warning',
      'pro-price-display',
      'result-people', 'result-pro-buy', 'result-sh-buy',
      'result-pro-inc', 'result-sh-inc', 'result-total',
      'missed-pro-block', 'missed-pro-amt',
      'missed-sh-block', 'missed-sh-amt',
      'optimal-block',
      'cta-button',
      'income-chart',
    ];
    ids.forEach(function (id) { dom[id] = $(id); });

    dom.allInputs = [
      dom['status-free'], dom['status-pro'],
      dom['coins-yes'], dom['coins-no'],
      dom['net-personal'], dom['net-viral'], dom['net-realism'],
      dom['conv-pro'], dom['conv-sh'],
      dom['tariff-plane'], dom['tariff-rocket'], dom['tariff-shuttle'],
    ];
    return dom;
  }

  function read(dom) {
    return {
      status: dom['status-pro'] && dom['status-pro'].checked ? 'pro' : 'free',
      hasCoins: dom['coins-yes'] && dom['coins-yes'].checked,
      personal: parseInt((dom['net-personal'] && dom['net-personal'].value) || 0, 10),
      viral: parseInt((dom['net-viral'] && dom['net-viral'].value) || 0, 10),
      realism: parseInt((dom['net-realism'] && dom['net-realism'].value) || 50, 10),
      convPro: parseInt((dom['conv-pro'] && dom['conv-pro'].value) || 10, 10),
      convSh: parseInt((dom['conv-sh'] && dom['conv-sh'].value) || 5, 10),
      tariff: dom['tariff-rocket'] && dom['tariff-rocket'].checked
        ? 'rocket'
        : (dom['tariff-shuttle'] && dom['tariff-shuttle'].checked ? 'shuttle' : 'plane'),
    };
  }

  function run(dom) {
    var v = read(dom);
    updateDisplay(v, dom);
    updateRadioStyles(dom);
    var result = calc(v);
    render(result, v, dom);
    renderChart(result, v, dom);
  }

  function updateDisplay(v, dom) {
    var pp = (v.status === 'pro' || v.hasCoins) ? 20 : 40;
    setText(dom['net-personal-val'], v.personal);
    setText(dom['net-viral-val'], v.viral);
    setText(dom['net-realism-val'], v.realism + '%');
    setText(dom['conv-pro-val'], v.convPro + '%');
    setText(dom['conv-sh-val'], v.convSh + '%');
    setText(dom['pro-price-display'], '$' + pp);
    ['coins-yes', 'coins-no'].forEach(function (id) {
      var el = dom[id];
      if (!el) return;
      var disabled = v.status === 'pro';
      el.disabled = disabled;
      var parent = el.closest('.coins-btn');
      if (parent) parent.classList.toggle('disabled', disabled);
    });
    toggle(dom['tariff-warning'], v.status === 'pro' && v.tariff === 'plane');
  }

  function updateRadioStyles(dom) {
    ['status-free', 'status-pro', 'tariff-plane', 'tariff-rocket', 'tariff-shuttle'].forEach(function (id) {
      var el = dom[id];
      if (!el) return;
      var parent = el.closest('.radio-option');
      if (parent) parent.classList.toggle('active', el.checked);
    });
    ['coins-yes', 'coins-no'].forEach(function (id) {
      var el = dom[id];
      if (!el) return;
      var parent = el.closest('.coins-btn');
      if (parent) parent.classList.toggle('active', el.checked);
    });
  }

  function calc(v) {
    var current = calcScenario(v, v.status, v.tariff);
    var missedPro = 0;
    var missedSh = 0;
    var optimal = null;

    if (v.status === 'free') {
      optimal = calcScenario(v, 'pro', v.tariff);
      missedPro = optimal.totalIncome - current.totalIncome;
    } else if (v.status === 'pro' && v.tariff === 'plane') {
      optimal = calcScenario(v, 'pro', 'rocket');
      missedSh = optimal.totalIncome - current.totalIncome;
    }

    return {
      levels: current.levels,
      byLevel: current.byLevel,
      proIncome: current.proIncome,
      shIncome: current.shIncome,
      totalIncome: current.totalIncome,
      proDepth: current.proDepth,
      shDepth: current.shDepth,
      proPrice: current.proPrice,
      totalPeople: current.totalPeople,
      totalProBuyers: current.totalProBuyers,
      totalShBuyers: current.totalShBuyers,
      missedPro: missedPro,
      missedSh: missedSh,
      optimal: optimal,
    };
  }

  function calcScenario(v, status, tariff) {
    var ngCfg = CFG.ng[status];
    var shCfg = CFG.sh[tariff];
    var proPrice = 20;
    var proDepth = Math.min(ngCfg.depth, shCfg.depth);
    var shDepth = shCfg.depth;
    var maxDepth = Math.max(proDepth, shDepth);

    var levels = [];
    for (var l = 1; l <= maxDepth; l++) {
      var people;
      if (l === 1) {
        people = v.personal;
      } else {
        var raw = v.personal * Math.pow(v.viral, l - 1);
        var decay = Math.pow(v.realism / 100, l - 1);
        people = Math.round(raw * decay);
      }
      levels.push({ level: l, people: people });
    }

    var proIncome = 0;
    var shIncome = 0;
    var byLevel = [];
    var totalPeople = 0;
    var totalProBuyers = 0;
    var totalShBuyers = 0;

    for (var i = 0; i < levels.length; i++) {
      var lv = levels[i];
      totalPeople += lv.people;
      var proB = lv.people * v.convPro / 100;
      var shB = lv.people * v.convSh / 100;
      totalProBuyers += proB;
      totalShBuyers += shB;
      var pInc = 0;
      var sInc = 0;

      if (i < proDepth) {
        var rate = i === 0 ? ngCfg.l1 : ngCfg.l2;
        pInc = proB * proPrice * rate;
        proIncome += pInc;
      }
      if (i < shDepth) {
        var rateSH = i === 0 ? CFG.sh.commL1 : CFG.sh.commL2;
        sInc = shB * shCfg.price * rateSH;
        shIncome += sInc;
      }
      byLevel.push({ pro: pInc, sh: sInc, total: pInc + sInc });
    }

    return {
      levels: levels,
      byLevel: byLevel,
      proIncome: proIncome,
      shIncome: shIncome,
      totalIncome: proIncome + shIncome,
      proDepth: proDepth,
      shDepth: shDepth,
      proPrice: proPrice,
      totalPeople: totalPeople,
      totalProBuyers: totalProBuyers,
      totalShBuyers: totalShBuyers,
    };
  }

  function render(result, v, dom) {
    var fmt = function (n) { return Math.round(n).toLocaleString('ru-RU'); };
    var fmtd = function (n) { return '$' + fmt(n); };
    var pp = (v.status === 'pro' || v.hasCoins) ? 20 : 40;

    setText(dom['result-people'], fmt(result.totalPeople));
    setText(dom['result-pro-buy'], fmt(result.totalProBuyers));
    setText(dom['result-sh-buy'], fmt(result.totalShBuyers));
    setText(dom['result-pro-inc'], fmtd(result.proIncome));
    setText(dom['result-sh-inc'], fmtd(result.shIncome));
    setText(dom['result-total'], fmtd(result.totalIncome));

    if (v.status === 'free') {
      toggle(dom['missed-pro-block'], true);
      setText(dom['missed-pro-amt'], fmtd(result.missedPro));
    } else {
      toggle(dom['missed-pro-block'], false);
    }

    if (v.status === 'pro' && v.tariff === 'plane') {
      toggle(dom['missed-sh-block'], true);
      setText(dom['missed-sh-amt'], fmtd(result.missedSh));
    } else {
      toggle(dom['missed-sh-block'], false);
    }

    toggle(dom['optimal-block'], v.status === 'pro' && (v.tariff === 'rocket' || v.tariff === 'shuttle'));

    if (dom['cta-button']) {
      if (v.status === 'free') {
        dom['cta-button'].textContent = '\u{1F525} Купить NeuroGen PRO за $' + pp;
        dom['cta-button'].href = 'https://t.me/sethubble_biz_bot?start=buy_pro';
      } else if (v.status === 'pro' && v.tariff === 'plane') {
        dom['cta-button'].textContent = '\u{1F525} Купить SetHubble Rocket за $110';
        dom['cta-button'].href = 'https://t.me/sethubble_biz_bot?start=calculator_rocket';
      } else {
        dom['cta-button'].textContent = '\u{1F389} Оптимальная конфигурация';
        dom['cta-button'].href = '#';
      }
    }
  }

  var chartInstance = null;

  function renderChart(result, v, dom) {
    if (!dom['income-chart']) return;
    if (chartInstance) { chartInstance.destroy(); chartInstance = null; }
    if (typeof Chart === 'undefined') {
      setTimeout(function () { renderChart(result, v, dom); }, 300);
      return;
    }

    var maxLevels = result.levels.length;
    if (result.optimal && result.optimal.levels.length > maxLevels) {
      maxLevels = result.optimal.levels.length;
    }

    var labels = [];
    for (var l = 1; l <= maxLevels; l++) labels.push('L' + l);

    var currentData = labels.map(function (_, i) {
      if (i < result.byLevel.length) return Math.round(result.byLevel[i].total);
      return 0;
    });

    var datasets = [{
      label: '\u0422\u0435\u043A\u0443\u0449\u0438\u0439 \u0434\u043E\u0445\u043E\u0434',
      data: currentData,
      borderColor: '#06b6d4',
      backgroundColor: 'rgba(6,182,212,0.08)',
      fill: true,
      tension: 0.3,
      pointRadius: 4,
    }];

    if (result.optimal && result.missedPro + result.missedSh > 0) {
      var optimalLabel = v.status === 'free' ? '\u0421 PRO' : '\u0421 Rocket';
      var optimalData = labels.map(function (_, i) {
        if (i < result.optimal.byLevel.length) return Math.round(result.optimal.byLevel[i].total);
        return 0;
      });
      datasets.push({
        label: optimalLabel,
        data: optimalData,
        borderColor: '#a855f7',
        backgroundColor: 'rgba(168,85,247,0.08)',
        borderDash: [5, 4],
        fill: true,
        tension: 0.3,
        pointRadius: 4,
      });
    }

    chartInstance = new Chart(dom['income-chart'], {
      type: 'line',
      data: { labels: labels, datasets: datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: { color: '#d1d5db', font: { size: 11, weight: 'bold' } },
          },
        },
        scales: {
          x: {
            ticks: { color: '#6b7280', font: { size: 10 } },
            grid: { color: 'rgba(255,255,255,0.04)' },
          },
          y: {
            beginAtZero: true,
            ticks: {
              color: '#6b7280',
              font: { size: 10 },
              callback: function (val) { return '$' + val; },
            },
            grid: { color: 'rgba(255,255,255,0.04)' },
          },
        },
      },
    });
  }

  function setText(el, val) { if (el) el.textContent = val; }
  function toggle(el, show) { if (el) el.classList.toggle('hidden', !show); }
})();

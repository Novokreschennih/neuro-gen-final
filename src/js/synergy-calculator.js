(function () {
  'use strict';

  var CFG = {
    ng: {
      free:  { l1: 0.25, l2: 0.03, depth: 3 },
      pro:   { l1: 0.50, l2: 0.05, depth: 5 },
    },
    sh: {
      plane:  { depth: 3,  price: 0,   cap: 10000 },
      rocket: { depth: 10, price: 110, cap: 100000 },
      shuttle:{ depth: 10, price: 350, cap: 12000000 },
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
      'tariff-warning', 'cap-warning',
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
    var optimal = null;
    var missedPro = 0;
    var missedSh = 0;

    if (v.status === 'free') {
      var withPro = calcScenario(v, 'pro', v.tariff);
      missedPro = withPro.totalIncome - current.totalIncome;
      var bestTariff = v.tariff === 'shuttle' ? 'shuttle' : 'rocket';
      if (bestTariff !== v.tariff) {
        optimal = calcScenario(v, 'pro', bestTariff);
        missedSh = optimal.totalIncome - withPro.totalIncome;
      } else {
        optimal = withPro;
      }
    } else if (v.tariff === 'plane') {
      optimal = calcScenario(v, 'pro', 'rocket');
      missedSh = optimal.totalIncome - current.totalIncome;
    } else if (v.tariff === 'rocket' && current.isCapped) {
      optimal = calcScenario(v, 'pro', 'shuttle');
      missedSh = optimal.totalIncome - current.totalIncome;
    }

    return { current: current, optimal: optimal, missedPro: missedPro, missedSh: missedSh };
  }

  function calcScenario(v, status, tariff) {
    var ngCfg = CFG.ng[status];
    var shCfg = CFG.sh[tariff];
    var proPrice = 20;
    var maxDepth = 10;
    var proDepth = Math.min(ngCfg.depth, shCfg.depth);
    var shDepth = shCfg.depth;

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

    var proIncomeL1 = 0, proIncomeL2plus = 0;
    var shIncomeL1 = 0, shIncomeL2plus = 0;
    var byLevel = [];
    var totalPeople = 0, totalProBuyers = 0, totalShBuyers = 0;

    for (var i = 0; i < levels.length; i++) {
      var lv = levels[i];
      var levelNum = i + 1;
      totalPeople += lv.people;
      var proB = lv.people * v.convPro / 100;
      var shB = lv.people * v.convSh / 100;
      totalProBuyers += proB;
      totalShBuyers += shB;

      var pInc = 0, sInc = 0;

      if (levelNum <= proDepth) {
        var rate = levelNum === 1 ? ngCfg.l1 : ngCfg.l2;
        pInc = proB * proPrice * rate;
        if (levelNum === 1) proIncomeL1 += pInc; else proIncomeL2plus += pInc;
      }
      if (levelNum <= shDepth) {
        var rateSH = levelNum === 1 ? CFG.sh.commL1 : CFG.sh.commL2;
        sInc = shB * shCfg.price * rateSH;
        if (levelNum === 1) shIncomeL1 += sInc; else shIncomeL2plus += sInc;
      }
      byLevel.push({ pro: pInc, sh: sInc, total: pInc + sInc });
    }

    // Caps on L2+ only — L1 всегда uncapped
    var isCapped = false;
    var l2plusTotal = proIncomeL2plus + shIncomeL2plus;
    if (l2plusTotal > shCfg.cap && shCfg.cap > 0) {
      isCapped = true;
      var ratio = shCfg.cap / l2plusTotal;
      proIncomeL2plus *= ratio;
      shIncomeL2plus *= ratio;
    }

    var totalPro = Math.round(proIncomeL1 + proIncomeL2plus);
    var totalSh = Math.round(shIncomeL1 + shIncomeL2plus);

    return {
      levels: levels,
      byLevel: byLevel,
      proIncome: totalPro,
      shIncome: totalSh,
      totalIncome: totalPro + totalSh,
      isCapped: isCapped,
      capLimit: shCfg.cap,
      totalPeople: totalPeople,
      totalProBuyers: Math.round(totalProBuyers),
      totalShBuyers: Math.round(totalShBuyers),
      l1Income: Math.round(proIncomeL1 + shIncomeL1),
    };
  }

  function render(res, v, dom) {
    var cur = res.current;
    var fmt = function (n) { return Math.round(n).toLocaleString('ru-RU'); };
    var fmtd = function (n) { return '$' + fmt(n); };

    setText(dom['result-people'], fmt(cur.totalPeople));
    setText(dom['result-pro-buy'], fmt(cur.totalProBuyers));
    setText(dom['result-sh-buy'], fmt(cur.totalShBuyers));
    setText(dom['result-pro-inc'], fmtd(cur.proIncome));
    setText(dom['result-sh-inc'], fmtd(cur.shIncome));
    setText(dom['result-total'], fmtd(cur.totalIncome));

    // Cap warning
    if (cur.isCapped) {
      dom['cap-warning'].innerHTML = '\u{1F6D1} <strong>\u041F\u043E\u0442\u043E\u043B\u043E\u043A \u0434\u043E\u0445\u043E\u0434\u0430!</strong> \u0412\u0430\u0448\u0430 \u0441\u0435\u0442\u044C \u0437\u0430\u0440\u0430\u0431\u043E\u0442\u0430\u043B\u0430 \u0431\u044B \u0431\u043E\u043B\u044C\u0448\u0435, \u043D\u043E \u0442\u0430\u0440\u0438\u0444 \u043E\u0431\u0440\u0435\u0437\u0430\u0435\u0442 \u043F\u0430\u0441\u0441\u0438\u0432\u043D\u044B\u0439 \u0434\u043E\u0445\u043E\u0434 \u043D\u0430 $' + fmt(cur.capLimit) + ' \u0432 \u0433\u043E\u0434. \u041F\u0435\u0440\u0435\u0439\u0434\u0438\u0442\u0435 \u043D\u0430 \u0442\u0430\u0440\u0438\u0444 \u0432\u044B\u0448\u0435, \u0447\u0442\u043E\u0431\u044B \u0437\u0430\u0431\u0440\u0430\u0442\u044C \u0441\u0433\u043E\u0440\u0435\u0432\u0448\u0438\u0435 \u0434\u0435\u043D\u044C\u0433\u0438.';
      toggle(dom['cap-warning'], true);
    } else {
      toggle(dom['cap-warning'], false);
    }

    // Missed PRO
    toggle(dom['missed-pro-block'], v.status === 'free');
    if (v.status === 'free') setText(dom['missed-pro-amt'], fmtd(res.missedPro));

    // Missed SH: PRO+Plane или PRO+Rocket+capped
    var showSh = (v.status === 'pro' && v.tariff === 'plane')
      || (v.status === 'pro' && v.tariff === 'rocket' && cur.isCapped);
    toggle(dom['missed-sh-block'], showSh);
    if (showSh) {
      setText(dom['missed-sh-amt'], fmtd(res.missedSh));
      if (v.tariff === 'rocket' && cur.isCapped) {
        setText(dom['missed-sh-title'], '\u{1F6F8} \u041F\u043E\u0442\u043E\u043B\u043E\u043A Rocket \u043F\u0440\u043E\u0431\u0438\u0442 \u0442\u043E\u043B\u044C\u043A\u043E Shuttle');
        setText(dom['missed-sh-text'], '\u0412\u044B \u0443\u043F\u0435\u0440\u043B\u0438\u0441\u044C \u0432 \u043F\u043E\u0442\u043E\u043B\u043E\u043A $100K. \u0422\u0430\u0440\u0438\u0444 Shuttle ($350/\u0433\u043E\u0434) \u043F\u043E\u0434\u043D\u0438\u043C\u0430\u0435\u0442 \u043B\u0438\u043C\u0438\u0442 \u0434\u043E $12M \u0438 \u0434\u0430\u0451\u0442 \u043F\u043E\u043B\u043D\u044B\u0439 \u0431\u0438\u043D\u0430\u0440.');
      } else {
        setText(dom['missed-sh-title'], '\u26A0\uFE0F PRO \u043D\u0435 \u0440\u0430\u0441\u043A\u0440\u044B\u0442 \u2014 \u043D\u0443\u0436\u0435\u043D Rocket');
        setText(dom['missed-sh-text'], '\u0412\u044B \u0443\u0436\u0435 \u043A\u0443\u043F\u0438\u043B\u0438 PRO, \u043D\u043E Plane \u043E\u0431\u0440\u0435\u0437\u0430\u0435\u0442 4-5 \u0443\u0440\u043E\u0432\u043D\u0438. Rocket \u0437\u0430 $110/\u0433\u043E\u0434 \u043E\u0442\u043A\u0440\u044B\u0432\u0430\u0435\u0442 \u043F\u043E\u043B\u043D\u0443\u044E \u0433\u043B\u0443\u0431\u0438\u043D\u0443 PRO (5 \u0443\u0440.) + \u0434\u043E\u0445\u043E\u0434 \u0441 \u0442\u0430\u0440\u0438\u0444\u043E\u0432 \u0434\u043E 10 \u0443\u0440.');
      }
    }

    // Optimal
    toggle(dom['optimal-block'], v.status === 'pro' && (v.tariff === 'rocket' || v.tariff === 'shuttle') && !cur.isCapped);

    // CTA — 4 состояния
    if (dom['cta-button']) {
      if (v.status === 'free') {
        var pp = v.hasCoins ? 20 : 40;
        dom['cta-button'].textContent = '\u{1F525} \u0423\u0434\u0432\u043E\u0438\u0442\u044C \u0434\u043E\u0445\u043E\u0434: \u041A\u0443\u043F\u0438\u0442\u044C PRO \u0437\u0430 $' + pp;
        dom['cta-button'].href = 'https://t.me/sethubble_biz_bot?start=buy_pro';
        dom['cta-button'].className = 'btn-main';
      } else if (v.tariff === 'plane') {
        dom['cta-button'].textContent = '\u{1F680} \u0420\u0430\u0437\u0431\u043B\u043E\u043A\u0438\u0440\u043E\u0432\u0430\u0442\u044C \u0443\u0440\u043E\u0432\u043D\u0438: \u041A\u0443\u043F\u0438\u0442\u044C Rocket ($110)';
        dom['cta-button'].href = 'https://t.me/sethubble_biz_bot?start=calculator_rocket';
        dom['cta-button'].className = 'btn-main';
      } else if (v.tariff === 'rocket' && cur.isCapped) {
        dom['cta-button'].textContent = '\u{1F6F8} \u041F\u0440\u043E\u0431\u0438\u0442\u044C \u043F\u043E\u0442\u043E\u043B\u043E\u043A: \u041A\u0443\u043F\u0438\u0442\u044C Shuttle ($350)';
        dom['cta-button'].href = 'https://t.me/sethubble_biz_bot?start=calculator_shuttle';
        dom['cta-button'].className = 'btn-main';
      } else {
        var tariffName = v.tariff === 'shuttle' ? 'Shuttle' : 'Rocket';
        dom['cta-button'].textContent = '\u{1F389} \u0410\u043A\u0442\u0438\u0432\u0438\u0440\u043E\u0432\u0430\u0442\u044C \u0441\u0432\u044F\u0437\u043A\u0443 PRO + ' + tariffName;
        dom['cta-button'].href = 'https://t.me/sethubble_biz_bot?start=calculator_' + v.tariff;
        dom['cta-button'].className = 'btn-main';
      }
    }
  }

  var chartInstance = null;

  function renderChart(res, v, dom) {
    if (!dom['income-chart']) return;
    if (chartInstance) { chartInstance.destroy(); chartInstance = null; }
    if (typeof Chart === 'undefined') {
      setTimeout(function () { renderChart(res, v, dom); }, 300);
      return;
    }

    var maxL = 10;
    var labels = [];
    for (var l = 1; l <= maxL; l++) labels.push('L' + l);

    function cumCapped(byLevel, capLimit, l1Income) {
      var data = [];
      var l2Cum = 0;
      for (var i = 0; i < maxL; i++) {
        if (i < byLevel.length) {
          if (i === 0) {
            data.push(Math.round(byLevel[0].total));
          } else {
            l2Cum += byLevel[i].total;
            data.push(Math.round(l1Income + Math.min(l2Cum, capLimit)));
          }
        } else {
          data.push(data.length > 0 ? data[data.length - 1] : 0);
        }
      }
      return data;
    }

    function cumUncapped(byLevel) {
      var data = [];
      var c = 0;
      for (var i = 0; i < maxL; i++) {
        if (i < byLevel.length) {
          c += byLevel[i].total;
          data.push(Math.round(c));
        } else {
          data.push(c);
        }
      }
      return data;
    }

    var isPain = res.missedPro > 0 || res.missedSh > 0 || res.current.isCapped;
    var currentColor = isPain ? '#ef4444' : '#06b6d4';
    var currentData = cumCapped(res.current.byLevel, res.current.capLimit, res.current.l1Income);

    var datasets = [{
      label: isPain ? '\u0412\u0430\u0448 \u0434\u043E\u0445\u043E\u0434 (\u0441 \u043F\u043E\u0442\u0435\u0440\u044F\u043C\u0438)' : '\u0412\u0430\u0448 \u0434\u043E\u0445\u043E\u0434',
      data: currentData,
      borderColor: currentColor,
      backgroundColor: isPain ? 'rgba(239,68,68,0.08)' : 'rgba(6,182,212,0.08)',
      fill: true,
      tension: 0.3,
      pointRadius: 4,
    }];

    var hasMissed = res.missedPro > 0 || res.missedSh > 0;
    if (hasMissed && res.optimal) {
      var optLabel = (res.current.isCapped && v.tariff === 'rocket')
        ? '\u0414\u043E\u0445\u043E\u0434 \u0441 Shuttle'
        : '\u0414\u043E\u0445\u043E\u0434 \u0441 PRO + Rocket';
      var optData = cumUncapped(res.optimal.byLevel);
      datasets.push({
        label: optLabel,
        data: optData,
        borderColor: '#22c55e',
        backgroundColor: 'rgba(34,197,94,0.08)',
        borderDash: [5, 4],
        fill: true,
        tension: 0.3,
        pointRadius: 4,
        borderWidth: 2,
      });
    }

    chartInstance = new Chart(dom['income-chart'], {
      type: 'line',
      data: { labels: labels, datasets: datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { labels: { color: '#d1d5db', font: { size: 11, weight: 'bold' } } },
          tooltip: {
            callbacks: {
              label: function (ctx) {
                return ctx.dataset.label + ': $' + Math.round(ctx.parsed.y).toLocaleString('ru-RU');
              },
            },
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

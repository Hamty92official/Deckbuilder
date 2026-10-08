/* ============================================================
   MAP SYSTEM — v17 riscritta da zero, bilanciata
   ============================================================ */
(function(global){
  'use strict';

  var MIN_FLOORS = 6;
  var MAX_FLOORS = 8;
  var PAD_X = 100;
  var PAD_TOP = 130;
  var PAD_BOTTOM = 110;

  var TYPES = {
    battle:    { icon:'⚔️', label:'Scontro'      },
    campfire:  { icon:'💤', label:'Accampamento'  },
    statue:    { icon:'⛲', label:'Fontana'       },
    shop:      { icon:'🎴', label:"L'antiquario"  },
    unifier:   { icon:'⚒️', label:'Forgiacarte'   },
    bossFinal: { icon:'💀', label:'Boss'          }
  };

  var currentMap = null;
  var state = null;
  var _onBattle = null;
  var _syncInterval = null;
  var _overlay = null;

  /* ============================================================
     UTILS
     ============================================================ */
  function randInt(a, b) {
    return Math.floor(Math.random() * (b - a + 1)) + a;
  }

  function randFloat(a, b) {
    return a + Math.random() * (b - a);
  }

  function shuffle(a) {
    for (var i = a.length - 1; i > 0; i--) {
      var j = randInt(0, i);
      var tmp = a[i];
      a[i] = a[j];
      a[j] = tmp;
    }
    return a;
  }

  function setBodyMapOpen(on) {
    if (typeof document === 'undefined') return;
    if (on) document.body.classList.add('map-open');
    else document.body.classList.remove('map-open');
  }

  function sceneTransition(fn) {
    var el = document.getElementById('scene-transition');
    if (!el) {
      try { fn(); } catch (e) { console.error('[sceneTransition]', e); }
      return;
    }
    el.classList.add('active');
    setTimeout(function() {
      try { fn(); } catch (e) { console.error('[sceneTransition]', e); }
      setTimeout(function() { el.classList.remove('active'); }, 200);
    }, 850);
  }

  /* ============================================================
     GENERAZIONE MAPPA
     ============================================================ */
  function generatePositions(floors, W, H) {
    PAD_X      = Math.max(80,  Math.round(W * 0.13));
    PAD_TOP    = Math.max(100, Math.round(H * 0.16));
    PAD_BOTTOM = Math.max(90,  Math.round(H * 0.14));
    var numFloors = floors.length;
    var usableH = H - PAD_TOP - PAD_BOTTOM;
    var stepY = usableH / Math.max(1, numFloors - 1);
    var minNodeDistX = 130;
    var usableW = W - PAD_X * 2;

    floors.forEach(function(row, f) {
      var count = row.length;
      var yBase = H - PAD_BOTTOM - f * stepY;

      if (count === 1) {
        row[0].x = W / 2;
        row[0].y = yBase;
        return;
      }

      if (f === numFloors - 2 && count === 2) {
        var center = W / 2;
        var offset = usableW * 0.22;
        row[0].x = center - offset + randFloat(-25, 25);
        row[1].x = center + offset + randFloat(-25, 25);
        row[0].y = yBase + randFloat(-12, 12);
        row[1].y = yBase + randFloat(-12, 12);
        return;
      }

      if (f === 0 && count === 3) {
        var c2 = W / 2;
        var off2 = usableW * 0.30;
        var xs0 = [c2 - off2, c2, c2 + off2];
        row.forEach(function(n, i) {
          n.x = xs0[i] + randFloat(-30, 30);
          n.y = yBase + randFloat(-12, 12);
        });
        return;
      }

      var slotW = usableW / count;
      var xs = [];
      for (var i = 0; i < count; i++) {
        var slotCenter = PAD_X + slotW * (i + 0.5);
        var jitter = slotW * 0.35;
        var x = slotCenter + randFloat(-jitter, jitter);
        x = Math.max(PAD_X + 30, Math.min(W - PAD_X - 30, x));
        xs.push(x);
      }
      xs.sort(function(a, b) { return a - b; });
      for (var k = 1; k < xs.length; k++) {
        if (xs[k] - xs[k - 1] < minNodeDistX) xs[k] = xs[k - 1] + minNodeDistX;
      }
      var overflow = (xs[xs.length - 1] + 40) - (W - PAD_X);
      if (overflow > 0) {
        for (var m = 0; m < xs.length; m++) xs[m] -= overflow;
      }
      row.forEach(function(n, idx) {
        n.x = xs[idx];
        n.y = yBase + randFloat(-15, 15);
      });
    });
  }

  function generateMap(seed) {
    var numFloors = randInt(MIN_FLOORS, MAX_FLOORS);
    var floors = [];
    var f, i;

    for (f = 0; f < numFloors; f++) {
      var count;
      if (f === 0) count = 3;
      else if (f === numFloors - 1) count = 1;
      else if (f === numFloors - 2) count = 2;
      else count = randInt(2, 3);
      var row = [];
      for (i = 0; i < count; i++) {
        row.push({
          id: 'n_' + f + '_' + i,
          floor: f,
          idx: i,
          type: null,
          edges: [],
          incoming: [],
          x: 0,
          y: 0
        });
      }
      floors.push(row);
    }

    var stage = document.getElementById('map-stage');
    var W = stage ? stage.clientWidth : 1000;
    var H = stage ? stage.clientHeight : 800;
    generatePositions(floors, W, H);

    /* Connessioni anti-crossing */
    for (f = 0; f < numFloors - 1; f++) {
      var curr = floors[f].slice().sort(function(a, b) { return a.x - b.x; });
      var next = floors[f + 1].slice().sort(function(a, b) { return a.x - b.x; });

      if (next.length === 1) {
        curr.forEach(function(n) {
          n.edges.push(next[0].id);
          next[0].incoming.push(n.id);
        });
        continue;
      }

      var prevIdx = 0;
      curr.forEach(function(n) {
        var bestIdx = prevIdx;
        var bestDist = Math.abs(next[prevIdx].x - n.x);
        for (var j = prevIdx + 1; j < next.length; j++) {
          var d = Math.abs(next[j].x - n.x);
          if (d < bestDist) {
            bestDist = d;
            bestIdx = j;
          }
        }
        n.edges.push(next[bestIdx].id);
        next[bestIdx].incoming.push(n.id);
        prevIdx = bestIdx;
      });

      curr.forEach(function(n, i) {
        if (next.length < 2) return;
        if (n.edges.length >= 2) return;
        var tId = n.edges[0];
        var tIdx = next.findIndex(function(t) { return t.id === tId; });
        var candidates = [];
        if (tIdx > 0) candidates.push(tIdx - 1);
        if (tIdx < next.length - 1) candidates.push(tIdx + 1);
        if (candidates.length === 0) return;
        candidates.sort(function(a, b) {
          return Math.abs(next[a].x - n.x) - Math.abs(next[b].x - n.x);
        });
        var altIdx = candidates[0];
        var altTarget = next[altIdx];
        if (altTarget.incoming.length >= 3) return;
        if (Math.abs(altTarget.x - n.x) > 220) return;
        var lo = Math.min(tIdx, altIdx);
        var hi = Math.max(tIdx, altIdx);
        var crosses = false;
        for (var k = i + 1; k < curr.length; k++) {
          var other = curr[k];
          for (var e = 0; e < other.edges.length; e++) {
            var eIdx = next.findIndex(function(t) { return t.id === other.edges[e]; });
            if (eIdx < hi && eIdx > lo - 1 && other.x > n.x && eIdx !== tIdx) {
              crosses = true;
              break;
            }
          }
          if (crosses) break;
        }
        if (crosses) return;
        n.edges.push(altTarget.id);
        altTarget.incoming.push(n.id);
      });

      next.forEach(function(t) {
        if (t.incoming.length === 0) {
          var closest = curr.slice().sort(function(a, b) {
            return Math.abs(a.x - t.x) - Math.abs(b.x - t.x);
          })[0];
          closest.edges.push(t.id);
          t.incoming.push(closest.id);
        }
      });
    }

    /* Tipi base */
    floors[0].forEach(function(n) { n.type = 'battle'; });
    floors[floors.length - 1][0].type = 'bossFinal';

    var candidateNodes = [];
    floors.forEach(function(row) {
      row.forEach(function(n) {
        if (n.type === null) {
          n.type = 'battle';
          candidateNodes.push(n);
        }
      });
    });
    shuffle(candidateNodes);

    /* Campfire / Statua */
    var numCampStatue = randInt(1, 2);
    var numCampfire = 0;
    var numStatue = 0;
    if (numCampStatue === 1) {
      if (Math.random() < 0.8) numCampfire = 1;
      else numStatue = 1;
    } else {
      var roll = Math.random();
      if (roll < 0.4) numCampfire = 2;
      else if (roll < 0.7) numStatue = 2;
      else { numCampfire = 1; numStatue = 1; }
    }

    var idx = 0;
    var pickNode = function() { return candidateNodes[idx++]; };
    for (i = 0; i < numCampfire; i++) {
      var n1 = pickNode();
      if (n1) n1.type = 'campfire';
    }
    for (i = 0; i < numStatue; i++) {
      var n2 = pickNode();
      if (n2) n2.type = 'statue';
    }

    /* Shop */
    var midCandidates = candidateNodes.filter(function(n) {
      return n.floor >= Math.floor(numFloors * 0.4) && n.floor <= numFloors - 2 && n.type === 'battle';
    });
    if (midCandidates.length > 0) {
      midCandidates[randInt(0, midCandidates.length - 1)].type = 'shop';
    } else {
      var n3 = pickNode();
      if (n3) n3.type = 'shop';
    }

    /* Unifier */
    var usedFloors = new Set();
    candidateNodes.forEach(function(n) { if (n.type === 'shop') usedFloors.add(n.floor); });
    var midCandidates2 = candidateNodes.filter(function(n) {
      return n.floor >= Math.floor(numFloors * 0.4) && n.floor <= numFloors - 2 && n.type === 'battle' && !usedFloors.has(n.floor);
    });
    if (midCandidates2.length > 0) {
      midCandidates2[randInt(0, midCandidates2.length - 1)].type = 'unifier';
    } else {
      var fallback = candidateNodes.find(function(n) { return n.type === 'battle' && n.floor > 0; });
      if (fallback) fallback.type = 'unifier';
    }

    var map = { floors: floors, seed: seed || Date.now(), numFloors: numFloors };
    map.nodeMap = {};
    floors.forEach(function(row) {
      row.forEach(function(n) { map.nodeMap[n.id] = n; });
    });
    return map;
  }

  /* ============================================================
     RENDER
     ============================================================ */
  function renderMap() {
    var _stage = document.getElementById("map-stage");
    if (_stage && currentMap && currentMap.floors && _stage.clientWidth > 0 && _stage.clientHeight > 0) {
      generatePositions(currentMap.floors, _stage.clientWidth, _stage.clientHeight);
    }
    var svg = document.getElementById('map-svg');
    var nodesEl = document.getElementById('map-nodes');
    if (!svg || !nodesEl || !currentMap) return;
    svg.innerHTML = '';
    nodesEl.innerHTML = '';

    var stage = document.getElementById('map-stage');
    var W = stage.clientWidth;
    var H = stage.clientHeight;
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);

    currentMap._edgeGroups = {};

    currentMap.floors.forEach(function(row) {
      row.forEach(function(n) {
        n.edges.forEach(function(targetId) {
          var t = currentMap.nodeMap[targetId];
          var cp1x = n.x;
          var cp1y = n.y + (t.y - n.y) * 0.5;
          var cp2x = t.x;
          var cp2y = t.y - (t.y - n.y) * 0.5;
          var d = 'M ' + n.x + ' ' + n.y + ' C ' + cp1x + ' ' + cp1y + ' ' + cp2x + ' ' + cp2y + ' ' + t.x + ' ' + t.y;

          var g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
          g.setAttribute('class', 'edge-group');
          g.dataset.from = n.id;
          g.dataset.to = targetId;

          var outline = document.createElementNS('http://www.w3.org/2000/svg', 'path');
          outline.setAttribute('class', 'edge-outline');
          outline.setAttribute('d', d);
          var core = document.createElementNS('http://www.w3.org/2000/svg', 'path');
          core.setAttribute('class', 'edge-core');
          core.setAttribute('d', d);
          g.appendChild(outline);
          g.appendChild(core);
          svg.appendChild(g);
          currentMap._edgeGroups[n.id + '->' + targetId] = g;
        });
      });
    });

    currentMap.floors.forEach(function(row) {
      row.forEach(function(n) {
        var el = document.createElement('div');
        el.className = 'node';
        el.dataset.id = n.id;
        el.dataset.type = n.type;
        el.style.left = n.x + 'px';
        el.style.top = n.y + 'px';
        if (n.type === 'bossFinal') el.classList.add('boss-final');
        else if (n.floor === 0) el.classList.add('start');

        var info = TYPES[n.type] || { icon: '?', label: '?' };
        el.innerHTML = '<div class="icon">' + info.icon + '</div>'
                     + '<div class="badge">' + info.label + '</div>'
                     + '<div class="halo-outer"></div>';
        el.title = info.label + ' (floor ' + n.floor + ')';
        el.addEventListener('click', (function(id) {
          return function() { onNodeClick(id); };
        })(n.id));
        nodesEl.appendChild(el);
        n.el = el;
      });
    });

    updateVisuals();
  }

  function updateVisuals() {
    if (!currentMap || !state) return;
    Object.keys(currentMap.nodeMap).forEach(function(id) {
      var n = currentMap.nodeMap[id];
      if (n.el) n.el.classList.remove('visited', 'current', 'available');
    });

    state.visited.forEach(function(id) {
      var n = currentMap.nodeMap[id];
      if (n && n.el) n.el.classList.add('visited');
    });

    if (state.current) {
      var cur = currentMap.nodeMap[state.current];
      if (cur && cur.el) {
        cur.el.classList.remove('visited');
        cur.el.classList.add('current');
      }
    }

    if (state.current === null) {
      currentMap.floors[0].forEach(function(n) {
        if (n.el) n.el.classList.add('available');
      });
    } else {
      state.available.forEach(function(id) {
        var n = currentMap.nodeMap[id];
        if (n && !state.visited.has(id) && n.el) n.el.classList.add('available');
      });
    }

    Object.keys(currentMap._edgeGroups || {}).forEach(function(k) {
      var g = currentMap._edgeGroups[k];
      g.classList.remove('active', 'visited');
      var parts = k.split('->');
      var from = parts[0];
      var to = parts[1];
      if (state.visited.has(to) && state.visited.has(from)) {
        g.classList.add('visited');
      } else if (state.current === from && state.available.has(to)) {
        g.classList.add('active');
      } else if (state.current === null && currentMap.floors[0].some(function(n) { return n.id === to; })) {
        g.classList.add('active');
      }
    });

    renderStats();
    requestAnimationFrame(function() { requestAnimationFrame(syncAnimations); });
  }

  function renderStats() {
    var el = document.getElementById('map-stats');
    if (!el || !currentMap) return;
    var totalFloors = currentMap.numFloors;
    var visitedCount = state.visited.size;
    var lvl = (parseInt(localStorage.getItem('db_level_index') || '0', 10) || 0) + 1;
    el.innerHTML = 'Piano <span>' + Math.min(visitedCount + 1, totalFloors) + '/' + totalFloors + '</span> · Livello <span>' + lvl + '</span>';
  }

  function syncAnimations() {
    var now = performance.now();
    var nodes = document.querySelectorAll('.map-overlay.active .node.available, .map-overlay.active .node.current, .map-overlay.active .node.boss-final.current');
    nodes.forEach(function(el) {
      el.getAnimations().forEach(function(a) {
        var d = a.effect && a.effect.getTiming ? a.effect.getTiming().duration : null;
        if (d && isFinite(d) && d > 0) a.currentTime = now % d;
      });
      try {
        el.getAnimations({ subtree: true }).forEach(function(a) {
          var d = a.effect && a.effect.getTiming ? a.effect.getTiming().duration : null;
          if (d && isFinite(d) && d > 0) a.currentTime = now % d;
        });
      } catch (err) { /* ignore */ }
    });
  }

  function startSyncLoop() {
    if (_syncInterval) clearInterval(_syncInterval);
    _syncInterval = setInterval(syncAnimations, 400);
  }

  /* ============================================================
     POPUP
     ============================================================ */
  function showPopup(icon, title, text, btnLabel, onBtn) {
    var popup = document.getElementById('map-popup');
    if (!popup) return;
    document.getElementById('map-popup-icon').textContent = icon;
    document.getElementById('map-popup-title').textContent = title;
    document.getElementById('map-popup-text').innerHTML = text;
    var btn = document.getElementById('map-popup-btn');
    var newBtn = btn.cloneNode(true);
    newBtn.textContent = btnLabel || 'Continua';
    btn.parentNode.replaceChild(newBtn, btn);
    newBtn.addEventListener('click', function() {
      popup.classList.remove('active');
      if (onBtn) onBtn();
    });
    popup.classList.add('active');
  }

  /* ============================================================
     NAVIGAZIONE
     ============================================================ */
  function onNodeClick(id) {
    var n = currentMap.nodeMap[id];
    if (!n) return;
    var isStart = n.floor === 0 && state.current === null;
    var isAvail = state.available.has(id);
    if (!isStart && !isAvail) return;

    state.current = id;
    state.visited.add(id);
    state.available = new Set(n.edges);
    updateVisuals();
    handleNode(n);
  }

  function handleNode(n) {
    if (n.type === 'battle' || n.type === 'bossFinal') {
      var kind = n.type === 'bossFinal' ? 'boss' : 'battle';
      sceneTransition(function() {
        hideInstant();
        if (_onBattle) {
          try { _onBattle(kind); } catch (e) { console.error('[MapSystem] onBattle', e); }
        }
      });
      return;
    }

    if (n.type === 'campfire') {
      var maxHp = (typeof getPlayerMaxHp === 'function') ? getPlayerMaxHp() : 75;
      var heal = Math.floor(maxHp * 0.5);
      var msg;
      if (typeof playerHp !== 'undefined') {
        var before = playerHp;
        playerHp = Math.min(maxHp, playerHp + heal);
        var healed = playerHp - before;
        if (typeof updateUIStats === 'function') updateUIStats();
        msg = 'Ti riposi accanto al fuoco e recuperi <b>' + healed + ' HP</b>.';
      } else {
        msg = 'Cura <b>' + heal + ' HP</b>.';
      }
      showPopup('💤', 'Accampamento', msg, 'Continua', function() {});
      return;
    }

    if (n.type === 'statue') {
      var maxHp2 = (typeof getPlayerMaxHp === 'function') ? getPlayerMaxHp() : 75;
      var heal2 = Math.floor(maxHp2 * 0.5);
      var msg2;
      if (typeof playerHp !== 'undefined') {
        var before2 = playerHp;
        playerHp = Math.min(maxHp2, playerHp + heal2);
        var healed2 = playerHp - before2;
        if (typeof updateUIStats === 'function') updateUIStats();
        msg2 = "L'acqua sacra ti ristora di <b>" + healed2 + " HP</b>.";
      } else {
        msg2 = 'Cura <b>' + heal2 + ' HP</b>.';
      }
      showPopup('⛲', 'Fontana Benedetta', msg2, 'Continua', function() {});
      return;
    }

    if (n.type === 'shop') {
      showPopup('🎴', "L'antiquario", 'Le carte rare arrivano presto.<br>Per ora riposa, avventuriero.', 'Continua', function() {});
      return;
    }

    if (n.type === 'unifier') {
      showPopup('⚒️', 'Forgiacarte', 'La forgiatura di carte è in arrivo.<br>Torna quando i martelli saranno pronti.', 'Continua', function() {});
      return;
    }
  }

  /* ============================================================
     OPEN / HIDE
     ============================================================ */
  function ensureMapExists() {
    if (!currentMap) {
      currentMap = generateMap();
      state = { current: null, visited: new Set(), available: new Set() };
    }
    var nodesCount = document.querySelectorAll('#map-nodes .node').length;
    if (nodesCount === 0) {
      currentMap._edgeGroups = {};
      renderMap();
    }
  }

  function open(opts) {
    var viewOnly = !!(opts && opts.viewOnly);
    if (!_overlay) _overlay = document.getElementById('map-overlay');
    if (!_overlay) { console.error('[MapSystem] #map-overlay non trovato'); return; }
    ensureMapExists();
    if (typeof hideBanner === 'function') hideBanner();
    _overlay.classList.toggle('view-only', viewOnly);
    _overlay.classList.add('active');
    setBodyMapOpen(true);
    startSyncLoop();
    console.log('[MapSystem] open() completato');
  }

  function openViewOnly() {
    open({ viewOnly: true });
  }

  function openInstant(opts) {
    var viewOnly = !!(opts && opts.viewOnly);
    if (!_overlay) _overlay = document.getElementById('map-overlay');
    if (!_overlay) { console.error('[MapSystem] #map-overlay non trovato'); return; }
    ensureMapExists();
    if (typeof hideBanner === 'function') hideBanner();
    _overlay.classList.add('no-transition');
    _overlay.classList.toggle('view-only', viewOnly);
    _overlay.classList.add('active');
    setBodyMapOpen(true);
    void _overlay.offsetWidth;
    _overlay.classList.remove('no-transition');
    startSyncLoop();
    console.log('[MapSystem] openInstant() completato. body:', document.body.className);
  }

  function hide() {
    if (_overlay) _overlay.classList.remove('active', 'view-only');
    setBodyMapOpen(false);
    if (_syncInterval) { clearInterval(_syncInterval); _syncInterval = null; }
  }

  function hideInstant() {
    if (_overlay) {
      _overlay.classList.add('no-transition');
      _overlay.classList.remove('active', 'view-only');
      void _overlay.offsetWidth;
      _overlay.classList.remove('no-transition');
    }
    setBodyMapOpen(false);
    if (_syncInterval) { clearInterval(_syncInterval); _syncInterval = null; }
  }

  /* ============================================================
     CLOSE HANDLERS
     ============================================================ */
  function setupCloseHandlers() {
    if (window.__mapCloseHandlersSetup) return;
    window.__mapCloseHandlersSetup = true;

    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && _overlay && _overlay.classList.contains('view-only')) {
        hide();
      }
    });

    document.addEventListener('click', function(e) {
      if (!_overlay) return;
      if (!_overlay.classList.contains('view-only')) return;
      if (e.target && e.target.id === 'map-close-btn') {
        hide();
      }
    });
  }

  /* ============================================================
     VICTORY / BATTLE
     ============================================================ */
  function handleVictory(kind) {
    console.log('[MapSystem] handleVictory:', kind);
    sceneTransition(function() {
      if (kind === 'boss') {
        currentMap = generateMap();
        state = { current: null, visited: new Set(), available: new Set() };
        var lvl = (parseInt(localStorage.getItem('db_level_index') || '0', 10) || 0) + 1;
        try { localStorage.setItem('db_level_index', String(lvl)); } catch (e) { /* ignore */ }
      }
      openInstant();
    });
  }

  function onBattle(cb) {
    _onBattle = cb;
  }

  function regenerate() {
    currentMap = generateMap();
    state = { current: null, visited: new Set(), available: new Set() };
    renderMap();
  }

  /* ============================================================
     EXPORT / IMPORT (safe, no DOM refs)
     ============================================================ */
  function exportState() {
    if (!currentMap || !state) return null;
    try {
      var cleanFloors = currentMap.floors.map(function(row) {
        return row.map(function(n) {
          return {
            id: n.id,
            floor: n.floor,
            idx: n.idx,
            type: n.type,
            edges: n.edges.slice(),
            incoming: n.incoming.slice(),
            x: n.x,
            y: n.y
          };
        });
      });
      return {
        map: {
          floors: cleanFloors,
          seed: currentMap.seed,
          numFloors: currentMap.numFloors
        },
        current: state.current,
        visited: Array.from(state.visited),
        available: Array.from(state.available)
      };
    } catch (e) {
      console.warn('[MapSystem] exportState failed', e);
      return null;
    }
  }

  function importState(saved) {
    if (!saved || !saved.map) return false;
    try {
      currentMap = saved.map;
      currentMap.nodeMap = {};
      currentMap.floors.forEach(function(row) {
        row.forEach(function(n) { currentMap.nodeMap[n.id] = n; });
      });
      currentMap._edgeGroups = {};
      state = {
        current: saved.current || null,
        visited: new Set(saved.visited || []),
        available: new Set(saved.available || [])
      };
      return true;
    } catch (e) {
      console.warn('[MapSystem] importState failed', e);
      currentMap = null;
      state = null;
      return false;
    }
  }

  /* ============================================================
     EXPORTS
     ============================================================ */
  function repositionNodes() {
    if (!currentMap || !currentMap.floors) return;
    var stage = document.getElementById("map-stage");
    if (!stage || stage.clientWidth <= 0) return;
    generatePositions(currentMap.floors, stage.clientWidth, stage.clientHeight);
    currentMap._edgeGroups = {};
    renderMap();
  }

  var _resizeTimer = null;
  window.addEventListener("resize", function() {
    if (_resizeTimer) clearTimeout(_resizeTimer);
    _resizeTimer = setTimeout(function() {
      if (_overlay && _overlay.classList.contains("active")) repositionNodes();
    }, 200);
  });

  global.MapSystem = {
    open: open,
    openViewOnly: openViewOnly,
    openInstant: openInstant,
    hide: hide,
    hideInstant: hideInstant,
    onBattle: onBattle,
    handleVictory: handleVictory,
    regenerate: regenerate,
    setBodyMapOpen: setBodyMapOpen,
    exportState: exportState,
    importState: importState,
    repositionNodes: repositionNodes,
    isActive: function() { return _overlay && _overlay.classList.contains('active'); }
  };

  /* Setup handlers al primo load */
  setupCloseHandlers();

})(typeof window !== 'undefined' ? window : this);

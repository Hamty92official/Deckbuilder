// ============================================================
//  HELPER ANIMAZIONI — dipende solo dal DOM già pronto
// ============================================================

const fxLayer = document.getElementById('fx-layer');
const playerUi = document.querySelector('.player-ui');
const monsterUi = document.querySelector('.monster-ui');

let FX_SCALE = 1;
function updateFxScale() { FX_SCALE = Math.max(0.55, Math.min(1, window.innerWidth / 900)); }
updateFxScale();
window.addEventListener('resize', updateFxScale);

const FX_COLOR = {
    fire: '#ff9a2e', ember: '#ffd166', arcane: '#c084fc', slash: '#bfe9ff',
    arrow: '#f5e6a8', blood: '#ff5a4d', shield: '#5dedec', heal: '#5df08a',
    poison: '#a96bdc', weak: '#9aa5b1', strength: '#ff8f3c', stun: '#ffe066', lifesteal: '#ff5a4d'
};

function later(ms, fn) { return setTimeout(fn, ms); }

function fxPoint(el) {
    const r = el.getBoundingClientRect();
    const l = fxLayer.getBoundingClientRect();
    return { x: r.left - l.left + r.width / 2, y: r.top - l.top + r.height / 2 };
}

function tableCenter() {
    return { x: fxLayer.clientWidth / 2, y: fxLayer.clientHeight / 2 };
}

function fxEl(cls, x, y, html = '', color = null) {
    const el = document.createElement('div');
    el.className = 'fx ' + cls;
    el.style.left = x + 'px';
    el.style.top = y + 'px';
    if (color) el.style.color = color;
    if (html) el.innerHTML = html;
    fxLayer.appendChild(el);
    return el;
}

function fxAnim(el, keyframes, options) {
    const a = el.animate(keyframes, { fill: 'both', ...options });
    a.onfinish = () => el.remove();
    return a;
}

function splitDamage(total, parts) {
    const base = Math.floor(total / parts);
    const list = Array(parts).fill(base);
    list[parts - 1] += total - base * parts;
    return list;
}

function restartClass(el, cls, ms) {
    el.classList.remove(cls);
    void el.offsetWidth;
    el.classList.add(cls);
    clearTimeout(el['_t_' + cls]);
    el['_t_' + cls] = setTimeout(() => el.classList.remove(cls), ms);
}

function glow(el, rgb) {
    el.style.setProperty('--glow', rgb);
    restartClass(el, 'glow', 700);
}

function floatText(x, y, text, cls) {
    const el = fxEl('fx-float ' + cls, x, y, text);
    fxAnim(el, [
        { transform: 'translateY(10px) scale(0.5)', opacity: 0 },
        { transform: 'translateY(-8px) scale(1.35)', opacity: 1, offset: 0.2 },
        { transform: 'translateY(-26px) scale(1)', opacity: 1, offset: 0.6 },
        { transform: 'translateY(-64px) scale(0.95)', opacity: 0 }
    ], { duration: 1100, easing: 'ease-out' });
}

function burst(x, y, color, count = 10, dist = 70) {
    dist *= FX_SCALE;
    for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const d = dist * (0.45 + Math.random() * 0.55);
        const dot = fxEl('fx-dot', x, y, '', color);
        const size = (4 + Math.random() * 6) * FX_SCALE;
        dot.style.width = dot.style.height = size + 'px';
        fxAnim(dot, [
            { transform: 'translate(0, 0) scale(1)', opacity: 1 },
            { transform: `translate(${Math.cos(angle) * d}px, ${Math.sin(angle) * d}px) scale(0.2)`, opacity: 0 }
        ], { duration: 380 + Math.random() * 300, easing: 'cubic-bezier(0.1, 0.7, 0.3, 1)' });
    }
}

function ring(x, y, color, size = 60, scaleTo = 3, duration = 500, delay = 0) {
    size *= FX_SCALE;
    const el = fxEl('fx-ring', x, y, '', color);
    el.style.width = el.style.height = size + 'px';
    fxAnim(el, [
        { transform: 'scale(0.3)', opacity: 1 },
        { transform: `scale(${scaleTo})`, opacity: 0 }
    ], { duration, delay, easing: 'ease-out' });
}

function screenFlash(rgb, peak = 0.5) {
    const v = document.getElementById('fx-vignette');
    v.style.setProperty('--c', rgb);
    v.animate([{ opacity: 0 }, { opacity: peak, offset: 0.15 }, { opacity: 0 }], { duration: 550, easing: 'ease-out' });
}

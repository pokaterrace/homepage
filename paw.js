/* ぽかてらす：マウス（指）を動かすと、肉球の足あとがついてくる
   ・同時に残る足あとは 5 個まで（古いものから消えます）
   ・パソコンはカーソル、スマホは指でなぞったときに出ます
   ・パソコンが「動きを減らす」設定のときは、ふわっと消える動きはなくして、
     足あとだけを、ぱっと出して、ぱっと消します */
(function () {
  var REDUCED = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  var MAX = 5;            // 同時に残る足あとの数
  var STEP = 70;          // 何px動くたびに 1 歩 出すか
  var SIZE = 28;          // 肉球の大きさ(px)
  var STAY = 2200;        // 足あとが残っている時間(ミリ秒)
  var LIFE = 700;         // すーっと消えるのにかかる時間(ミリ秒)
  var COLOR = '#8a6a4f';  // 肉球の色（こげ茶）

  var SVG = '<svg viewBox="0 0 64 64" width="' + SIZE + '" height="' + SIZE + '" aria-hidden="true">' +
    '<g fill="' + COLOR + '">' +
    '<ellipse cx="32" cy="42" rx="14" ry="11"/>' +
    '<ellipse cx="14" cy="28" rx="6" ry="8" transform="rotate(-20 14 28)"/>' +
    '<ellipse cx="26" cy="17" rx="6" ry="8.5" transform="rotate(-6 26 17)"/>' +
    '<ellipse cx="38" cy="17" rx="6" ry="8.5" transform="rotate(6 38 17)"/>' +
    '<ellipse cx="50" cy="28" rx="6" ry="8" transform="rotate(20 50 28)"/>' +
    '</g></svg>';

  var layer = document.createElement('div');
  layer.setAttribute('aria-hidden', 'true');
  layer.style.cssText = 'position:fixed;left:0;top:0;width:0;height:0;pointer-events:none;z-index:9999;';

  var style = document.createElement('style');
  style.textContent =
    '.paw-print{position:fixed;pointer-events:none;opacity:0;will-change:opacity,transform;' +
    'transition:opacity .25s ease-out;}' +
    '.paw-print.on{opacity:.6;}' +
    '.paw-print.off{opacity:0;transition:opacity ' + (LIFE / 1000) + 's ease-in;}' +
    (REDUCED ? '.paw-print,.paw-print.off{transition:none !important;}' : '');

  function ready(fn) {
    if (document.body) fn(); else document.addEventListener('DOMContentLoaded', fn);
  }

  ready(function () {
    document.head.appendChild(style);
    document.body.appendChild(layer);

    var lastX = null, lastY = null, dist = 0, side = 1, prints = [];

    function addPaw(x, y, angle) {
      // 左右の足を交互に、進行方向に対して少しずらす
      var rad = angle * Math.PI / 180;
      var ox = Math.cos(rad + Math.PI / 2) * 9 * side;
      var oy = Math.sin(rad + Math.PI / 2) * 9 * side;
      side = -side;

      var el = document.createElement('div');
      el.className = 'paw-print';
      el.innerHTML = SVG;
      el.style.left = (x + ox - SIZE / 2) + 'px';
      el.style.top = (y + oy - SIZE / 2) + 'px';
      // 肉球の指が進行方向を向くように回転（上向きの絵なので +90°）
      el.style.transform = 'rotate(' + (angle + 90) + 'deg)';
      layer.appendChild(el);
      requestAnimationFrame(function () { el.classList.add('on'); });

      prints.push(el);
      el._timer = setTimeout(function () { fade(el); }, STAY);

      // 5個を超えたら、いちばん古いものを消す
      while (prints.length > MAX) fade(prints.shift());
    }

    function fade(el) {
      if (!el || el._gone) return;
      el._gone = true;
      clearTimeout(el._timer);
      var i = prints.indexOf(el);
      if (i > -1) prints.splice(i, 1);
      el.classList.remove('on');
      el.classList.add('off');
      setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, LIFE + 100);
    }

    function move(x, y) {
      if (lastX === null) { lastX = x; lastY = y; return; }
      var dx = x - lastX, dy = y - lastY;
      var d = Math.sqrt(dx * dx + dy * dy);
      dist += d;
      if (dist >= STEP) {
        addPaw(x, y, Math.atan2(dy, dx) * 180 / Math.PI);
        dist = 0;
      }
      lastX = x; lastY = y;
    }

    document.addEventListener('mousemove', function (e) { move(e.clientX, e.clientY); }, { passive: true });
    document.addEventListener('touchmove', function (e) {
      var t = e.touches[0]; if (t) move(t.clientX, t.clientY);
    }, { passive: true });
    document.addEventListener('touchstart', function (e) {
      var t = e.touches[0]; if (t) { lastX = t.clientX; lastY = t.clientY; dist = 0; }
    }, { passive: true });
    document.addEventListener('mouseleave', function () { lastX = null; lastY = null; dist = 0; });
  });
})();

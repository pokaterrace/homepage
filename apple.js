/* 高田商店：マウス（指）を動かすと、りんごがころころついてきます
   ・同時に残るりんごは 5 個まで（古いものから消えます）
   ・パソコンはカーソル、スマホは指でなぞったときに出ます
   ・パソコンが「動きを減らす」設定のときは、ふわっと消える動きはなくして、
     りんごだけを、ぱっと出して、ぱっと消します */
(function () {
  var REDUCED = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  var MAX = 5;            // 同時に残るりんごの数
  var STEP = 70;          // 何px動くたびに 1 歩 出すか
  var SIZE = 30;          // りんごの大きさ(px)
  var STAY = 2200;        // りんごが残っている時間(ミリ秒)
  var LIFE = 700;         // すーっと消えるのにかかる時間(ミリ秒)

  var SVG = '<svg viewBox="0 0 64 64" width="' + SIZE + '" height="' + SIZE + '" aria-hidden="true">' +
    '<path d="M32 20 C22 11 7 17 8 35 C9 50 20 60 28 58 C30 57.5 31 57 32 57 C33 57 34 57.5 36 58 C44 60 55 50 56 35 C57 17 42 11 32 20Z" fill="#D9503F"/>' +
    '<path d="M32 20 C22 11 7 17 8 35 C9 50 20 60 28 58 C22 50 18 36 24 26 C26 23 29 21 32 20Z" fill="#B93A2C" opacity=".35"/>' +
    '<ellipse cx="20" cy="30" rx="3.2" ry="6" fill="#fff" opacity=".35" transform="rotate(15 20 30)"/>' +
    '<path d="M32 20 C32 13 34 9 38 5" stroke="#6B4A2F" stroke-width="3" stroke-linecap="round" fill="none"/>' +
    '<path d="M36 13 C39 4 50 3 55 8 C51 15 42 16 36 13Z" fill="#5F8A57"/>' +
    '</svg>';

  var layer = document.createElement('div');
  layer.setAttribute('aria-hidden', 'true');
  layer.style.cssText = 'position:fixed;left:0;top:0;width:0;height:0;pointer-events:none;z-index:9999;';

  var style = document.createElement('style');
  style.textContent =
    '.apple-print{position:fixed;pointer-events:none;opacity:0;will-change:opacity,transform;' +
    'transition:opacity .25s ease-out;}' +
    '.apple-print.on{opacity:.9;}' +
    '.apple-print.off{opacity:0;transition:opacity ' + (LIFE / 1000) + 's ease-in;}' +
    (REDUCED ? '.apple-print,.apple-print.off{transition:none !important;}' : '');

  function ready(fn) {
    if (document.body) fn(); else document.addEventListener('DOMContentLoaded', fn);
  }

  ready(function () {
    document.head.appendChild(style);
    document.body.appendChild(layer);

    var lastX = null, lastY = null, dist = 0, side = 1, prints = [];

    function addApple(x, y, angle) {
      // 左右の足を交互に、進行方向に対して少しずらす
      var rad = angle * Math.PI / 180;
      var ox = Math.cos(rad + Math.PI / 2) * 9 * side;
      var oy = Math.sin(rad + Math.PI / 2) * 9 * side;
      side = -side;

      var el = document.createElement('div');
      el.className = 'apple-print';
      el.innerHTML = SVG;
      el.style.left = (x + ox - SIZE / 2) + 'px';
      el.style.top = (y + oy - SIZE / 2) + 'px';
      // りんごは、少しずつちがう向きに傾けて、ころころ感を出す
      el.style.transform = 'rotate(' + Math.round(Math.random() * 50 - 25) + 'deg)';
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
        addApple(x, y, Math.atan2(dy, dx) * 180 / Math.PI);
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

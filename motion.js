/* Motion for the case pages: pictures rise in as they are scrolled to, a thin line shows how far
   the page has been read, and a soft light follows the pointer on the sub-case cards.
   Text never moves. Titles, paragraphs, numbers, tables, charts and cards are in place from the start,
   so nothing shifts under the eyes of someone who is reading.
   Nothing here is needed to read a page. The head script sets html.anim only when the visitor
   has not asked for reduced motion; without that class, or without this file, everything is visible. */
(function () {
  var root = document.documentElement;
  if (!root.classList.contains('anim')) return;

  // 1. Reveal on scroll, pictures only: screenshots, galleries, before/after pairs and the video.
  //    One animation per picture. Whatever is on screen when the page opens is left alone, so nothing
  //    flickers. A picture is shown as soon as its top edge is inside the window or above it, so a fast
  //    scroll or a jump to the end can never leave anything hidden.
  var blocks = '.fig,.gallery3>figure,.gallery2>figure,.wideshot,.strip>*,.hscroll,.ba>figure,.shots>figure,.video';
  var waiting = [];
  var line = function () { return window.innerHeight * 0.92; };
  [].forEach.call(document.querySelectorAll(blocks), function (el) {
    if (el.parentElement && el.parentElement.closest('.rv')) return;
    if (el.getBoundingClientRect().top < line()) return;
    el.classList.add('rv');
    waiting.push(el);
  });
  function reveal() {
    if (!waiting.length) return;
    var limit = line(), n = 0;
    waiting = waiting.filter(function (el) {
      if (el.getBoundingClientRect().top >= limit) return true;
      el.style.setProperty('--d', Math.min(n++, 5) * 70 + 'ms');   // neighbours follow one another
      el.classList.add('in');
      return false;
    });
  }

  // 2. Reading progress.
  var bar = document.createElement('div');
  bar.className = 'progress';
  bar.setAttribute('aria-hidden', 'true');
  document.body.appendChild(bar);
  function progress() {
    var max = root.scrollHeight - window.innerHeight;
    bar.style.setProperty('--p', max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)).toFixed(4) : '0');
  }

  var queued = false;
  function update() { queued = false; reveal(); progress(); }
  function request() { if (!queued) { queued = true; requestAnimationFrame(update); } }
  window.addEventListener('scroll', request, { passive: true });
  window.addEventListener('resize', request);
  window.addEventListener('load', request);        // images above may have pushed blocks down or up
  window.addEventListener('pageshow', request);
  update();

  // 3. A light under the pointer on the sub-case cards (mouse only).
  if (window.matchMedia('(hover:hover)').matches) {
    [].forEach.call(document.querySelectorAll('.dcard'), function (card) {
      card.addEventListener('pointermove', function (e) {
        var r = card.getBoundingClientRect();
        card.style.setProperty('--mx', (e.clientX - r.left).toFixed(0) + 'px');
        card.style.setProperty('--my', (e.clientY - r.top).toFixed(0) + 'px');
      });
      card.addEventListener('pointerleave', function () {
        card.style.removeProperty('--mx');
        card.style.removeProperty('--my');
      });
    });
  }
})();

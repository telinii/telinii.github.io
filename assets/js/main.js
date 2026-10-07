/* =============================================================
   Portfólio — Luca Telini Crozara
   JavaScript puro, sem dependências. Carregado com `defer`.
   ============================================================= */

(function () {
  'use strict';

  var STORAGE_KEY = 'portfolio-theme';
  var root = document.documentElement;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* ---------- Tema (claro/escuro) com persistência ---------- */

  function getStoredTheme() {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch (e) {
      return null;
    }
  }

  function storeTheme(value) {
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch (e) {
      /* modo privado: ignora */
    }
  }

  function applyTheme(theme) {
    root.setAttribute('data-theme', theme);
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      meta.setAttribute('content', theme === 'light' ? '#f3f0e9' : '#0b1622');
    }
    var label = document.querySelector('[data-theme-label]');
    if (label) {
      label.textContent = theme === 'light' ? 'Tema escuro' : 'Tema claro';
    }
    var toggle = document.querySelector('[data-theme-toggle]');
    if (toggle) {
      toggle.setAttribute(
        'aria-label',
        theme === 'light' ? 'Ativar tema escuro' : 'Ativar tema claro'
      );
    }
  }

  function initTheme() {
    var stored = getStoredTheme();
    var initial =
      stored ||
      (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
    applyTheme(initial);

    var toggle = document.querySelector('[data-theme-toggle]');
    if (!toggle) return;

    toggle.addEventListener('click', function () {
      var next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
      applyTheme(next);
      storeTheme(next);
    });
  }

  /* ---------- Menu mobile ---------- */

  function initNav() {
    var toggle = document.querySelector('.nav-toggle');
    var nav = document.getElementById('site-nav');
    if (!toggle || !nav) return;

    function close() {
      toggle.setAttribute('aria-expanded', 'false');
      nav.classList.remove('is-open');
    }

    toggle.addEventListener('click', function () {
      var open = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!open));
      nav.classList.toggle('is-open', !open);
    });

    nav.addEventListener('click', function (event) {
      if (event.target.closest('a')) close();
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') close();
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth > 864) close();
    });
  }

  /* ---------- Reveal on scroll ---------- */

  function initReveal() {
    var items = document.querySelectorAll('.reveal');
    if (!items.length) return;

    if (reduceMotion.matches || !('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var delay = Math.min(Number(entry.target.dataset.delay || 0), 240);
          window.setTimeout(function () {
            entry.target.classList.add('is-visible');
          }, delay);
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.12 }
    );

    items.forEach(function (el, index) {
      /* Escalona os irmãos dentro do mesmo grupo para dar ritmo. */
      el.dataset.delay = String((index % 3) * 70);
      observer.observe(el);
    });
  }

  /* ---------- Link ativo na navegação ---------- */

  function initScrollSpy() {
    var links = document.querySelectorAll('.site-nav a[href^="#"]');
    if (!links.length || !('IntersectionObserver' in window)) return;

    var map = {};
    var targets = [];

    links.forEach(function (link) {
      var section = document.querySelector(link.getAttribute('href'));
      if (!section) return;
      map[section.id] = link;
      targets.push(section);
    });

    var spy = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          var link = map[entry.target.id];
          if (!link) return;
          if (entry.isIntersecting) {
            links.forEach(function (l) { l.removeAttribute('aria-current'); });
            link.setAttribute('aria-current', 'true');
          }
        });
      },
      { rootMargin: '-45% 0px -50% 0px' }
    );

    targets.forEach(function (section) { spy.observe(section); });
  }

  /* ---------- Copiar e-mail ---------- */

  function initCopy() {
    var button = document.querySelector('[data-copy]');
    var status = document.querySelector('.copy-status');
    if (!button || !status) return;

    var value = button.getAttribute('data-copy') || '';
    var idleLabel = button.textContent;

    function feedback(message, isError) {
      status.textContent = message;
      button.textContent = isError ? 'Falhou' : 'Copiado';
      window.setTimeout(function () {
        status.textContent = '';
        button.textContent = idleLabel;
      }, 2400);
    }

    button.addEventListener('click', function () {
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(value).then(
          function () { feedback('E-mail copiado para a área de transferência.', false); },
          function () { fallback(value); }
        );
      } else {
        fallback(value);
      }
    });

    function fallback(text) {
      var area = document.createElement('textarea');
      area.value = text;
      area.setAttribute('readonly', '');
      area.style.position = 'fixed';
      area.style.opacity = '0';
      document.body.appendChild(area);
      area.select();
      var ok = false;
      try {
        ok = document.execCommand('copy');
      } catch (e) {
        ok = false;
      }
      document.body.removeChild(area);
      feedback(ok ? 'E-mail copiado.' : 'Não foi possível copiar automaticamente.', !ok);
    }
  }

  /* ---------- Relógio local (Franca, SP) ---------- */

  function initClock() {
    var el = document.getElementById('clock');
    if (!el) return;

    function tick() {
      var now;
      try {
        now = new Intl.DateTimeFormat('pt-BR', {
          timeZone: 'America/Sao_Paulo',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        }).format(new Date());
      } catch (e) {
        now = '';
      }
      el.textContent = now ? 'Franca, SP — ' + now : '';
    }

    tick();
    window.setInterval(tick, 30000);
  }

  /* ---------- Ano no rodapé ---------- */

  function initYear() {
    var el = document.getElementById('year');
    if (el) el.textContent = String(new Date().getFullYear());
  }

  /* ---------- Parallax dos fundos ---------- */
  /*
   * Um único requestAnimationFrame para todas as seções, com interpolação
   * (lerp) para o movimento "acompanhar" o scroll em vez de saltar.
   * Só transform e opacity são animados — ambos saem cheap na GPU.
   */
  function initParallax() {
    var sections = Array.prototype.slice.call(
      document.querySelectorAll('.section.has-bg[data-bg]')
    );
    if (!sections.length) return;

    /* A URL vira absoluta de propósito: dentro de var() o caminho seria
       resolvido relativo à folha de estilo (assets/css/), não ao documento. */
    sections.forEach(function (section) {
      var url = new URL(section.dataset.bg, document.baseURI).href;
      section.style.setProperty('--bg-image', 'url("' + url + '")');
    });

    var items = sections.map(function (section) {
      return {
        el: section,
        layer: section.querySelector('.section-bg'),
        /* deslocamento total ao percorrer a seção inteira (15% = sutil) */
        range: 0.15,
        /* Opacidade alvo no centro da tela. Acima de ~0.5 o fundo começa a
           competir com o texto; abaixo de ~0.35 ele parece quebrado. */
        target: 0.55,
        current: 0,
        targetY: 0,
        currentY: 0,
        visible: false
      };
    });

    var vh = window.innerHeight;
    var reduced = reduceMotion.matches;

    function measure() {
      vh = window.innerHeight;
    }

    function update() {
      items.forEach(function (item) {
        var rect = item.el.getBoundingClientRect();

        /*.section inteira fora da tela: descarta e marca como observada. */
        if (rect.bottom < -200 || rect.top > vh + 200) {
          if (item.visible) {
            item.visible = false;
            item.layer.style.setProperty('--bg-opacity', '0');
            item.layer.style.setProperty('--parallax-y', '7%');
          }
          return;
        }

        /* Progresso da seção na viewport: 0 quando entra pela baixo, 1 quando sai pelo topo. */
        var progress = (vh - rect.top) / (vh + rect.height);

        /* Parallax: a imagem anda em sentido contrário ao scroll. */
        item.targetY = (0.5 - progress) * item.range * 100;

        /* Opacidade: sobe ao entrar, segura no meio, some ao sair. */
        var fade = Math.min(1, Math.max(0, progress * 2.4));
        item.target = 0.55 * Math.min(1, fade);

        if (reduced) {
          item.current = item.target;
          item.currentY = 0;
        } else {
          item.currentY += (item.targetY - item.currentY) * 0.12;
          item.current += (item.target - item.current) * 0.14;
        }

        item.layer.style.setProperty('--bg-opacity', item.current.toFixed(3));
        item.layer.style.setProperty('--parallax-y', item.currentY.toFixed(3) + '%');
        item.visible = true;
      });
    }

    if (reduced) {
      /* Respeita prefers-reduced-motion: a imagem continua presente, mas fixa.
         Sem deslocamento, sem fade e sem listener de scroll. */
      items.forEach(function (item) {
        item.layer.style.setProperty('--bg-opacity', String(item.target));
        item.layer.style.setProperty('--parallax-y', '0%');
      });
      return;
    }

    if (!('IntersectionObserver' in window)) {
      /* Navegador antigo: estado final estático. */
      update();
      window.addEventListener('resize', function () { measure(); update(); });
      return;
    }

    var ticking = false;
    function onScroll() {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(function () {
        update();
        ticking = false;
      });
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', function () { measure(); update(); });

    measure();
    update();

    /* Para de consumir frames quando a aba não está visível. */
    document.addEventListener('visibilitychange', function () {
      if (!document.hidden) update();
    });
  }

  /* ---------- Circuitos: só anima o que está na tela ---------- */
  function initCircuits() {
    var circuits = document.querySelectorAll('.circuit');
    if (!circuits.length || !('IntersectionObserver' in window)) {
      /* Sem suporte, anima todos — é o comportamento antigo, só mais caro. */
      Array.prototype.forEach.call(circuits, function (c) {
        c.classList.add('is-live');
      });
      return;
    }

    var live = document.querySelectorAll('.circuit.is-live').length;
    function setLive(node, on) {
      if (on) {
        live++;
        node.classList.add('is-live');
      } else {
        live--;
        node.classList.remove('is-live');
      }
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          var on = entry.isIntersecting;
          if (on === entry.target.classList.contains('is-live')) return;
          setLive(entry.target, on);
        });
      },
      /* Margem generosa: o circuito já anima antes de a seção
         entrar totalmente, evitando o "liga-desliga" na borda. */
      { rootMargin: '25% 0px 25% 0px' }
    );

    Array.prototype.forEach.call(circuits, function (c) { observer.observe(c); });
  }

  /* ---------- Inicialização ---------- */

  initTheme();
  initNav();
  initReveal();
  initScrollSpy();
  initCopy();
  initParallax();
  initCircuits();
  initClock();
  initYear();
})();

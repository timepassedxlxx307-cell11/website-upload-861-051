
(function () {
  const header = document.querySelector('[data-header]');
  const toggle = document.querySelector('[data-menu-toggle]');
  const links = document.querySelector('[data-nav-links]');

  if (header) {
    const onScroll = () => {
      header.classList.toggle('scrolled', window.scrollY > 18);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  if (toggle && links) {
    toggle.addEventListener('click', () => {
      links.classList.toggle('open');
    });
  }

  const slides = Array.from(document.querySelectorAll('[data-hero-slide]'));
  const dots = Array.from(document.querySelectorAll('[data-hero-dot]'));
  let current = 0;
  let timer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }
    current = (index + slides.length) % slides.length;
    slides.forEach((slide, i) => {
      slide.classList.toggle('active', i === current);
    });
    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === current);
    });
  }

  function startHero() {
    if (slides.length < 2) {
      return;
    }
    timer = window.setInterval(() => {
      showSlide(current + 1);
    }, 5200);
  }

  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      if (timer) {
        window.clearInterval(timer);
      }
      showSlide(index);
      startHero();
    });
  });

  showSlide(0);
  startHero();

  const panels = Array.from(document.querySelectorAll('[data-filter-panel]'));

  panels.forEach((panel) => {
    const input = panel.querySelector('[data-search-input]');
    const region = panel.querySelector('[data-filter-region]');
    const type = panel.querySelector('[data-filter-type]');
    const year = panel.querySelector('[data-filter-year]');
    const empty = panel.querySelector('[data-filter-empty]');
    const main = panel.parentElement || document;
    const cards = Array.from(main.querySelectorAll('[data-card]'));

    if (!cards.length) {
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const initial = params.get('q') || '';
    if (input && initial) {
      input.value = initial;
    }

    function getText(card) {
      return [
        card.dataset.title,
        card.dataset.region,
        card.dataset.type,
        card.dataset.year,
        card.dataset.genre,
        card.dataset.tags,
        card.textContent
      ].join(' ').toLowerCase();
    }

    function applyFilter() {
      const q = input ? input.value.trim().toLowerCase() : '';
      const r = region ? region.value : '';
      const t = type ? type.value : '';
      const y = year ? year.value : '';
      let visible = 0;

      cards.forEach((card) => {
        const text = getText(card);
        const ok = (!q || text.includes(q)) &&
          (!r || card.dataset.region === r) &&
          (!t || card.dataset.type === t) &&
          (!y || card.dataset.year === y);
        card.style.display = ok ? '' : 'none';
        if (ok) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('show', visible === 0);
      }
    }

    [input, region, type, year].forEach((element) => {
      if (element) {
        element.addEventListener('input', applyFilter);
        element.addEventListener('change', applyFilter);
      }
    });

    applyFilter();
  });
})();

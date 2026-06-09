(function () {
  var header = document.querySelector('[data-header]');
  var toggle = document.querySelector('[data-menu-toggle]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');

  function syncHeader() {
    if (!header) {
      return;
    }
    header.classList.toggle('is-scrolled', window.scrollY > 18);
  }

  syncHeader();
  window.addEventListener('scroll', syncHeader, { passive: true });

  if (toggle && mobilePanel) {
    toggle.addEventListener('click', function () {
      mobilePanel.classList.toggle('open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var currentSlide = 0;
  var slideTimer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }
    currentSlide = (index + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('active', slideIndex === currentSlide);
    });
    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('active', dotIndex === currentSlide);
      dot.setAttribute('aria-pressed', dotIndex === currentSlide ? 'true' : 'false');
    });
  }

  function startHero() {
    if (slideTimer || slides.length < 2) {
      return;
    }
    slideTimer = window.setInterval(function () {
      showSlide(currentSlide + 1);
    }, 5200);
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      showSlide(index);
      if (slideTimer) {
        window.clearInterval(slideTimer);
        slideTimer = null;
      }
      startHero();
    });
  });

  showSlide(0);
  startHero();

  Array.prototype.slice.call(document.querySelectorAll('[data-global-search]')).forEach(function (form) {
    form.addEventListener('submit', function (event) {
      var input = form.querySelector('input[name="q"]');
      var value = input ? input.value.trim() : '';
      if (!value) {
        event.preventDefault();
      }
    });
  });

  var cardSearch = document.querySelector('[data-card-search]');
  var filterButtons = Array.prototype.slice.call(document.querySelectorAll('[data-filter]'));
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
  var empty = document.querySelector('[data-empty-state]');
  var activeFilter = 'all';

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>\"']/g, function (character) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '\"': '&quot;',
        "'": '&#39;'
      }[character];
    });
  }

  function updateCards() {
    if (!cards.length) {
      return;
    }
    var query = normalize(cardSearch && cardSearch.value);
    var visible = 0;

    cards.forEach(function (card) {
      var title = normalize(card.getAttribute('data-title'));
      var meta = normalize(card.getAttribute('data-meta'));
      var type = normalize(card.getAttribute('data-type'));
      var year = normalize(card.getAttribute('data-year'));
      var matchesQuery = !query || title.indexOf(query) !== -1 || meta.indexOf(query) !== -1;
      var matchesFilter = activeFilter === 'all' || type === normalize(activeFilter) || year === normalize(activeFilter) || meta.indexOf(normalize(activeFilter)) !== -1;
      var isVisible = matchesQuery && matchesFilter;
      card.hidden = !isVisible;
      if (isVisible) {
        visible += 1;
      }
    });

    if (empty) {
      empty.classList.toggle('show', visible === 0);
    }
  }

  if (cardSearch) {
    cardSearch.addEventListener('input', updateCards);
  }

  filterButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      activeFilter = button.getAttribute('data-filter') || 'all';
      filterButtons.forEach(function (item) {
        item.classList.toggle('active', item === button);
      });
      updateCards();
    });
  });

  updateCards();

  var searchRoot = document.querySelector('[data-search-page]');
  if (searchRoot && window.SEARCH_MOVIES) {
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';
    var input = searchRoot.querySelector('input[name="q"]');
    var results = searchRoot.querySelector('[data-search-results]');
    var emptyText = searchRoot.querySelector('[data-search-empty]');

    if (input) {
      input.value = initialQuery;
    }

    function renderSearch() {
      var query = normalize(input && input.value);
      var found = window.SEARCH_MOVIES.filter(function (movie) {
        if (!query) {
          return movie.featured;
        }
        return normalize(movie.title + ' ' + movie.meta + ' ' + movie.tags + ' ' + movie.oneLine).indexOf(query) !== -1;
      }).slice(0, 96);

      if (results) {
        results.innerHTML = found.map(function (movie) {
          var title = escapeHtml(movie.title);
          var region = escapeHtml(movie.region);
          var meta = escapeHtml(movie.meta);
          var oneLine = escapeHtml(movie.oneLine);
          var url = encodeURI(movie.url);
          var cover = encodeURI(movie.cover);

          return [
            '<article class="movie-card">',
            '<a class="movie-poster" href="./' + url + '">',
            '<img src="' + cover + '" alt="' + title + '" loading="lazy">',
            '<span class="poster-chip">' + region + '</span>',
            '<span class="play-chip">▶</span>',
            '</a>',
            '<div class="movie-info">',
            '<h2><a href="./' + url + '">' + title + '</a></h2>',
            '<p class="movie-meta">' + meta + '</p>',
            '<p class="movie-desc">' + oneLine + '</p>',
            '</div>',
            '</article>'
          ].join('');
        }).join('');
      }

      if (emptyText) {
        emptyText.classList.toggle('show', found.length === 0);
      }
    }

    if (input) {
      input.addEventListener('input', renderSearch);
    }
    renderSearch();
  }
})();

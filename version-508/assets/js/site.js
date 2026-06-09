(function () {
  var header = document.querySelector('[data-header]');
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  function updateHeader() {
    if (!header) {
      return;
    }
    if (window.scrollY > 8) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }

  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      var open = mobileNav.classList.toggle('open');
      menuButton.setAttribute('aria-expanded', open ? 'true' : 'false');
      menuButton.textContent = open ? '×' : '☰';
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var active = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === active);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === active);
      });
    }

    function startTimer() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        showSlide(active + 1);
      }, 5200);
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
        startTimer();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(active - 1);
        startTimer();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(active + 1);
        startTimer();
      });
    }

    showSlide(0);
    startTimer();
  }

  var filterRoot = document.querySelector('[data-filter-root]');
  var cardList = document.querySelector('[data-card-list]');
  if (filterRoot && cardList) {
    var input = filterRoot.querySelector('[data-search-input]');
    var typeFilter = filterRoot.querySelector('[data-type-filter]');
    var yearFilter = filterRoot.querySelector('[data-year-filter]');
    var resultCount = filterRoot.querySelector('[data-result-count]');
    var cards = Array.prototype.slice.call(cardList.querySelectorAll('.movie-card'));

    function normalize(value) {
      return String(value || '').trim().toLowerCase();
    }

    function applyFilter() {
      var keyword = normalize(input && input.value);
      var type = normalize(typeFilter && typeFilter.value);
      var year = normalize(yearFilter && yearFilter.value);
      var shown = 0;

      cards.forEach(function (card) {
        var text = normalize(card.getAttribute('data-search'));
        var cardType = normalize(card.getAttribute('data-type'));
        var cardYear = normalize(card.getAttribute('data-year'));
        var matchKeyword = !keyword || text.indexOf(keyword) !== -1;
        var matchType = !type || cardType.indexOf(type) !== -1;
        var matchYear = !year || cardYear === year;
        var visible = matchKeyword && matchType && matchYear;
        card.classList.toggle('is-hidden', !visible);
        if (visible) {
          shown += 1;
        }
      });

      if (resultCount) {
        resultCount.textContent = shown ? '已筛选 ' + shown + ' 部' : '未找到匹配影片';
      }
    }

    [input, typeFilter, yearFilter].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilter);
        control.addEventListener('change', applyFilter);
      }
    });

    applyFilter();
  }
})();

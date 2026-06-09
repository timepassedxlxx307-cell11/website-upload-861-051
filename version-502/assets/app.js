(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  ready(function () {
    var navToggle = document.querySelector(".nav-toggle");
    var mobileNav = document.querySelector(".mobile-nav");
    if (navToggle && mobileNav) {
      navToggle.addEventListener("click", function () {
        var isOpen = mobileNav.classList.toggle("is-open");
        navToggle.setAttribute("aria-expanded", String(isOpen));
      });
    }

    var hero = document.querySelector("[data-hero]");
    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
      var prev = hero.querySelector("[data-hero-prev]");
      var next = hero.querySelector("[data-hero-next]");
      var index = 0;
      var timer = null;

      function showSlide(nextIndex) {
        if (!slides.length) {
          return;
        }
        index = (nextIndex + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("is-active", slideIndex === index);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("is-active", dotIndex === index);
        });
      }

      function restart() {
        if (timer) {
          clearInterval(timer);
        }
        timer = setInterval(function () {
          showSlide(index + 1);
        }, 5200);
      }

      dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
          showSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
          restart();
        });
      });

      if (prev) {
        prev.addEventListener("click", function () {
          showSlide(index - 1);
          restart();
        });
      }

      if (next) {
        next.addEventListener("click", function () {
          showSlide(index + 1);
          restart();
        });
      }

      restart();
    }

    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
    var searchInputs = Array.prototype.slice.call(document.querySelectorAll("[data-search-input]"));
    var filterButtons = Array.prototype.slice.call(document.querySelectorAll("[data-filter-button]"));
    var emptyState = document.querySelector("[data-empty-state]");
    var currentFilter = "all";

    function normalize(value) {
      return (value || "").toString().toLowerCase().trim();
    }

    function applyFilter() {
      if (!cards.length) {
        return;
      }
      var query = "";
      searchInputs.forEach(function (input) {
        if (input.value.trim()) {
          query = input.value.trim();
        }
      });
      var normalizedQuery = normalize(query);
      var normalizedFilter = normalize(currentFilter);
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute("data-title"),
          card.getAttribute("data-genre"),
          card.getAttribute("data-tags"),
          card.getAttribute("data-category")
        ].join(" "));
        var queryMatch = !normalizedQuery || haystack.indexOf(normalizedQuery) !== -1;
        var filterMatch = normalizedFilter === "all" || haystack.indexOf(normalizedFilter) !== -1;
        var shouldShow = queryMatch && filterMatch;
        card.classList.toggle("is-hidden", !shouldShow);
        if (shouldShow) {
          visible += 1;
        }
      });

      if (emptyState) {
        emptyState.classList.toggle("is-visible", visible === 0);
      }
    }

    var params = new URLSearchParams(window.location.search);
    var queryParam = params.get("q") || "";
    if (queryParam && searchInputs.length) {
      searchInputs.forEach(function (input) {
        input.value = queryParam;
      });
      applyFilter();
    }

    searchInputs.forEach(function (input) {
      input.addEventListener("input", applyFilter);
    });

    filterButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        currentFilter = button.getAttribute("data-filter-button") || "all";
        filterButtons.forEach(function (item) {
          item.classList.toggle("is-active", item === button);
        });
        applyFilter();
      });
    });

    Array.prototype.slice.call(document.querySelectorAll(".site-search-form")).forEach(function (form) {
      form.addEventListener("submit", function (event) {
        var input = form.querySelector("input[name='q'], [data-search-input]");
        var value = input ? input.value.trim() : "";
        if (!value) {
          return;
        }
        var action = form.getAttribute("action") || "./search.html";
        if (window.location.pathname.endsWith("/search.html") || window.location.pathname.endsWith("search.html")) {
          event.preventDefault();
          if (history.pushState) {
            history.pushState(null, "", "?q=" + encodeURIComponent(value));
          }
          searchInputs.forEach(function (item) {
            item.value = value;
          });
          applyFilter();
        } else {
          form.setAttribute("action", action);
        }
      });
    });
  });
})();

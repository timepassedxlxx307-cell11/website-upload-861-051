(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function text(value) {
    return String(value || "").toLowerCase().trim();
  }

  function setupMenu() {
    var button = document.querySelector(".menu-toggle");
    var nav = document.querySelector(".mobile-nav");
    if (!button || !nav) {
      return;
    }
    button.addEventListener("click", function () {
      var opened = nav.classList.toggle("is-open");
      button.setAttribute("aria-expanded", opened ? "true" : "false");
    });
  }

  function valuesFor(form) {
    var query = form.querySelector("[data-filter-query]");
    var region = form.querySelector("[data-filter-region]");
    var year = form.querySelector("[data-filter-year]");
    var category = form.querySelector("[data-filter-category]");
    return {
      query: text(query && query.value),
      region: text(region && region.value),
      year: text(year && year.value),
      category: text(category && category.value)
    };
  }

  function matches(card, values) {
    var haystack = text(card.getAttribute("data-search"));
    var region = text(card.getAttribute("data-region"));
    var year = text(card.getAttribute("data-year"));
    var category = text(card.getAttribute("data-category"));
    if (values.query && haystack.indexOf(values.query) === -1) {
      return false;
    }
    if (values.region && region.indexOf(values.region) === -1) {
      return false;
    }
    if (values.year && year.indexOf(values.year) === -1) {
      return false;
    }
    if (values.category && category !== values.category) {
      return false;
    }
    return true;
  }

  function applyFilters(form) {
    var targetId = form.getAttribute("data-filter-target");
    var target = targetId ? document.getElementById(targetId) : null;
    if (!target) {
      return;
    }
    var values = valuesFor(form);
    var cards = target.querySelectorAll(".movie-card");
    cards.forEach(function (card) {
      card.hidden = !matches(card, values);
    });
  }

  function setupFilters() {
    var forms = document.querySelectorAll("[data-filter-form]");
    forms.forEach(function (form) {
      var input = form.querySelector("[data-filter-query]");
      var params = new URLSearchParams(window.location.search);
      var query = params.get("q");
      if (input && query) {
        input.value = query;
      }
      form.addEventListener("input", function () {
        applyFilters(form);
      });
      form.addEventListener("change", function () {
        applyFilters(form);
      });
      form.addEventListener("reset", function () {
        window.setTimeout(function () {
          applyFilters(form);
        }, 0);
      });
      applyFilters(form);
    });
  }

  ready(function () {
    setupMenu();
    setupFilters();
  });
})();

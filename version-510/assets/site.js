(function () {
    var navToggle = document.querySelector("[data-nav-toggle]");
    var nav = document.querySelector("[data-site-nav]");

    if (navToggle && nav) {
        navToggle.addEventListener("click", function () {
            nav.classList.toggle("is-open");
        });
    }

    var carousel = document.querySelector("[data-hero-carousel]");

    if (carousel) {
        var slides = Array.prototype.slice.call(carousel.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-dot]"));
        var current = 0;
        var timer = null;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }

            current = (index + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
            });
        }

        function startTimer() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }

        var prev = carousel.querySelector("[data-hero-prev]");
        var next = carousel.querySelector("[data-hero-next]");

        if (prev) {
            prev.addEventListener("click", function () {
                showSlide(current - 1);
                startTimer();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                showSlide(current + 1);
                startTimer();
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                showSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
                startTimer();
            });
        });

        showSlide(0);
        startTimer();
    }

    Array.prototype.slice.call(document.querySelectorAll("[data-filter-root]")).forEach(function (root) {
        var queryInput = root.querySelector("[data-filter-query]");
        var typeSelect = root.querySelector("[data-filter-type]");
        var yearSelect = root.querySelector("[data-filter-year]");
        var resetButton = root.querySelector("[data-filter-reset]");
        var cards = Array.prototype.slice.call(root.querySelectorAll(".movie-card"));

        function normalize(value) {
            return String(value || "").trim().toLowerCase();
        }

        function applyFilter() {
            var query = normalize(queryInput && queryInput.value);
            var type = typeSelect ? typeSelect.value : "";
            var year = yearSelect ? yearSelect.value : "";

            cards.forEach(function (card) {
                var haystack = normalize(card.getAttribute("data-search"));
                var cardType = card.getAttribute("data-type") || "";
                var cardYear = card.getAttribute("data-year") || "";
                var visible = true;

                if (query && haystack.indexOf(query) === -1) {
                    visible = false;
                }

                if (type && cardType !== type) {
                    visible = false;
                }

                if (year && cardYear !== year) {
                    visible = false;
                }

                card.classList.toggle("is-hidden", !visible);
            });
        }

        [queryInput, typeSelect, yearSelect].forEach(function (control) {
            if (control) {
                control.addEventListener("input", applyFilter);
                control.addEventListener("change", applyFilter);
            }
        });

        if (resetButton) {
            resetButton.addEventListener("click", function () {
                if (queryInput) {
                    queryInput.value = "";
                }

                if (typeSelect) {
                    typeSelect.value = "";
                }

                if (yearSelect) {
                    yearSelect.value = "";
                }

                applyFilter();
            });
        }
    });
}());

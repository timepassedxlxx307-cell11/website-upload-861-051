(function () {
    var mobileButton = document.querySelector('[data-mobile-menu]');
    var mobilePanel = document.querySelector('[data-mobile-panel]');

    if (mobileButton && mobilePanel) {
        mobileButton.addEventListener('click', function () {
            mobilePanel.classList.toggle('open');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
    var previous = document.querySelector('[data-hero-prev]');
    var next = document.querySelector('[data-hero-next]');
    var activeSlide = 0;
    var timer = null;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }

        activeSlide = (index + slides.length) % slides.length;

        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle('active', slideIndex === activeSlide);
        });

        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle('active', dotIndex === activeSlide);
        });
    }

    function startSlider() {
        if (slides.length <= 1) {
            return;
        }

        window.clearInterval(timer);
        timer = window.setInterval(function () {
            showSlide(activeSlide + 1);
        }, 5200);
    }

    dots.forEach(function (dot, index) {
        dot.addEventListener('click', function () {
            showSlide(index);
            startSlider();
        });
    });

    if (previous) {
        previous.addEventListener('click', function () {
            showSlide(activeSlide - 1);
            startSlider();
        });
    }

    if (next) {
        next.addEventListener('click', function () {
            showSlide(activeSlide + 1);
            startSlider();
        });
    }

    showSlide(0);
    startSlider();

    var filterBars = Array.prototype.slice.call(document.querySelectorAll('[data-filter-scope]'));

    filterBars.forEach(function (scope) {
        var input = scope.querySelector('[data-card-search]');
        var buttons = Array.prototype.slice.call(scope.querySelectorAll('[data-filter]'));
        var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));
        var empty = document.querySelector('[data-empty-state]');
        var currentFilter = 'all';

        function updateCards() {
            var query = input ? input.value.trim().toLowerCase() : '';
            var visible = 0;

            cards.forEach(function (card) {
                var type = (card.getAttribute('data-type') || '').toLowerCase();
                var haystack = [
                    card.getAttribute('data-title') || '',
                    card.getAttribute('data-region') || '',
                    card.getAttribute('data-year') || '',
                    card.getAttribute('data-genre') || '',
                    card.getAttribute('data-tags') || '',
                    card.getAttribute('data-category') || ''
                ].join(' ').toLowerCase();
                var matchesText = !query || haystack.indexOf(query) !== -1;
                var matchesFilter = currentFilter === 'all' || type.indexOf(currentFilter.toLowerCase()) !== -1 || haystack.indexOf(currentFilter.toLowerCase()) !== -1;
                var show = matchesText && matchesFilter;
                card.classList.toggle('hidden', !show);
                if (show) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.classList.toggle('show', visible === 0);
            }
        }

        if (input) {
            input.addEventListener('input', updateCards);

            var params = new URLSearchParams(window.location.search);
            var q = params.get('q');
            if (q) {
                input.value = q;
            }
        }

        buttons.forEach(function (button) {
            button.addEventListener('click', function () {
                currentFilter = button.getAttribute('data-filter') || 'all';
                buttons.forEach(function (item) {
                    item.classList.toggle('active', item === button);
                });
                updateCards();
            });
        });

        updateCards();
    });

    window.initializePlayer = function (source) {
        var video = document.getElementById('movie-player');
        var playButton = document.querySelector('[data-play]');
        var overlay = document.querySelector('.player-cover');
        var hls = null;
        var loaded = false;

        if (!video || !source) {
            return;
        }

        function loadVideo() {
            if (loaded) {
                return;
            }

            loaded = true;

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(source);
                hls.attachMedia(video);
            } else {
                video.src = source;
            }
        }

        function beginPlay() {
            loadVideo();
            video.controls = true;
            if (overlay) {
                overlay.classList.add('hidden');
            }
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(function () {});
            }
        }

        if (playButton) {
            playButton.addEventListener('click', beginPlay);
        }

        if (overlay) {
            overlay.addEventListener('click', beginPlay);
        }

        video.addEventListener('click', function () {
            if (video.paused) {
                beginPlay();
            }
        });

        window.addEventListener('beforeunload', function () {
            if (hls) {
                hls.destroy();
            }
        });
    };
})();

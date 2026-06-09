(function () {
    function ready(fn) {
        if (document.readyState !== 'loading') {
            fn();
        } else {
            document.addEventListener('DOMContentLoaded', fn);
        }
    }

    ready(function () {
        var menuButton = document.querySelector('.menu-toggle');
        var mobileNav = document.querySelector('.mobile-nav');
        if (menuButton && mobileNav) {
            menuButton.addEventListener('click', function () {
                var open = mobileNav.classList.toggle('is-open');
                menuButton.setAttribute('aria-expanded', open ? 'true' : 'false');
            });
        }

        initHero();
        initFilters();
        initPlayer();
    });

    function initHero() {
        var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
        if (!slides.length) {
            return;
        }

        var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
        var prev = document.querySelector('[data-hero-prev]');
        var next = document.querySelector('[data-hero-next]');
        var index = 0;
        var timer;

        function show(target) {
            index = (target + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        }

        function restart() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-dot')) || 0);
                restart();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                restart();
            });
        }

        restart();
    }

    function initFilters() {
        var input = document.getElementById('siteSearch');
        var typeFilter = document.getElementById('typeFilter');
        var regionFilter = document.getElementById('regionFilter');
        var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card-list] .movie-card'));
        if (!cards.length) {
            return;
        }

        var params = new URLSearchParams(window.location.search);
        var q = params.get('q') || '';
        if (input && q) {
            input.value = q;
        }

        function apply() {
            var term = input ? input.value.trim().toLowerCase() : '';
            var typeValue = typeFilter ? typeFilter.value : '';
            var regionValue = regionFilter ? regionFilter.value : '';
            cards.forEach(function (card) {
                var text = (card.getAttribute('data-keywords') || '').toLowerCase();
                var type = card.getAttribute('data-type') || '';
                var region = card.getAttribute('data-region') || '';
                var visible = (!term || text.indexOf(term) !== -1) && (!typeValue || type === typeValue) && (!regionValue || region === regionValue);
                card.hidden = !visible;
            });
        }

        [input, typeFilter, regionFilter].forEach(function (el) {
            if (el) {
                el.addEventListener('input', apply);
                el.addEventListener('change', apply);
            }
        });

        apply();
    }

    function initPlayer() {
        var video = document.querySelector('.player-shell video');
        var shell = document.querySelector('.player-shell');
        var button = document.querySelector('[data-play]');
        var status = document.querySelector('.player-status');
        if (!video || !shell || !button) {
            return;
        }

        var stream = video.getAttribute('data-stream');
        var started = false;
        var hlsInstance = null;

        function setStatus(text) {
            if (status) {
                status.textContent = text || '';
            }
        }

        function load() {
            if (started) {
                return Promise.resolve();
            }
            started = true;

            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: true });
                hlsInstance.loadSource(stream);
                hlsInstance.attachMedia(video);
                hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
                    if (data && data.fatal) {
                        setStatus('播放资源暂时无法加载，请稍后再试。');
                    }
                });
                return Promise.resolve();
            }

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = stream;
                return Promise.resolve();
            }

            setStatus('播放资源暂时无法加载，请稍后再试。');
            return Promise.reject(new Error('unsupported'));
        }

        function play() {
            load().then(function () {
                return video.play();
            }).then(function () {
                shell.classList.add('is-playing');
                setStatus('');
            }).catch(function () {
                setStatus('播放资源暂时无法加载，请稍后再试。');
            });
        }

        button.addEventListener('click', play);
        shell.addEventListener('click', function (event) {
            if (event.target === video && video.paused) {
                play();
            }
        });
        video.addEventListener('play', function () {
            shell.classList.add('is-playing');
        });
        video.addEventListener('pause', function () {
            if (!video.ended) {
                shell.classList.remove('is-playing');
            }
        });
        video.addEventListener('ended', function () {
            shell.classList.remove('is-playing');
            if (hlsInstance) {
                hlsInstance.stopLoad();
            }
        });
    }
})();

(function () {
    function initializeMoviePlayer(elementId, streamUrl) {
        var root = document.getElementById(elementId);

        if (!root) {
            return;
        }

        var video = root.querySelector("video");
        var button = root.querySelector(".play-overlay");
        var hlsInstance = null;
        var hasStarted = false;

        if (!video || !button) {
            return;
        }

        function playVideo() {
            var playRequest = video.play();

            if (playRequest && typeof playRequest.catch === "function") {
                playRequest.catch(function () {
                    button.classList.remove("is-hidden");
                });
            }
        }

        function startPlayback() {
            button.classList.add("is-hidden");

            if (!hasStarted) {
                hasStarted = true;

                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = streamUrl;
                    playVideo();
                    return;
                }

                if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true,
                        backBufferLength: 60
                    });

                    hlsInstance.loadSource(streamUrl);
                    hlsInstance.attachMedia(video);
                    hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, playVideo);
                    hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
                        if (data && data.fatal && hlsInstance) {
                            hlsInstance.destroy();
                            hlsInstance = null;
                            video.src = streamUrl;
                            playVideo();
                        }
                    });
                    return;
                }

                video.src = streamUrl;
            }

            playVideo();
        }

        button.addEventListener("click", startPlayback);

        video.addEventListener("click", function () {
            if (video.paused) {
                startPlayback();
            }
        });

        video.addEventListener("pause", function () {
            if (!video.ended) {
                button.classList.remove("is-hidden");
            }
        });

        video.addEventListener("playing", function () {
            button.classList.add("is-hidden");
        });
    }

    window.initializeMoviePlayer = initializeMoviePlayer;
}());

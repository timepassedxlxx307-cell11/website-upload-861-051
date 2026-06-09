function initMoviePlayer(streamUrl) {
  var video = document.getElementById("movie-player");
  var overlay = document.getElementById("player-overlay");
  var hls = null;

  if (!video || !streamUrl) {
    return;
  }

  function hideOverlay() {
    if (overlay) {
      overlay.classList.add("is-hidden");
    }
  }

  function attachStream() {
    if (video.getAttribute("data-ready") === "true") {
      return;
    }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = streamUrl;
    } else if (window.Hls && window.Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
    } else {
      video.src = streamUrl;
    }

    video.setAttribute("data-ready", "true");
  }

  function startPlayback() {
    attachStream();
    hideOverlay();
    var promise = video.play();
    if (promise && typeof promise.catch === "function") {
      promise.catch(function () {
        if (overlay) {
          overlay.classList.remove("is-hidden");
        }
      });
    }
  }

  attachStream();

  if (overlay) {
    overlay.addEventListener("click", startPlayback);
  }

  video.addEventListener("play", hideOverlay);
  video.addEventListener("click", function () {
    if (video.paused) {
      startPlayback();
    }
  });

  window.addEventListener("pagehide", function () {
    if (hls) {
      hls.destroy();
      hls = null;
    }
  });
}

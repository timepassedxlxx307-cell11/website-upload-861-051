function initMoviePlayer(source) {
  var video = document.getElementById("moviePlayer");
  var overlay = document.getElementById("playOverlay");
  var button = document.getElementById("playButton");
  var loaded = false;
  var hlsInstance = null;

  if (!video || !overlay || !source) {
    return;
  }

  function attachSource() {
    if (loaded) {
      return;
    }
    loaded = true;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hlsInstance.loadSource(source);
      hlsInstance.attachMedia(video);
      return;
    }

    video.src = source;
  }

  function start(event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    attachSource();
    overlay.classList.add("is-hidden");
    var promise = video.play();
    if (promise && typeof promise.catch === "function") {
      promise.catch(function () {
        overlay.classList.remove("is-hidden");
      });
    }
  }

  overlay.addEventListener("click", start);
  if (button) {
    button.addEventListener("click", start);
  }
  video.addEventListener("click", function () {
    if (video.paused) {
      start();
    }
  });
  video.addEventListener("play", function () {
    overlay.classList.add("is-hidden");
  });
  video.addEventListener("ended", function () {
    overlay.classList.remove("is-hidden");
  });
  window.addEventListener("pagehide", function () {
    if (hlsInstance && typeof hlsInstance.destroy === "function") {
      hlsInstance.destroy();
    }
  });
}

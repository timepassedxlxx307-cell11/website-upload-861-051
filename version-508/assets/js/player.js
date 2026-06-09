(function () {
  var boxes = Array.prototype.slice.call(document.querySelectorAll('.js-player-box'));

  function bindPlayer(box) {
    var video = box.querySelector('.js-video');
    var button = box.querySelector('.js-play-button');

    if (!video) {
      return;
    }

    var streamUrl = video.getAttribute('src') || '';
    var canUseNative = video.canPlayType('application/vnd.apple.mpegurl');
    var Hls = window.Hls;

    if (streamUrl && Hls && Hls.isSupported()) {
      var hls = new Hls({
        enableWorker: true,
        lowLatencyMode: false,
        backBufferLength: 90
      });
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
      box.hlsInstance = hls;
    } else if (streamUrl && canUseNative) {
      video.src = streamUrl;
    }

    function markPlaying() {
      box.classList.add('playing');
    }

    function markPaused() {
      if (video.paused) {
        box.classList.remove('playing');
      }
    }

    function startPlayback() {
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {});
      }
    }

    if (button) {
      button.addEventListener('click', startPlayback);
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        startPlayback();
      }
    });

    video.addEventListener('play', markPlaying);
    video.addEventListener('playing', markPlaying);
    video.addEventListener('pause', markPaused);
    video.addEventListener('ended', markPaused);
  }

  boxes.forEach(bindPlayer);
})();

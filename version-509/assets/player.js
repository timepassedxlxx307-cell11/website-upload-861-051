import { H as Hls } from './hls-vendor.js';

export function initMoviePlayer(source) {
  var video = document.getElementById('movie-video');
  var cover = document.getElementById('movie-play-cover');
  var playButton = document.getElementById('movie-play-button');
  var message = document.getElementById('movie-player-message');
  var loaded = false;
  var hls = null;

  function showMessage(text) {
    if (!message) {
      return;
    }
    message.textContent = text;
    message.classList.add('show');
  }

  function loadVideo() {
    if (!video || loaded) {
      return;
    }
    loaded = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      return;
    }

    if (Hls && Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      hls.on(Hls.Events.ERROR, function (event, data) {
        if (data && data.fatal) {
          showMessage('播放暂时不可用，请稍后再试');
        }
      });
      return;
    }

    video.src = source;
  }

  function beginPlay() {
    if (!video) {
      return;
    }
    loadVideo();
    if (cover) {
      cover.hidden = true;
    }
    video.controls = true;
    var action = video.play();
    if (action && typeof action.catch === 'function') {
      action.catch(function () {
        if (cover) {
          cover.hidden = false;
        }
        showMessage('点击播放按钮开始观看');
      });
    }
  }

  if (playButton) {
    playButton.addEventListener('click', function (event) {
      event.stopPropagation();
      beginPlay();
    });
  }

  if (cover) {
    cover.addEventListener('click', beginPlay);
  }

  if (video) {
    video.addEventListener('click', function () {
      if (video.paused) {
        beginPlay();
      }
    });
  }

  window.addEventListener('pagehide', function () {
    if (hls) {
      hls.destroy();
      hls = null;
    }
  });
}

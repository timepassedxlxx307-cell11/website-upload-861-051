
import { H as Hls } from './hls-vendor.js';

const shells = Array.from(document.querySelectorAll('[data-player]'));

shells.forEach((shell) => {
  const video = shell.querySelector('video');
  const trigger = shell.querySelector('[data-play-trigger]');
  const errorBox = shell.querySelector('[data-player-error]');
  const stream = shell.dataset.stream;
  let hls = null;
  let ready = false;

  function showError() {
    if (errorBox) {
      errorBox.textContent = '视频加载遇到问题，请稍后重试';
      errorBox.classList.add('show');
    }
  }

  function hideError() {
    if (errorBox) {
      errorBox.textContent = '';
      errorBox.classList.remove('show');
    }
  }

  function prepare() {
    if (!video || !stream || ready) {
      return;
    }
    ready = true;
    hideError();

    if (Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hls.loadSource(stream);
      hls.attachMedia(video);
      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (!data || !data.fatal) {
          return;
        }
        if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
          hls.startLoad();
        } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
          hls.recoverMediaError();
        } else {
          showError();
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = stream;
    } else {
      ready = false;
      showError();
    }
  }

  async function play() {
    if (!video) {
      return;
    }
    prepare();
    shell.classList.add('is-playing');
    try {
      await video.play();
      hideError();
    } catch (_error) {
      shell.classList.remove('is-playing');
    }
  }

  if (trigger) {
    trigger.addEventListener('click', play);
  }

  if (video) {
    video.addEventListener('play', () => {
      shell.classList.add('is-playing');
    });
    video.addEventListener('pause', () => {
      if (video.currentTime === 0) {
        shell.classList.remove('is-playing');
      }
    });
    video.addEventListener('error', showError);
  }

  window.addEventListener('pagehide', () => {
    if (hls) {
      hls.destroy();
      hls = null;
    }
  });
});

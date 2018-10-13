/* global Hls */
/**
 * @param {window.HTMLElement} video
 * @param {string} url
 * @returns {void}
 */
function initVideo(video, url) {
  if (Hls.isSupported()) {
    let hls = new Hls();
    hls.loadSource(url);
    hls.attachMedia(video);
    hls.on(Hls.Events.MANIFEST_PARSED, function() {
      video.play();
    });
  } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = 'https://video-dev.github.io/streams/x36xhzz/x36xhzz.m3u8';
    video.addEventListener('loadedmetadata', function() {
      video.play();
    });
  }
}

initVideo(
    document.getElementById('video-1'),
    'http://localhost:9191/master?url=http%3A%2F%2Flocalhost%3A3102%2Fstreams%2Fsosed%2Fmaster.m3u8'
);

initVideo(
    document.getElementById('video-2'),
    'http://localhost:9191/master?url=http%3A%2F%2Flocalhost%3A3102%2Fstreams%2Fcat%2Fmaster.m3u8'
);

initVideo(
    document.getElementById('video-3'),
    'http://localhost:9191/master?url=http%3A%2F%2Flocalhost%3A3102%2Fstreams%2Fdog%2Fmaster.m3u8'
);

initVideo(
    document.getElementById('video-4'),
    'http://localhost:9191/master?url=http%3A%2F%2Flocalhost%3A3102%2Fstreams%2Fhall%2Fmaster.m3u8'
);


const canvas = document.querySelector('#main_canvas');
const brainessRange = document.querySelector('#BritnessRange');
brainessRange.addEventListener('change', () => {
  console.log(brainessRange.value, "value");
});
const ctx    = canvas.getContext('2d');
const video  = document.getElementById('video-1');
const styles = getComputedStyle(video);
console.log(styles.height,"style");
video.addEventListener('play', function () {

  const $this = this; //cache
  (function loop() {
    canvas.height = video.videoHeight;
    canvas.width = video.videoWidth;
      if (!$this.paused && !$this.ended) {
          ctx.drawImage($this, 0, 0);
          setTimeout(loop, 1000 / 30); // drawing at 30fps
      }
  })();
}, 0);
// video1.addEventListener('click', ()=>{

//   console.log('i am work');
//   // video1.style.width ='600px';
//   // video1.style.height ='600px';
//   video1.classList.toggle('video_opened');
// });

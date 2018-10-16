/* global Hls */
const DIFF_THRESHOLD = 20;
const BLOCK_SIZE = 10;
const I_BLOCK_SIZE = 1 / BLOCK_SIZE;
const DELAY_VIDEO_COMPARE = 1;
const AUDIO_SCALE = 1/5;
/**
 * Создает Canvas
 * @returns {window.HTMLElement}
 */
function createCanvas() {
    const canvas = document.createElement('canvas');

    return canvas;
}
/**
 * Задает размеры canvas
 * @param {window.HTMLElement} canvas
 * @param {number} width
 * @param {number} height
 * @returns {void}
 */
function setCanvasSize(canvas, width, height) {
    canvas.width = width;
    canvas.height = height;

    return canvas;
}
/**
 *  Получаем контекс canvas
 * @param {window.HTMLElement} canvas
 * @returns {object}
 */
function getCanvasContext(canvas) {
    return canvas.getContext('2d');
}
/**
 * @param {number} a
 * @param {number} b
 * @returns {boolean}
 */
function simpleCompare(a, b) {
    return Math.abs(a - b) < DIFF_THRESHOLD;
}
/**
 * Сравниваем два кадра
 * @param {Array} dataA
 * @param {Array} dataB
 * @returns {Array}
 */
function compare(dataA, dataB) {
    if (!dataA || !dataB || dataA.length !== dataB.length) {
        return false;
    }

    const length = dataA.length;
    const result = [];

    for (let register = 0; register < length; register += 4) {
        let value = true;

        for (let index = 0; index < 4; ++ index) {
            value = value && simpleCompare(dataA[register + index], dataB[register + index]);
        }

        result.push(value);
    }

    return result;
}
/**
 *  Рисует квадраты в изменившихся блоках
 * @param {object} ctx
 * @param {Array} diff
 * @param {number} lineLength
 * @returns {void}
 */
function drawDiff(ctx, diff, lineLength) {
    const length = diff.length;

    ctx.save();

    ctx.lineWidth = 2;
    ctx.strokeStyle = '#fff';

    for (let index = 0; index < length; ++ index) {
        const y = Math.floor(index / lineLength) * BLOCK_SIZE;
        const x = (index % lineLength) * BLOCK_SIZE;

        if (!diff[index]) {
            ctx.strokeRect(x, y, BLOCK_SIZE, BLOCK_SIZE);
        }
    }

    ctx.restore();
}
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
    video.src = url;
    video.addEventListener('loadedmetadata', function() {
      video.play();
    });
  }
}
/**
 * Анализатор звука
 * @param {window.HTMLElement} video
 * @param {window.HTMLElement} scaleElem - Элемент который будет изменяться в результате работы Анализатора
 * @param {Function} callBack - Функция которая изменяет scaleElem
 * @returns {void}
 */
function Analyse(video, scaleElem, callBack) {
  AudioContext = window.AudioContext || window.webkitAudioContext;
  MyAudioContext = new AudioContext();
  const source = MyAudioContext.createMediaElementSource(video);
  const analyser = MyAudioContext.createAnalyser();
  const scriptProcessor = MyAudioContext.createScriptProcessor(2048, 1, 1);
  source.connect(analyser);
  source.connect(scriptProcessor);
  analyser.connect(MyAudioContext.destination);
  scriptProcessor.connect(MyAudioContext.destination);
  analyser.fftSize = 128;
  const data = new Uint8Array(analyser.frequencyBinCount);
  scriptProcessor.onaudioprocess = function() {
    analyser.getByteFrequencyData(data);
    const averageValue = data.reduce( (acum, elem) => acum + elem ) / 64;
    callBack(averageValue, scaleElem);
};
}
/**
 * Изменяет scale при получении среднего значение громкости
 * @param {number} averageValue - среднее значение громкости
 * @param {*} scaleElem
 * @returns {void}
 */
function AnalyseCallBack(averageValue, scaleElem) {
  scaleElem.style.transform = `scaleY(${averageValue * AUDIO_SCALE})`;
}
/**
 * Обновляет зачение css фильтров
 * @param {window.HTMLElement} canvas
 * @param {object} data
 * @returns {void}
 */
function updateFilters(canvas, data) {
  canvas.style.filter =`brightness(${data.brightness}%) contrast(${data.contrast}%)`;
}
/**
 *  Реагирует на изменение громкости
 * @returns {void}
 */
function volumeRangeListner() {
  MyVideo.muted = false;
  MyVideo.volume = volumeRange.value / 100;
}
/**
 * Открывает видео в fullscreen
 * @param {window.HTMLElement} video
 * @returns {void}
 */
function openVideo(video) {
  MyVideo = video;
  volumeRange.removeEventListener('change', volumeRangeListner);
  volumeRange.addEventListener('change', volumeRangeListner);
  Analyse(video, analyseElem, AnalyseCallBack);
  let oldImageData;
  const smallCtx = getCanvasContext(smallCanvas);
  const ctx = getCanvasContext(canvas);
  let counter = Infinity;
  let diff;
    const loop = () => {
      const width = video.videoWidth;
      const height = video.videoHeight;
      const smallWidth = Math.ceil(width * I_BLOCK_SIZE);
      const smallHeight = Math.ceil(height * I_BLOCK_SIZE);
      setCanvasSize(smallCanvas, smallWidth, smallHeight);
      setCanvasSize(canvas, width, height);

      smallCtx.drawImage(video, 0, 0, smallWidth, smallHeight);
      ctx.drawImage(video, 0, 0, width, height);
      const imageData = smallCtx.getImageData(0, 0, smallWidth || 1, smallHeight || 1).data;
      if (counter < DELAY_VIDEO_COMPARE && diff) {
        counter++;
      } else {
        diff = compare(imageData, oldImageData);
        counter = 1;
      }
      if (diff) {
        drawDiff(ctx, diff, smallWidth);
      }
      oldImageData = imageData;
      requestAnimationFrame(loop);
    };
    loop();
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

const filtersValues = {
  brightness: 100,
  contrast: 100,
};
const canvas = document.querySelector('#main_canvas');
const videoArray =document.querySelectorAll('.video');
const smallCanvas = createCanvas();
const brightnessRange = document.querySelector('#BrightnessRange');
const contrastRange = document.querySelector('#ContrastRange');
const analyseElem = document.querySelector('.analizator__indicatorblock');
const volumeRange = document.querySelector('#VolumeRange');
const fullscreenContainer = document.querySelector('.video__fullscreen-conatiner');
const canvasContainer = document.querySelector('.canvas__container');
let MyVideo;
let MyAudioContext;
const backButton = document.querySelector('#backButton');
brightnessRange.addEventListener('change', () => {
  filtersValues.brightness = brightnessRange.value;
  updateFilters(canvas, filtersValues);
});
contrastRange.addEventListener('change', () => {
  filtersValues.contrast = contrastRange.value;
  updateFilters(canvas, filtersValues);
});
videoArray.forEach((el)=>{
  el.addEventListener('click', function(e) {
    fullscreenContainer.classList.add('video__fullscreen-conatiner_open');
    canvasContainer.style.transformOrigin = `${e.clientX}px ${e.clientY}px`
    openVideo(this);
  });
});
backButton.addEventListener('click', ()=>{
  MyAudioContext.close();
  fullscreenContainer.classList.remove('video__fullscreen-conatiner_open');
});



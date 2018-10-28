import "@/styles/allPages.scss";
import "@/styles/video.scss";
import Hls from "hls.js";
import { $, $$ } from "../helpers/dom";
const DIFF_THRESHOLD = 20;
const BLOCK_SIZE = 10;
const I_BLOCK_SIZE = 1 / BLOCK_SIZE;
const DELAY_VIDEO_COMPARE = 1;
const AUDIO_SCALE = 1 / 5;

enum videoDictionary {
  "video-1" = "http://localhost:9191/master?url=http%3A%2F%2Flocalhost%3A3102%2Fstreams%2Fsosed%2Fmaster.m3u8",
  "video-2" = "http://localhost:9191/master?url=http%3A%2F%2Flocalhost%3A3102%2Fstreams%2Fcat%2Fmaster.m3u8",
  "video-3" = "http://localhost:9191/master?url=http%3A%2F%2Flocalhost%3A3102%2Fstreams%2Fdog%2Fmaster.m3u8",
  "video-4" = "http://localhost:9191/master?url=http%3A%2F%2Flocalhost%3A3102%2Fstreams%2Fhall%2Fmaster.m3u8",
}
/**
 * Создает Canvas
 */
function createCanvas(): HTMLCanvasElement {
  const myCanvas = document.createElement("canvas");

  return myCanvas;
}
/**
 * Задает размеры canvas
 */
function setCanvasSize(myCanvas: HTMLCanvasElement, width: number, height: number): HTMLCanvasElement {
  if (myCanvas.width !== width) { myCanvas.width = width; }
  if (myCanvas.height !== height) { myCanvas.height = height; }

  return myCanvas;
}
/**
 * Получаем контекс canvas
 */
function getCanvasContext(myCanvas: HTMLCanvasElement): CanvasRenderingContext2D {
  return myCanvas.getContext("2d") as CanvasRenderingContext2D;
}

function simpleCompare(a: number, b: number): boolean {
  return Math.abs(a - b) < DIFF_THRESHOLD;
}
/**
 * Сравниваем два кадра
 */
function compare(dataA: Uint8ClampedArray, dataB: Uint8ClampedArray): boolean[] | false {
  if (!dataA || !dataB || dataA.length !== dataB.length) {
    return false;
  }

  const length = dataA.length;
  const result = [];

  for (let register = 0; register < length; register += 4) {
    let value = true;

    for (let index = 0; index < 4; ++index) {
      value = value && simpleCompare(dataA[register + index], dataB[register + index]);
    }

    result.push(value);
  }

  return result;
}
/**
 * Рисует квадраты в изменившихся блоках
 */
function drawDiff(ctx: CanvasRenderingContext2D, diff: boolean[], lineLength: number): void {
  const length = diff.length;

  ctx.lineWidth = 2;
  ctx.strokeStyle = "#fff";

  for (let index = 0; index < length; ++index) {
    const y = Math.floor(index / lineLength) * BLOCK_SIZE;
    const x = (index % lineLength) * BLOCK_SIZE;

    if (!diff[index]) {
      ctx.strokeRect(x, y, BLOCK_SIZE, BLOCK_SIZE);
    }
  }

  ctx.restore();
}

function initVideo(video: HTMLVideoElement, url: string) {
  if (Hls.isSupported()) {
    const hls = new Hls();
    hls.loadSource(url);
    hls.attachMedia(video);
    hls.on(Hls.Events.MANIFEST_PARSED, () => {
      video.play();
    });
  } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
    video.src = url;
    video.addEventListener("loadedmetadata", () => {
      video.play();
    });
  }
}
/**
 * Анализатор звука
 */
function analyse(
  video: HTMLVideoElement,
  scaleElem: HTMLDivElement,
  callBack: (averageValue: number, scaleElem: HTMLDivElement) => void): void {
  AudioContext = (window as any).AudioContext || (window as any).webkitAudioContext;
  const MyAudioContext = new AudioContext();
  const source = MyAudioContext.createMediaElementSource(video);
  const analyser = MyAudioContext.createAnalyser();
  const scriptProcessor = MyAudioContext.createScriptProcessor(2048, 1, 1);
  source.connect(analyser);
  source.connect(scriptProcessor);
  analyser.connect(MyAudioContext.destination);
  scriptProcessor.connect(MyAudioContext.destination);
  analyser.fftSize = 128;
  const data = new Uint8Array(analyser.frequencyBinCount);
  scriptProcessor.onaudioprocess = () => {
    analyser.getByteFrequencyData(data);
    const averageValue = data.reduce((acum, elem) => acum + elem) / 64;
    callBack(averageValue, scaleElem);
  };
}
/**
 * Изменяет scale при получении среднего значение громкости
 */
function AnalyseCallBack(averageValue: number, scaleElem: any): void {
  scaleElem.style.transform = `scaleY(${averageValue * AUDIO_SCALE})`;
}
/**
 * Обновляет зачение css фильтров
 */
function updateFilters(myCanvas: HTMLElement, data: IFiltersValues): void {
  myCanvas.style.filter = `brightness(${data.brightness}%) contrast(${data.contrast}%)`;
}
/**
 *  Реагирует на изменение громкости
 */
function volumeRangeListner(): void {
  mainVideo.muted = false;
  mainVideo.volume = Number(volumeRange.value) / 100;
}
/**
 * Открывает видео в fullscreen
 */
function openVideo(video: HTMLVideoElement): void {
  MyVideo = video;
  const key = video.id as keyof typeof videoDictionary;
  initVideo(mainVideo, videoDictionary[key]);
  let oldImageData: Uint8ClampedArray;
  const smallCtx = getCanvasContext(smallCanvas);
  const ctx = getCanvasContext(canvas);
  let counter = Infinity;
  let diff: boolean[] | false;
  /**
   * Цикл отрисовки в canvas
   * @returns {void}
   */
  const loop = (): void => {
    const width = mainVideo.videoWidth;
    const height = mainVideo.videoHeight;
    const smallWidth = Math.ceil(width * I_BLOCK_SIZE);
    const smallHeight = Math.ceil(height * I_BLOCK_SIZE);
    setCanvasSize(smallCanvas, smallWidth, smallHeight);
    setCanvasSize(canvas, width, height);
    smallCtx.drawImage(mainVideo, 0, 0, smallWidth, smallHeight);
    ctx.clearRect(0, 0, width, height);
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

    if (video === MyVideo) { requestAnimationFrame(loop); }
  };
  loop();
}

for (let i = 1; i <= 4; i++) {
  const key = `video-${i}` as keyof typeof videoDictionary;
  initVideo($<HTMLVideoElement>(`#video-${i}`), videoDictionary[key]);
}

interface IFiltersValues {
  brightness: number;
  contrast: number;
}
const filtersValues: IFiltersValues = {
  brightness: 100,
  contrast: 100,
};
const canvas = $<HTMLCanvasElement>("#main_canvas");
const videoArray = $$<HTMLVideoElement>(".video");
const smallCanvas = createCanvas();
const mainVideo = $<HTMLVideoElement>("#main_video");
const brightnessRange = $<HTMLInputElement>("#BrightnessRange");
const contrastRange = $<HTMLInputElement>("#ContrastRange");
const analyseElem = $<HTMLDivElement>(".analizator__indicatorblock");
const volumeRange = $<HTMLInputElement>("#VolumeRange");
const fullscreenContainer = $<HTMLDivElement>(".video__fullscreen-conatiner");
const canvasContainer = $<HTMLDivElement>(".canvas__container");
let MyVideo: HTMLVideoElement;
const backButton = $<HTMLButtonElement>("#backButton");

analyse(mainVideo, analyseElem, AnalyseCallBack);

volumeRange.addEventListener("change", volumeRangeListner);

brightnessRange.addEventListener("change", () => {
  filtersValues.brightness = Number(brightnessRange.value);
  updateFilters(mainVideo, filtersValues);
});
contrastRange.addEventListener("change", () => {
  filtersValues.contrast = Number(contrastRange.value);
  updateFilters(mainVideo, filtersValues);
});
videoArray.forEach((el) => {
  el.addEventListener("click", function(e) {
    fullscreenContainer.classList.add("video__fullscreen-conatiner_open");
    canvasContainer.style.transformOrigin = `${e.clientX}px ${e.clientY}px`;
    openVideo(this);
  });
});
backButton.addEventListener("click", () => {
  mainVideo.muted = true;
  volumeRange.value = "0";
  fullscreenContainer.classList.remove("video__fullscreen-conatiner_open");
});

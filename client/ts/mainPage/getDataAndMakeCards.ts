const parent = $<HTMLDivElement>(".cards-container");
import { $, $$ } from "../helpers/dom";
import isTouchDevice from "../helpers/isTouchDevice";
import postQuery from "../helpers/postQuery";
import ImageWithGestures from "./imageWithGestures";
type typeEl = "critical" | "info";

interface IDataElement {
  type: typeEl;
  size: string;
  title: string;
  source: string;
  time: string;
  description: string | null;
  icon: string;
  data?: {
    type?: string;
    values?: object[];
    temperature?: number;
    humidity?: number;
    albumcover?: string;
    artist?: string;
    track?: {
      name?: string;
      length?: string;
    };
    volume?: number;
    buttons?: [string, string];
    image?: string;
  };
}

interface IDataElementButton extends IDataElement {
  data: {
    buttons: [string, string];
  };
}
interface IDataElementMusic extends IDataElement {
  data: {
    albumcover: string;
    artist: string;
    track: {
      name: string;
      length: string;
    };
    volume: number;
  };
}
interface IDataElementTemperature extends IDataElement {
  data: {
    temperature: number;
    humidity: number;
  };
}
interface IData {
  events: IDataElement[];
}

async function getDataAndMakeCards(state): Promise<void> {
  const types  = getTypesArray(state.type);
  const page =  state.page;
  const itemsPerPage = state.quantity;
  // Обход всех объектов данных
  postQuery<IData>("http://localhost:8000/api/events", {
    itemsPerPage,
    page,
    types,
  }).then((data: IData) => {
    makeCards(data);
  });
}

/**
 * Главная функция которая  создает карточки
 */
function makeCards(data: IData): void {
  parent.innerHTML = "";
  for (const elementData of data.events) {
    const type = findType(elementData);
    const element = makeClone(type);
    setIcon(element, elementData);
    setAttr(element, elementData, "title");
    setAttr(element, elementData, "source");
    setAttr(element, elementData, "time");
    setDescription(element, elementData);
    if (type === "average-card-buttons") { setButtons(element, elementData as IDataElementButton); }
    if (type === "average-card-music") { setMusic(element, elementData as IDataElementMusic); }
    if (type === "average-card-temperature") {
    setTemperatureAndHumidity(element, elementData as IDataElementTemperature);
    }
    // Убрал из-за трудностей в определении оргинального размера для 2 задания
    // if (type === 'large-card-critical') setImage(element, elementData);
    parent.appendChild(element);
  }
  checkTitles();
  const cardsWithPhoto = $$<HTMLDivElement>(".card_large.card_critical");
  // Инициализация объектов класса управления жестов для карточек с изображениями
  for (const cardWithPhoto of cardsWithPhoto) {
    // tslint:disable-next-line:no-unused-expression
    new ImageWithGestures(cardWithPhoto);
  }
  // Если устройство поддерживает тач, убираем ховер с карточек
  if (isTouchDevice()) {
    setMobileClasses();
  }
}

/**
 * Определяю тип карточки исходя из входных данных
 */
function findType(el: IDataElement): string {
  if (el.size === "s") { return "small-card-normal"; }
  if (el.data && el.data.temperature) { return "average-card-temperature"; }
  if (el.size === "m" && el.data && el.data.track) { return "average-card-music"; }
  if (el.size === "m" && el.data && el.data.buttons) { return "average-card-buttons"; }
  if (el.type === "critical" && el.size === "m") { return "average-card-critical"; }
  if (el.type === "critical" && el.size === "l") { return "large-card-critical"; }
  if (el.data && el.data.type === "graph") { return "large-card-normal"; }
  throw new Error("can not find type of element");
}
/**
 * Устанавливает значение выбранного поля в карточке
 */
function setAttr(el: HTMLDivElement, data: IDataElement, attr: string): void {
  const key = attr as keyof IDataElement;
  const elem = $(`.card__${attr}`, el);
  elem.innerHTML = String(data[key]);
}
/**
 * Получаем пути для адаптивных изображений
 */
function getImageData(src: string): { srcset: string; sizes: string } {
  const dotPosition = src.indexOf(".");
  const name = src.slice(0, dotPosition);
  const extension = src.slice(dotPosition);

  const srcset = `${name}${extension} 320w, ${name}2x${extension} 480w, ${name}3x${extension} 800w`;
  const sizes = "(max-width: 320px) 280px, (max-width: 480px) 440px, 800px";

  return {
    sizes,
    srcset,
  };
}

/**
 * Устанавливает пути для изображения
 */
// function setImage(el: HTMLDivElement, data: IDataElement): void {
//   const imageEl = $('.card__picture-line', el);
//   const src = `images/${data.data.image}`;
//   const imageData = getImageData(src);
//   imageEl.setAttribute('srcset', imageData.srcset);
//   imageEl.setAttribute('sizes', imageData.sizes);
//   imageEl.setAttribute('src', src);
// }
/**
 * Устанавливает описание выбранного поля
 */
function setDescription(el: HTMLDivElement, data: IDataElement): void {
  const desc = $(".card__description-line", el);
  if (data.description) { desc.innerHTML = data.description; } else { desc.style.display = "none"; }
}

/**
 * Устанавливает температуру и влажность
 */
function setTemperatureAndHumidity(el: HTMLDivElement, data: IDataElementTemperature): void {
  const tempEl = $(".card__temperature-inner", el);
  tempEl.innerHTML = `${data.data.temperature} C`;
  const humidityEl = $(".card__humidity", el);
  humidityEl.innerHTML = `${data.data.humidity}%`;
}

/**
 * Устанавливает значение кнопок
 */
function setButtons(el: HTMLDivElement, data: IDataElementButton): void {
  const buttonYes = $(".card__button_yes", el);
  const buttonNo = $(".card__button_no", el);
  buttonYes.innerHTML = data.data.buttons[0];
  buttonNo.innerHTML = data.data.buttons[1];
}

/**
 * Устанавливает значение пути для иконок
 */
function setIcon(el: HTMLDivElement, data: IDataElement): void {
  const iconEl = $(".card__icon", el);
  iconEl.setAttribute("src", `./images/${data.icon}.svg`);
}

/**
 * Устанавливает поля карточки с музыкальным плеером
 */
function setMusic(el: HTMLDivElement, data: IDataElementMusic): void {
  const coverEl = $(".card__albumcover", el);

  coverEl.setAttribute("src", data.data.albumcover);
  const name = $(".card__music-name", el);
  name.innerHTML = `${data.data.artist} - ${data.data.track.name}`;
  const length = $(".card__music-length", el);
  length.innerHTML = data.data.track.length;
  const volume = $(".card__music-volume", el);
  volume.innerHTML = `${data.data.volume}%`;
}

/**
 * Создает клон выбранного шаблона
 */
function makeClone(template: string): HTMLDivElement {
  const fragment = $<HTMLTemplateElement>(`#${template}`).content.children[0] as HTMLDivElement;
  const el = document.importNode(fragment, true);
  return el;
}

/**
 * Проверяет высоту загололовка, если она больше 2 строк возвращает false
 */
function checkHeight(element: HTMLDivElement): boolean {
  const styles = getComputedStyle(element);
  const fontSize: number | null = styles !== null ? parseFloat(styles.fontSize || "0") : null;
  if (fontSize) {
    if (Math.ceil(fontSize) * 1.2 * 2 < element.offsetHeight) { return false; }
    return true;
  }
  throw new Error("fontSize === null or  0");
}

/**
 * Проеряет заголовки на высоту, обрезает и ставит три точки, если заголовок больше 2 строк
 * @returns {void}
 */
function checkTitles(): void {
  const titles = $$<HTMLDivElement>(".card__title");
  for (const title of titles) {
    if (!checkHeight(title)) {
      title.innerHTML = title.innerHTML + "...";
      while (!checkHeight(title)) {
        title.innerHTML = title.innerHTML.slice(0, -4) + "...";
      }
    }
  }
}
/**
 * Устанавливает класс всем карточкам, чтобы убрать действие hover
 * @returns {void}
 */
function setMobileClasses(): void {
  const cards = $$<HTMLDivElement>(".card");
  for (const card of cards) {
    card.classList.add("card_mobile");
  }
}

function getTypesArray(type): typeEl[] {
  if (type === "all") {
   return ["critical", "info"];
  } else if (type === "critical") {
   return ["critical"];
  } else if (type === "info") {
   return ["info"];
  } else {
    throw new Error("get invalid type");
  }
 }
export default getDataAndMakeCards;

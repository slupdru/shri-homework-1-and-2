/**
 *
 * @param {string} selector
 * @param {window.HTMLElement} target
 */
const $ = (selector, target) => (target || document).querySelector(selector);
/**
 *
 * @param {string} selector
 * @param {window.HTMLElement} target
 */
const $$ = (selector, target) => (target || document).querySelectorAll(selector) || [];

// Главный контейнер для карточек
const parent = $('.cards-container');

// Обход всех объектов данных
for (let elementData of data.events) {
  const type = findType(elementData);
  const element = makeClone(type);

  setIcon(element, elementData);
  setAttr(element, elementData, 'title');
  setAttr(element, elementData, 'source');
  setAttr(element, elementData, 'time');
  setDescription(element, elementData);

  if (type === 'average-card-buttons') setButtons(element, elementData);
  if (type === 'average-card-music') setMusic(element, elementData);
  if (type === 'average-card-temperature') setTemperatureAndHumidity(element, elementData);
  if (type === 'large-card-critical') setImage(element, elementData);
  parent.appendChild(element);
}

checkTitles();
const cardsWithPhoto = $$('.card_large.card_critical');

// Инициализация объектов класса управления жестов для карточек с изображениями
for (let cardWithPhoto of cardsWithPhoto) {
  new ImageWithGestures(cardWithPhoto);
}
// Если устройство поддерживает тач, убираем ховер с карточек
if (is_touch_device()) {
  setMobileClasses();
}

// Определяю тип карточки исходя из входных данных
function findType(el) {
  if (el.size === 's') return 'small-card-normal';
  if (el.data && el.data.temperature) return 'average-card-temperature';
  if (el.size === 'm' && el.data && el.data.track) return 'average-card-music';
  if (el.size === 'm' && el.data && el.data.buttons) return 'average-card-buttons';
  if (el.type === 'critical' && el.size === 'm') return 'average-card-critical';
  if (el.type === 'critical' && el.size === 'l') return 'large-card-critical';
  if (el.data && el.data.type === 'graph') return 'large-card-normal';
  throw new Error('can not find type of element');
}
/**
 * Устанавливает значение выбранного поля в карточке
 * @param {window.HTMLElement} el
 * @param {object} data
 * @param {string} attr
 */
function setAttr(el, data, attr) {
  const elem = $(`.card__${attr}`, el);
  elem.innerHTML = data[attr];
}
/**
 * Получаем пути для адаптивных изображений
 * @param {string} src 
 */
function getImageData (src) {
  const dotPosition = src.indexOf('.');
  const name = src.slice(0, dotPosition);
  const extension = src.slice(dotPosition) ;

  const srcset = `${name}${extension} 320w, ${name}2x${extension} 480w, ${name}3x${extension} 800w`;
  const sizes = '(max-width: 320px) 280px, (max-width: 480px) 440px, 800px';

  return {
    srcset,
    sizes
  }
}

/**
 * Устанавливает пути для изображения 
 * @param {window.HTMLElement} el
 * @param {object} data
 */
function setImage(el, data){
  const imageEl = $('.card__picture-line', el);
  const src = `images/${data.data.image}`;
  const imageData = getImageData(src);
  imageEl.setAttribute('srcset', imageData.srcset);
  imageEl.setAttribute('sizes', imageData.sizes);
  imageEl.setAttribute('src', src);
}
/**
 * Устанавливает описание выбранного поля
 * @param {window.HTMLElement} el
 * @param {object} data
 */
function setDescription(el, data) {
  const desc = $('.card__description-line', el);
  if (data.description) desc.innerHTML = data.description;
  else desc.style.display = 'none';
}

/**
 * Устанавливает температуру и влажность
 * @param {window.HTMLElement} el
 * @param {object} data
 */
function setTemperatureAndHumidity(el, data) {
  const tempEl = $('.card__temperature-inner', el);
  tempEl.innerHTML = `${data.data.temperature} C`;
  const humidityEl = $('.card__humidity', el);
  humidityEl.innerHTML = `${data.data.humidity}%`;
}

/**
 * Устанавливает значение кнопок
 * @param {window.HTMLElement} el
 * @param {object} data
 */
function setButtons(el, data) {
  const buttonYes = $('.card__button_yes', el);
  const buttonNo = $('.card__button_no', el);
  buttonYes.innerHTML = data.data.buttons[0];
  buttonNo.innerHTML = data.data.buttons[1];
}

/**
 * Устанавливает значение пути для иконок
 * @param {window.HTMLElement} el
 * @param {object} data
 */
function setIcon(el, data) {
  const iconEl = $('.card__icon', el);
  iconEl.setAttribute('src', `./images/${data.icon}.svg`);
}

/**
 * Устанавливает поля карточки с музыкальным плеером
 * @param {window.HTMLElement} el
 * @param {object} data
 */
function setMusic(el, data) {
  const coverEl = $('.card__albumcover', el);
  coverEl.setAttribute('src', data.data.albumcover);
  const name = $('.card__music-name', el);
  name.innerHTML = `${data.data.artist} - ${data.data.track.name}`;
  const length = $('.card__music-length', el);
  length.innerHTML = data.data.track.length;
  const volume = $('.card__music-volume', el);
  volume.innerHTML = `${data.data.volume}%`;
}

/**
 * Создает клон выбранного шаблона
 * @param {string} template
 */
function makeClone(template) {
  const fragment = $(`#${template}`).content;
  const el = document.importNode(fragment, true);
  return el;
}

/**
 * Проверяет высоту загололовка, если она больше 2 строк возвращает false
 * @param {window.HTMLElement} element
 */
function checkHeight(element) {
  const styles = getComputedStyle(element);
  if (Math.ceil(parseFloat(styles.fontSize)) * 1.2 * 2 < element.offsetHeight) return false;
  else return true;
}
/**
 * Проеряет заголовки на высоту, обрезает и ставит три точки, если заголовок больше 2 строк
 */
function checkTitles() {
  const titles = $$('.card__title');
  for (let title of titles) {
    if (!checkHeight(title)) {
      title.innerHTML = title.innerHTML + '...';
      while (!checkHeight(title)) {
        title.innerHTML = title.innerHTML.slice(0, -4) + '...';
      }
    }
  }
}
/**
 * Устанавливает класс всем карточкам, чтобы убрать действие hover
 */
function setMobileClasses() {
  const cards = $$('.card');
  for (let card of cards) {
    card.classList.add('card_mobile');
  }
}

/**
 * Проверяет, есть ли тач у устройства
 */
function is_touch_device() {
  return !!('ontouchstart' in window);
}

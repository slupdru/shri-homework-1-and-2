const $ = (selector, target) => (target || document).querySelector(selector);
const $$ = (selector, target) =>
  (target || document).querySelectorAll(selector) || [];
const parent = $(".cards-container");

for (let elementData of data.events) {
  const type = findType(elementData);
  const element = makeClone(type);
  setIcon(element, elementData);
  setAttr(element, elementData, "title");
  setAttr(element, elementData, "source");
  setAttr(element, elementData, "time");
  setDescription(element, elementData);
  if (type === "average-card-buttons") setButtons(element, elementData);
  if (type === "average-card-music") setMusic(element, elementData);
  if (type === "average-card-temperature")
    setTemperatureAndHumidity(element, elementData);
  parent.appendChild(element);
}

checkTitles();
const cardsWithPhoto = $$(".card_large.card_critical");
for (let cardWithPhoto of cardsWithPhoto) {
  new ImageWithGestures(cardWithPhoto);
}
if (is_touch_device()){
  setMobileClasses();
}

function findType(el) {
  if (el.size === "s") return "small-card-normal";
  if (el.data && el.data.temperature) return "average-card-temperature";
  if (el.size === "m" && el.data && el.data.track) return "average-card-music";
  if (el.size === "m" && el.data && el.data.buttons)
    return "average-card-buttons";
  if (el.type === "critical" && el.size === "m") return "average-card-critical";
  if (el.type === "critical" && el.size === "l") return "large-card-critical";
  if (el.data && el.data.type === "graph") return "large-card-normal";
  throw new Error("can not find type of element");
}
function setAttr(el, data, attr) {
  const elem = $(`.card__${attr}`, el);

  elem.innerHTML = data[attr];
}
function setDescription(el, data) {
  const desc = $(".card__description-line", el);
  if (data.description) desc.innerHTML = data.description;
  else desc.style.display = "none";
}
function setTemperatureAndHumidity(el, data) {
  const tempEl = $(".card__temperature-inner", el);
  tempEl.innerHTML = `${data.data.temperature} C`;
  const humidityEl = $(".card__humidity", el);
  humidityEl.innerHTML = `${data.data.humidity}%`;
}
function setButtons(el, data){
  const buttonYes = $(".card__button_yes", el);
  const buttonNo = $(".card__button_no", el);
  buttonYes.innerHTML = data.data.buttons[0];
  buttonNo.innerHTML = data.data.buttons[1];
}
function setIcon(el, data) {
  const iconEl = $(".card__icon", el);
  iconEl.setAttribute("src", `./images/${data.icon}.svg`);
}
function setMusic(el, data) {
  const coverEl = $(".card__albumcover", el);
  coverEl.setAttribute("src", data.data.albumcover);
  const name = $(".card__music-name", el);
  name.innerHTML = `${data.data.artist} - ${data.data.track.name}`;
  const length = $(".card__music-length", el);
  length.innerHTML = data.data.track.length;
  const volume = $(".card__music-volume", el);
  volume.innerHTML = `${data.data.volume}%`;
}
function makeClone(template) {
  const fragment = $(`#${template}`).content;
  const el = document.importNode(fragment, true);
  return el;
}

function checkHeight(element) {
  const styles = getComputedStyle(element);
  if (Math.ceil(parseFloat(styles.fontSize)) * 1.2 * 2 < element.offsetHeight)
    return false;
  else return true;
}
function checkTitles() {
  const titles = $$(".card__title");
  for (let title of titles) {
    if (!checkHeight(title)) {
      title.innerHTML = title.innerHTML + "...";
      while (!checkHeight(title)) {
        title.innerHTML = title.innerHTML.slice(0, -4) + "...";
      }
    }
  }
}

function setMobileClasses(){
  const cards = $$('.card');
  for (let card of cards){
    card.classList.add('card_mobile')
  }
}

function is_touch_device() {
  return !!("ontouchstart" in window);
}





const $ = (selector, target) => (target || document).querySelector(selector);
const $$ = (selector, target) => (target || document).querySelectorAll(selector) || [];
const parent = $('.cards-container');

for (let elementData of data.events){
  const type = findType(elementData);
  const element = makeClone(type);
  setIcon(element, elementData);
  setAttr(element, elementData, 'title');
  setAttr(element, elementData, 'source');
  setAttr(element, elementData, 'time');
  setDescription(element, elementData);
  if (type === 'average-card-music') setMusic(element, elementData)
  if (type === 'average-card-temperature')  setTemperatureAndHumidity(element, elementData)
  parent.appendChild(element);
}
checkTitles();
function findType(el){
  if (el.size ==='s') return 'small-card-normal';
  if (el.data && el.data.temperature) return 'average-card-temperature';
  if(el.size === 'm' && el.data && el.data.track) return 'average-card-music';
  if(el.size === 'm' && el.data && el.data.buttons) return 'average-card-buttons';
  if(el.type === 'critical' && el.size === 'm') return 'average-card-critical';
  if(el.type === 'critical' && el.size === 'l') return 'large-card-critical';
  if (el.data && el.data.type === 'graph') return 'large-card-normal';
  throw new Error('can not find type of element');
} 
function setAttr(el, data, attr){
const elem = $(`.card__${attr}`, el);

elem.innerHTML = data[attr];
}
function setDescription(el, data){
  const desc = $('.card__description-line', el);
  if (data.description) desc.innerHTML = data.description;
  else desc.style.display = 'none';
}
function setTemperatureAndHumidity(el, data){
  const  tempEl = $('.card__temperature-inner', el);
   tempEl.innerHTML = `${data.data.temperature} C`;
  const humidityEl = $('.card__humidity', el);
  humidityEl.innerHTML = `${data.data.humidity}%`;
}

function setIcon(el, data){
  const iconEl = $('.card__icon', el);
  iconEl.setAttribute('src', `./images/${data.icon}.svg`)
}
function setMusic(el, data){
  const coverEl = $('.card__albumcover', el);
  coverEl.setAttribute('src', data.data.albumcover);
  const name = $('.card__music-name', el);
  name.innerHTML = `${data.data.artist} - ${data.data.track.name}`;
  const length = $('.card__music-length', el);
  length.innerHTML = data.data.track.length;
  const volume = $('.card__music-volume', el);
  volume.innerHTML = `${data.data.volume}%`;
}
function makeClone(template){
  const fragment = $(`#${template}`).content
  const el = document.importNode(fragment, true)
  return el;
}
 
function checkHeight(element){
  const styles  = getComputedStyle(element);
  if ((Math.ceil(parseFloat(styles.fontSize)) * 1.2 * 2) < element.offsetHeight) return false
  else return true;
}
function checkTitles(){
const titles = $$('.card__title');
for (let title of titles){
  if(!checkHeight(title)){
    title.innerHTML = title.innerHTML + '...';
    while(!checkHeight(title)){
      title.innerHTML = title.innerHTML.slice(0, -4) + '...';
    }
  }
}
}
class ImageWithGesture{
  constructor(cardWithImage){
    this.loger = $('.card__description-line', cardWithImage);
    this.infoLine = $('.card__onlitouch-line', cardWithImage);
    this.zoomEl = $('.card__zoom-value', cardWithImage);
    this.infoLine.style.display = 'flex';
    this.imageContainer = $('.card__image-container',cardWithImage);
    this.image = $('.card__picture-line-zoom', cardWithImage);
    this.prevX = 0;
    this.scale = 1;
    this.eventsCash = [];
    this.prevDiff = -1;
    this.x = 0;
    this.init();
  }
  updateTranslate(){
    this.image.style.transform = `scale(${this.scale}) translateX(${this.x}px)`; 
  }
  updateScale(){
    this.image.style.transform = `scale(${this.scale}) translateX(${this.x}px)`;
    this.zoomEl.innerHTML = `${Math.round(this.scale*100)}%`; 
  }
  onPoinerDown (ev){
    this.eventsCash.push(ev);
  }
  onPointerMove(ev){
 for (var i = 0; i < this.eventsCash.length; i++) {
  if (ev.pointerId == this.eventsCash[i].pointerId) {
     this.eventsCash[i] = ev;
  break;
  }
}

if (this.eventsCash.length == 2) {
  var curDiff = Math.sqrt(Math.pow(this.eventsCash[0].clientX - this.eventsCash[1].clientX, 2) + Math.pow(this.eventsCash[0].clientY - this.eventsCash[1].clientY, 2));
  if (this.prevDiff > 0) {
      if (this.scale + (curDiff - this.prevDiff)/100 > 1){
         this.scale = this.scale + (curDiff - this.prevDiff)/100
      }
      else{
        this.scale = 1;
      }

    this.updateScale()
  }
  this.prevDiff = curDiff;
}
if (this.eventsCash.length == 1) {
  var cur = ev.offsetX;
  if (this.prevX > 0) {
    this.x = this.x + cur - this.prevX;
    this.updateTranslate()
  }
    this.prevX = cur;
}

  }
  onPointerUp(ev){
  this.remove_event(ev);
  if (this.eventsCash.length < 2) {
    this.prevDiff = -1;
  }
  if (this.eventsCash.length < 1){
    // if (this.isStarted) this.x = this.x + ev.offsetX - this.startX;
    this.prevX = -1;
  }

  }

  remove_event(ev) {
    for (var i = 0; i < this.eventsCash.length; i++) {
      if (this.eventsCash[i].pointerId == ev.pointerId) {
        this.eventsCash.splice(i, 1);
        break;
      }
    }
   }

  init(){
    this.imageContainer.addEventListener('pointerdown', this.onPoinerDown.bind(this));
    this.imageContainer.addEventListener('pointerup', this.onPointerUp.bind(this));
    this.imageContainer.addEventListener('pointercancel', this.onPointerUp.bind(this));
    this.imageContainer.addEventListener('pointerleave', this.onPointerUp.bind(this));
    this.imageContainer.addEventListener('pointermove', this.onPointerMove.bind(this));
  }
}
if (is_touch_device()){
  const cardsWithPhoto = $$('.card_large.card_critical')
  for (let cardWithPhoto of cardsWithPhoto){
    new ImageWithGesture(cardWithPhoto);
  }

}

function is_touch_device() {
  return !!('ontouchstart' in window);
}
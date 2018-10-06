const $ = (selector, target) => (target || document).querySelector(selector);
const parent = $('.cards-container');

for (let elementData of data.events){
  const type = findType(elementData);
  console.log(elementData, "elementData");
  const element = makeClone(type);
  setAttr(element, elementData, 'title');
  setAttr(element, elementData, 'source');
  setAttr(element, elementData, 'time');
  setDescription(element, elementData);
  setIcon(element, elementData);
  if (type === 'average-card-music') setMusic(element, elementData)
  if (type === 'average-card-temperature')  setTemperatureAndHumidity(element, elementData)
  parent.appendChild(element);
}

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
  const elem = $('.card__description-line', el);
  if (data.description) elem.innerHTML = data.description;
  else elem.style.display = 'none';
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

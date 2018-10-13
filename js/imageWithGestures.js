const MIN_ROTATE_ANGLE = 0.6;
const MIN_SCALE_DISTANСE = 30;
import {$} from './helpers/dom';
import isTouchDevice from './helpers/isTouchDevice';
/**
 * class управления жестами на картинке
 */
export default class ImageWithGestures {
  /**
   *
   * @param {window.HTMLElement} cardWithImage
   */
  constructor(cardWithImage) {
    this.infoLine = $('.card__onlitouch-line', cardWithImage);
    this.zoomEl = $('.card__zoom-value', cardWithImage);
    this.lightEl = $('.card__light-value', cardWithImage);
    this.scrollbar = $('.card__scrollbar', cardWithImage);
    this.canvas = $('#canvas_image', cardWithImage);
    this.ctx = this.canvas.getContext('2d');
    this.mobile = isTouchDevice();
    this.imageContainer = $('.card__image-container', cardWithImage);
    this.image = $('.card__picture-line-zoom', cardWithImage);
    this.prevX = 0;
    this.scale = 2;
    this.type = null;
    this.scaleCounter = 0;
    this.angles = null;
    this.coords = null;
    this.brightness = 1;
    this.eventsCash = [];
    this.prevDiff = -1;
    this.prevAngle = -1;
    this.limit = 0;
    this.width = 0;
    this.x = 0;
    this.init();
  }
  /**
   * Функция обновляет значение скроллбара
   * @returns {void}
   */
  updateScrollBar() {
      this.scrollbar.style.transform = `translateX(${(this.x / this.limit) *
         (this.width - this.width / this.scale)}px)`;
      this.scrollbar.style.width = `${100 / this.scale}%`;
  }
  /**
   * Устанавливает значение transform translate в случае жеста одним пальцем
   * @param {number} limit - максимальное значение translate
   * @param {number} size - размер контейнера изображения
   * @returns {void}
   */
  updateTranslate() {
    this.ctx.drawImage(this.image, this.x * this.scale, 0);
   this.updateScrollBar();
  }
  /**
   * Обновляет значение transform scale
   * @returns {void}
   */
  updateScale() {
    this.limit = (this.image.naturalWidth/this.scale - this.image.naturalWidth) / this.scale;
    this.canvas.width = this.image.naturalWidth * 1/this.scale;
    this.canvas.height = this.image.naturalHeight * 1/this.scale;
    if (this.x < this.limit) {
      this.x = this.limit;
  }
    this.ctx.drawImage(this.image, this.x * this.scale, 0);

    this.updateScrollBar();
    if (this.mobile) this.zoomEl.innerHTML = `${Math.round(this.scale * 100)}%`;
  }
  /**
   * Обновляет значение яркости
   * @returns {void}
   */
  updateBrightness() {
    this.canvas.style.filter = `brightness(${this.brightness})`;
    if (this.mobile) this.lightEl.innerHTML = `${Math.round(this.brightness * 100)}%`;
  }
  /**
   * Добавляет событие в кеш
   * @param {window.event} ev
   * @returns {void}
   */
  onPoinerDown(ev) {
    this.imageContainer.setPointerCapture(ev.pointerId);
    this.eventsCash.push(ev);
  }

  /**
   *
   * @param {window.event} ev
   * @returns {void}
   */
  onPointerMove(ev) {
    // Обновляем кэш если событие уже было в нем
    for (let i = 0; i < this.eventsCash.length; i++) {
      if (ev.pointerId == this.eventsCash[i].pointerId) {
        this.eventsCash[i] = ev;
        break;
      }
    }
    // если в кеше два события то обрабатываем жесты для 2 пальцев
    if (this.eventsCash.length == 2) {
      const touchPointA = this.eventsCash[0];
      const touchPointB = this.eventsCash[1];
      // определяем значение центра между двумя пальцами и сохраняем координаты начального положения если их еще не было
      if (this.coords === null) {
        this.coords = {
          center: {
            clientX: (touchPointA.clientX + touchPointB.clientX) / 2,
            clientY: (touchPointA.clientY + touchPointB.clientY) / 2,
          },
          first: {
            clientX: touchPointA.clientX,
            clientY: touchPointA.clientY,
          },
          second: {
            clientX: touchPointB.clientX,
            clientY: touchPointB.clientY,
          },
        };
      }
      // находим текущее расстояние между двумя точками
      const curDiff = Math.sqrt(
          Math.pow(touchPointA.clientX - touchPointB.clientX, 2) +
          Math.pow(touchPointA.clientY - touchPointB.clientY, 2)
      );

      // находим текущий угл относительно изначального положения пальцев
      const angleA = findAngle(this.coords.center, this.coords.first, touchPointA);
      const angleB = findAngle(this.coords.center, this.coords.second, touchPointB);
      // находим среднее изменение угла
      const curAngle = (angleA + angleB) / 2;

      /*
     если изменение обоих углов больше 0.2 то определяем тип текущего жеста как изменение яркости,
     если расстояние между пальцами изменилось на 30, то определяем жест как scale
     */
      if (Math.abs(angleA) > MIN_ROTATE_ANGLE || Math.abs(angleB) > MIN_ROTATE_ANGLE && !this.type) {
        this.type = 'brightness';
      } else if (Math.abs(this.scaleCounter) > MIN_SCALE_DISTANСE && !this.type) {
        this.type = 'scale';
      }

      // вычисляем текущее значение изменения расстояния и прибавляем в счетчик
      if (this.prevDiff > 0) {
        this.scaleCounter += curDiff - this.prevDiff;
        // если значение типа события определено как scale вычисляем текущее значение
        if (this.type === 'scale') {
          const value = this.scale + (curDiff - this.prevDiff) / 100;
          if (value > 1) {
            this.scale = value;
          } else {
            this.scale = 1;
          }
          this.updateScale();
        }
      }

      // если значение типа события определено как brightness вычисляем текущее значение
      if (this.type === 'brightness') {
        this.brightness = this.brightness + (curAngle - this.prevAngle) / 2.5;
        this.updateBrightness();
      }
      this.prevAngle = curAngle;
      this.prevDiff = curDiff;
    }

    // если одно касание, обрабатываем жест перемещения
    if (this.eventsCash.length == 1) {
      const touchPointA = this.eventsCash[0];
      const cur = touchPointA.clientX;
      const value = this.x + cur - this.prevX;
      if (this.prevX > 0) {
        this.x = Math.min(Math.max(value, this.limit), 0);
        this.updateTranslate();
      }
      this.prevX = cur;
    }
  }
  /**
   *
   * @param {window.event} ev
   * @returns {void}
   */
  onPointerUp(ev) {
    // удаляем событие из кеша
    this.removeEvent(ev);
    // если касаний меньше двух, обнуляем значения
    if (this.eventsCash.length < 2) {
      this.prevDiff = -1;
      this.coords = null;
      this.scaleCounter = null;
      this.type = null;
    }
    // если касаний меньше одного, обнуляем значения
    if (this.eventsCash.length < 1) {
      this.prevX = -1;
    }
  }
  /**
   *
   * @param {window.event} ev
   * @returns {void}
   */
  removeEvent(ev) {
    for (let i = 0; i < this.eventsCash.length; i++) {
      if (this.eventsCash[i].pointerId == ev.pointerId) {
        this.eventsCash.splice(i, 1);
        break;
      }
    }
  }


  /**
   * инициируем листнеры
   * @returns {void}
   */
  init() {
    if (this.mobile) this.infoLine.style.display = 'flex';

    this.image.addEventListener('load', ()=>{
      const styles = getComputedStyle(this.canvas);
      this.width = parseFloat(styles.width);
      this.updateScale();
    });
    this.imageContainer.addEventListener('pointerdown', this.onPoinerDown.bind(this));
    this.imageContainer.addEventListener('pointerup', this.onPointerUp.bind(this));
    this.imageContainer.addEventListener('pointercancel', this.onPointerUp.bind(this));
    this.imageContainer.addEventListener('pointerleave', this.onPointerUp.bind(this));
    this.imageContainer.addEventListener('pointermove', this.onPointerMove.bind(this));
  }
}
  /**
   * вычисляет значение угла по 3 точкам
   * @param {object} center
   * @param {object} point1
   * @param {object} point2
   * @returns {object}
   */
function findAngle(center, point1, point2) {
  const OA = {
    x: point1.clientX - center.clientX,
    y: point1.clientY - center.clientY,
  };
  const OB = {
    x: point2.clientX - center.clientX,
    y: point2.clientY - center.clientY,
  };
  const angle = Math.atan2(OA.x * OB.y - OA.y * OB.x, OA.x * OB.x + OA.y * OB.y);
  return angle;
}

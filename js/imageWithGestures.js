class ImageWithGestures {
  constructor(cardWithImage) {
    this.loger = $(".card__description-line", cardWithImage);
    this.infoLine = $(".card__onlitouch-line", cardWithImage);
    this.zoomEl = $(".card__zoom-value", cardWithImage);
    this.lightEl = $(".card__light-value", cardWithImage);
    this.scrollbar = $(".card__scrollbar", cardWithImage);
    this.mobile = is_touch_device();
    this.imageContainer = $(".card__image-container", cardWithImage);
    this.image = $(".card__picture-line-zoom", cardWithImage);
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
    this.x = 0;
    this.init();
  }
  updateTranslate() {
    this.image.style.transform = `scale(${this.scale}) translateX(${this.x}px)`;
  }
  updateScale() {
    this.image.style.transform = `scale(${this.scale}) translateX(${this.x}px)`;
    this.scrollbar.style.width = `${100 / this.scale}%`;
    if (this.mobile) this.zoomEl.innerHTML = `${Math.round(this.scale * 100)}%`;
  }
  updateBrightness() {
    this.image.style.filter = `brightness(${this.brightness})`;
    if (this.mobile)
      this.lightEl.innerHTML = `${Math.round(this.brightness * 100)}%`;
  }
  onPoinerDown(ev) {
    this.eventsCash.push(ev);
  }
  onPointerMove(ev) {
    for (var i = 0; i < this.eventsCash.length; i++) {
      if (ev.pointerId == this.eventsCash[i].pointerId) {
        this.eventsCash[i] = ev;
        break;
      }
    }

    if (this.eventsCash.length == 2) {
      if (this.coords === null) {
        this.coords = {
          center: {
            clientX:
              (this.eventsCash[0].clientX + this.eventsCash[1].clientX) / 2,
            clientY:
              (this.eventsCash[0].clientY + this.eventsCash[1].clientY) / 2
          },
          first: {
            clientX: this.eventsCash[0].clientX,
            clientY: this.eventsCash[0].clientY
          },
          second: {
            clientX: this.eventsCash[1].clientX,
            clientY: this.eventsCash[1].clientY
          }
        };
      }

      const curDiff = Math.sqrt(
        Math.pow(this.eventsCash[0].clientX - this.eventsCash[1].clientX, 2) +
          Math.pow(this.eventsCash[0].clientY - this.eventsCash[1].clientY, 2)
      );
      const curAngle =
        (this.findAngle(
          this.coords.center,
          this.coords.first,
          this.eventsCash[0]
        ) +
          this.findAngle(
            this.coords.center,
            this.coords.second,
            this.eventsCash[1]
          )) /
        2;

      if (
        Math.abs(
          this.findAngle(
            this.coords.center,
            this.coords.first,
            this.eventsCash[0]
          )
        ) > 0.2 &&
        Math.abs(
          this.findAngle(
            this.coords.center,
            this.coords.second,
            this.eventsCash[1]
          )
        ) > 0.2
      )
        this.type = "brightness";
      else if (Math.abs(this.scaleCounter) > 30) {
        this.type = "scale";
      }

      if (this.prevDiff > 0) {
        this.scaleCounter += curDiff - this.prevDiff;
        if (this.type === "scale") {
          if (this.scale + (curDiff - this.prevDiff) / 100 > 1) {
            this.scale = this.scale + (curDiff - this.prevDiff) / 100;
          } else {
            this.scale = 1;
          }
          this.updateScale();
        }
      }

      if (this.type === "brightness") {
        this.brightness = this.brightness + (curAngle - this.prevAngle) / 5;
        this.updateBrightness();
      }
      this.prevAngle = curAngle;
      this.prevDiff = curDiff;
    }

    if (this.eventsCash.length == 1) {
      var cur = ev.offsetX;
      const styles = getComputedStyle(this.image);
      console.log(styles.width, "image width");
      console.log(styles.transform);
      console.log(
        parseFloat(styles.width) -
          parseFloat(styles.width) / (this.scale * this.scale),
        "(parseFloat(styles.width) - parseFloat(styles.width)/(this.scale))"
      );
      if (this.prevX > 0) {
        if (
          Math.abs(this.x + cur - this.prevX) <
          parseFloat(styles.width) -
            parseFloat(styles.width) / (this.scale * 0.75)
        ) {
          this.x = this.x + cur - this.prevX;
        } else {
          this.x =
            Math.sign(this.x + cur - this.prevX) *
            (parseFloat(styles.width) -
              parseFloat(styles.width) / (this.scale * 0.75));
        }

        this.updateTranslate();
      }
      this.prevX = cur;
    }
  }
  onPointerUp(ev) {
    this.remove_event(ev);
    if (this.eventsCash.length < 2) {
      this.prevDiff = -1;
      this.coords = null;
      this.scaleCounter = null;
      this.type = null;
    }
    if (this.eventsCash.length < 1) {
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
  findAngle(center, point1, point2) {
    const OA = {
      x: point1.clientX - center.clientX,
      y: point1.clientY - center.clientY
    };
    const OB = {
      x: point2.clientX - center.clientX,
      y: point2.clientY - center.clientY
    };
    const angle = Math.atan2(
      OA.x * OB.y - OA.y * OB.x,
      OA.x * OB.x + OA.y * OB.y
    );
    return angle;
  }
  init() {
    if (this.mobile) this.infoLine.style.display = "flex";
    this.imageContainer.addEventListener(
      "pointerdown",
      this.onPoinerDown.bind(this)
    );
    this.imageContainer.addEventListener(
      "pointerup",
      this.onPointerUp.bind(this)
    );
    this.imageContainer.addEventListener(
      "pointercancel",
      this.onPointerUp.bind(this)
    );
    this.imageContainer.addEventListener(
      "pointerleave",
      this.onPointerUp.bind(this)
    );
    this.imageContainer.addEventListener(
      "pointermove",
      this.onPointerMove.bind(this)
    );
  }
}

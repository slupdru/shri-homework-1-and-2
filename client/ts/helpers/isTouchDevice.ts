/**
 * Проверяет, есть ли тач у устройства
 */
function isTouchDevice(): boolean {
  return !!("ontouchstart" in window);
}

export default isTouchDevice;

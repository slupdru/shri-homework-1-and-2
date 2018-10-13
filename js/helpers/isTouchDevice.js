/**
 * Проверяет, есть ли тач у устройства
 * @returns {void}
 */
function isTouchDevice() {
  return !!('ontouchstart' in window);
}

export default isTouchDevice;

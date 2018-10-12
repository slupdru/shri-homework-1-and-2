/**
 *
 * @param {string} selector
 * @param {window.HTMLElement} target
 * @returns {window.HTMLElement}
 */
 const $ = (selector, target) => (target || document).querySelector(selector);
/**
 *
 * @param {string} selector
 * @param {window.HTMLElement} target
 * @returns {Array.<HTMLElement>}
 */
const $$ = (selector, target) => (target || document).querySelectorAll(selector) || [];

export {$, $$};

const $ = <E extends HTMLElement>(selector: string, target?: HTMLElement): E => {
  const result = (target || document).querySelector(selector) as E;
  if (result !== null) { return result; }
  throw new Error(`${selector} === null`);
};

const $$ = <E extends HTMLElement>(selector: string, target?: HTMLElement): NodeListOf<E> =>
  (target || document).querySelectorAll(selector);

export { $, $$ };

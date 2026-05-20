import htm from 'htm';
import { createElement, Fragment } from 'react';

// htm passes null or '' for <> fragments; map to React.Fragment
function h(type, props, ...children) {
  return createElement(!type ? Fragment : type, props, ...children);
}

export const html = htm.bind(h);
export { Fragment };

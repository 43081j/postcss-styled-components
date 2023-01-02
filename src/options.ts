import {SyntaxOptions} from 'postcss-js-core';

export const options: SyntaxOptions = {
  id: 'styled-components',
  tagNames: ['styled', 'styled.*', 'styled(*', 'createGlobalStyle', 'css']
};

import {createParser, createStringifier, SyntaxOptions} from 'postcss-js-core';

const options: SyntaxOptions = {
  id: 'styled-components',
  tagNames: ['styled', 'styled.*', 'styled(*', 'createGlobalStyle']
};

export = {
  parse: createParser(options),
  stringify: createStringifier(options)
};

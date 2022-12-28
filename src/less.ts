import {createParser, createStringifier, SyntaxOptions} from 'postcss-js-core';
import {options} from './options.js';
import {parse as lessParser} from 'postcss-less';
import lessStringifier = require('postcss-less/lib/LessStringifier.js');

const lessOptions: SyntaxOptions = {
  ...options,
  parser: lessParser,
  stringifier: lessStringifier
};

export = {
  parse: createParser(lessOptions),
  stringify: createStringifier(lessOptions)
};

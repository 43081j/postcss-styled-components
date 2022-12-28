import {createParser, createStringifier, SyntaxOptions} from 'postcss-js-core';
import {options} from './options.js';
import {parse as scssParser} from 'postcss-scss';
import scssStringifier = require('postcss-scss/lib/scss-stringifier');

const scssOptions: SyntaxOptions = {
  ...options,
  parser: scssParser,
  stringifier: scssStringifier
};

export = {
  parse: createParser(scssOptions),
  stringify: createStringifier(scssOptions)
};

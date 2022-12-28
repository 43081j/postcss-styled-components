import {createParser, createStringifier} from 'postcss-js-core';
import {options} from './options.js';

export = {
  parse: createParser(options),
  stringify: createStringifier(options)
};

declare module 'postcss-scss/lib/scss-stringifier' {
  import Stringifier from 'postcss/lib/stringifier.js';

  const stringifier: typeof Stringifier;

  export = stringifier;
}

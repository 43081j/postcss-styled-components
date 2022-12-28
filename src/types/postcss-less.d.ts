declare module 'postcss-less' {
  import {Parser, Stringifier, Document, Root} from 'postcss';

  const syntax: {
    parse: Parser<Document | Root>;
    stringify: Stringifier;
  };

  export = syntax;
}

declare module 'postcss-less/lib/LessStringifier.js' {
  import Stringifier from 'postcss/lib/stringifier.js';

  const stringifier: typeof Stringifier;

  export = stringifier;
}

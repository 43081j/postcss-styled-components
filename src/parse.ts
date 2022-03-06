import {Parser, Root, Document, ProcessOptions, Input} from 'postcss';
import postcssParse from 'postcss/lib/parse';
import {locationCorrectionWalker} from './locationCorrection.js';
import {RootConfig} from './types.js';
import {
  parseModule,
  extractMatchingTemplates,
  isStyledComponentTemplate,
  deindentSource,
  extractStyleText
} from './utilities.js';

/**
 * Parses CSS from within tagged template literals in a JavaScript document
 * @param {string} source Source code to parse
 * @param {*=} opts Options to pass to PostCSS' parser when parsing
 * @return {Root|Document}
 */
export const parse: Parser<Root | Document> = (
  source: string | {toString(): string},
  opts?: Pick<ProcessOptions, 'map' | 'from'>
): Root | Document => {
  const doc = new Document();
  const sourceAsString = source.toString();
  const ast = parseModule(sourceAsString);
  const extractedStyles = extractMatchingTemplates(
    ast,
    isStyledComponentTemplate
  );

  let currentOffset = 0;

  for (const node of extractedStyles) {
    if (!node.quasi.range) {
      continue;
    }

    const startIndex = node.quasi.range[0] + 1;
    const config: RootConfig = {
      sourceOffsets: {
        prefix: {lines: 0, offset: 0},
        suffix: {lines: 0, offset: 0}
      },
      baseIndentations: new Map<number, number>(),
      expressionStrings: []
    };

    const emptyLinePattern = /^[ \\t\r]*$/;
    let baseIndentation = (node.quasi.loc?.end.column ?? 1) - 1;
    const extractedText = extractStyleText(sourceAsString, node);
    const sourceLines = extractedText.source.split('\n');

    config.expressionStrings = extractedText.expressionStrings;

    if (
      sourceLines.length > 1 &&
      sourceLines[0] !== undefined &&
      emptyLinePattern.test(sourceLines[0])
    ) {
      config.sourceOffsets.prefix.lines = 1;
      config.sourceOffsets.prefix.offset = sourceLines[0].length + 1;
      sourceLines.shift();
    }

    const deindentedStyleText = deindentSource(sourceLines, baseIndentation);
    config.baseIndentations = deindentedStyleText.baseIndentations;

    const root = postcssParse(deindentedStyleText.source, {
      ...opts,
      map: false
    }) as Root;

    root.raws['styledComponents'] = config;
    root.raws.codeBefore = sourceAsString.slice(
      currentOffset,
      startIndex + config.sourceOffsets.prefix.offset
    );
    root.parent = doc;
    // TODO (43081j): stylelint relies on this existing, really unsure why.
    // it could just access root.parent to get the document...
    (root as Root & {document: Document}).document = doc;
    const walker = locationCorrectionWalker(node);
    walker(root);
    root.walk(walker);
    doc.nodes.push(root);

    currentOffset = node.quasi.range[1] - 1;
  }

  if (doc.nodes.length > 0) {
    const last = doc.nodes[doc.nodes.length - 1];
    if (last) {
      last.raws.codeAfter = sourceAsString.slice(currentOffset);
    }
  }

  doc.source = {
    input: new Input(sourceAsString, opts),
    start: {
      line: 1,
      column: 1,
      offset: 0
    }
  };

  return doc;
};

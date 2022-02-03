import {parse as babelParse, ParseResult} from '@babel/parser';
import {default as traverse, NodePath} from '@babel/traverse';
import {TaggedTemplateExpression, Node, File} from '@babel/types';

export const createPlaceholder = (i: number): string => `/*POSTCSS_LIT:${i}*/`;

/**
 * Parses a source string as a JS module
 * @param {string} source Source to parse
 * @return {ParseResult<File>}
 */
export function parseModule(source: string): ParseResult<File> {
  return babelParse(source, {
    sourceType: 'unambiguous',
    plugins: ['typescript', ['decorators', {decoratorsBeforeExport: true}]],
    ranges: true
  });
}

/**
 * Extracts tagged templates from an AST which match a given matcher
 * @param {Node} ast Node to traverse
 * @param {Function} matcher Matcher to test whether the template is a match
 * or not
 * @return {Set<TaggedTemplateExpression>}
 */
export function extractMatchingTemplates(
  ast: Node,
  matcher: (node: TaggedTemplateExpression) => boolean
): Set<TaggedTemplateExpression> {
  const extractedStyles = new Set<TaggedTemplateExpression>();

  traverse(ast, {
    TaggedTemplateExpression: (
      path: NodePath<TaggedTemplateExpression>
    ): void => {
      if (matcher(path.node)) {
        extractedStyles.add(path.node);
      }
    }
  });

  return extractedStyles;
}

/**
 * Determines if a given template node is a keyframes call
 * @param {TaggedTemplateExpression} node Node to test
 * @return {boolean}
 */
export function isKeyFramesNode(node: TaggedTemplateExpression): boolean {
  return node.tag.type === 'Identifier' && node.tag.name === 'keyframes';
}

/**
 * Determines if a given template node is a stylesheet-like node
 * @param {TaggedTemplateExpression} node Node to test
 * @return {boolean}
 */
export function isStyleSheetNode(node: TaggedTemplateExpression): boolean {
  return (
    node.tag.type === 'Identifier' && node.tag.name === 'createGlobalStyle'
  );
}

const primaryHelper = 'styled';
const helpers = ['keyframes', 'createGlobalStyle', 'css'];

/**
 * Determines if a template node is a styled-components node
 * @param {TaggedTemplateExpression} node Node to test
 * @return {boolean}
 */
export function isStyledComponentTemplate(
  node: TaggedTemplateExpression
): boolean {
  // keyframes`foo`
  // createGlobalStyle`foo`
  // etc.
  if (node.tag.type === 'Identifier' && helpers.includes(node.tag.name)) {
    return true;
  }

  // styled.div`foo`
  if (
    node.tag.type === 'MemberExpression' &&
    node.tag.object.type === 'Identifier' &&
    node.tag.object.name === primaryHelper &&
    node.tag.property.type === 'Identifier'
  ) {
    return true;
  }

  // styled.div.attrs(...)`foo`
  if (
    node.tag.type === 'CallExpression' &&
    node.tag.callee.type === 'MemberExpression' &&
    node.tag.callee.object.type === 'MemberExpression' &&
    node.tag.callee.object.object.type === 'Identifier' &&
    node.tag.callee.object.object.name === primaryHelper &&
    node.tag.callee.object.property.type === 'Identifier' &&
    node.tag.callee.property.type === 'Identifier' &&
    node.tag.callee.property.name === 'attrs'
  ) {
    return true;
  }

  // styled(Component)`foo`
  if (
    node.tag.type === 'CallExpression' &&
    node.tag.callee.type === 'Identifier' &&
    node.tag.callee.name === primaryHelper
  ) {
    return true;
  }

  // styled(Component).attrs(...)`foo`
  if (
    node.tag.type === 'CallExpression' &&
    node.tag.callee.type === 'MemberExpression' &&
    node.tag.callee.object.type === 'CallExpression' &&
    node.tag.callee.object.callee.type === 'Identifier' &&
    node.tag.callee.object.callee.name === primaryHelper &&
    node.tag.callee.property.type === 'Identifier' &&
    node.tag.callee.property.name === 'attrs'
  ) {
    return true;
  }
  return false;
}

/**
 * De-indents the given source using the provided base indentation
 * @param {string|string[]} source Source to de-indent
 * @param {number} baseIndentation Base indentation to remove
 * @return {*}
 */
export function deindentSource(
  source: string | string[],
  baseIndentation: number
): {source: string; baseIndentations: Map<number, number>} {
  const sourceLines = Array.isArray(source) ? source : source.split('\n');
  const baseIndentations = new Map<number, number>();
  const deindentedLines: string[] = [];
  const indentationPattern = new RegExp(`^[ \\t]{${baseIndentation}}`);

  for (let i = 0; i < sourceLines.length; i++) {
    const sourceLine = sourceLines[i];
    if (sourceLine !== undefined) {
      if (indentationPattern.test(sourceLine)) {
        deindentedLines.push(sourceLine.replace(indentationPattern, ''));
        baseIndentations.set(i + 1, baseIndentation);
        // Roots don't have an end line, so we can't look this up so easily
        // later on. Having a special '-1' key helps here.
        if (i === sourceLines.length - 1) {
          baseIndentations.set(-1, baseIndentation);
        }
      } else {
        deindentedLines.push(sourceLine);
      }
    }
  }

  return {source: deindentedLines.join('\n'), baseIndentations};
}

/**
 * Extracts the CSS and replaced expression strings from a given
 * node.
 * @param {string} source Original source of the file this node came from
 * @param {TaggedTemplateExpression} node Node to extract CSS from
 * @return {*}
 */
export function extractStyleText(
  source: string,
  node: TaggedTemplateExpression
): {
  source: string;
  expressionStrings: string[];
} {
  let styleText = '';
  const expressionStrings: string[] = [];

  for (let i = 0; i < node.quasi.quasis.length; i++) {
    const template = node.quasi.quasis[i];
    const expr = node.quasi.expressions[i];
    const nextTemplate = node.quasi.quasis[i + 1];

    if (template) {
      styleText += template.value.raw;

      if (expr && nextTemplate && nextTemplate.range && template.range) {
        const exprText = source.slice(template.range[1], nextTemplate.range[0]);
        styleText += createPlaceholder(i);
        expressionStrings.push(exprText);
      }
    }
  }

  return {source: styleText, expressionStrings};
}

import {Root, Declaration, Rule} from 'postcss';
import syntax = require('../main.js');
import {assert} from 'chai';

const {parse} = syntax;

describe('main', () => {
  describe('parse', () => {
    it('should parse basic CSS', () => {
      const source = `
        styled.h1\`
          color: hotpink;
        \`;
      `;
      const ast = parse(source);
      const root = ast.nodes[0] as Root;
      const colour = root.nodes[0] as Declaration;
      assert.equal(ast.type, 'document');
      assert.equal(root.type, 'root');
      assert.equal(colour.type, 'decl');
      assert.equal(root.raws.codeBefore, '\n        styled.h1`\n');
      assert.equal(root.parent, ast);
      assert.equal(root.raws.codeAfter, '`;\n      ');
      assert.deepEqual(ast.source!.start, {
        line: 1,
        column: 1,
        offset: 0
      });
      assert.equal(ast.source!.input.css, source);
    });

    it('should parse styled function calls', () => {
      const source = `
        styled(Whatever)\`
          color: hotpink;
        \`;
      `;
      const ast = parse(source);
      const root = ast.nodes[0] as Root;
      const colour = root.nodes[0] as Declaration;
      assert.equal(ast.type, 'document');
      assert.equal(root.type, 'root');
      assert.equal(colour.type, 'decl');
      assert.equal(root.raws.codeBefore, '\n        styled(Whatever)`\n');
      assert.equal(root.parent, ast);
      assert.equal(root.raws.codeAfter, '`;\n      ');
      assert.deepEqual(ast.source!.start, {
        line: 1,
        column: 1,
        offset: 0
      });
      assert.equal(ast.source!.input.css, source);
    });

    it('should parse global stylesheets', () => {
      const source = `
        createGlobalStyle\`
          div {
            color: hotpink;
          }
        \`;
      `;
      const ast = parse(source);
      const root = ast.nodes[0] as Root;
      const rule = root.nodes[0] as Rule;
      const colour = rule.nodes[0] as Declaration;
      assert.equal(ast.type, 'document');
      assert.equal(root.type, 'root');
      assert.equal(colour.type, 'decl');
      assert.equal(root.raws.codeBefore, '\n        createGlobalStyle`\n');
      assert.equal(root.parent, ast);
      assert.equal(root.raws.codeAfter, '`;\n      ');
      assert.deepEqual(ast.source!.start, {
        line: 1,
        column: 1,
        offset: 0
      });
      assert.equal(ast.source!.input.css, source);
    });

    it('should parse modern JS', () => {
      const source = `
        const someObj = {a: {b: 2}};
        const someValue = someObj?.a?.b ?? 3;
        styled.h1\`
          color: hotpink;
        \`;
      `;
      const ast = parse(source);
      const root = ast.nodes[0] as Root;
      const colour = root.nodes[0] as Declaration;
      assert.equal(ast.type, 'document');
      assert.equal(root.type, 'root');
      assert.equal(colour.type, 'decl');
    });

    it('should parse JSX', () => {
      const source = `
        const someObj = {a: {b: 2}};
        const someJsx = (<div>funky</div>);
        styled.h1\`
          color: hotpink;
        \`;
      `;
      const ast = parse(source);
      const root = ast.nodes[0] as Root;
      const colour = root.nodes[0] as Declaration;
      assert.equal(ast.type, 'document');
      assert.equal(root.type, 'root');
      assert.equal(colour.type, 'decl');
    });

    it('should parse typescript', () => {
      const source = `
        function doStuff(x: number, y: number): void {}
        styled.h1\`
          color: hotpink;
        \`;
      `;
      const ast = parse(source);
      const root = ast.nodes[0] as Root;
      const colour = root.nodes[0] as Declaration;
      assert.equal(ast.type, 'document');
      assert.equal(root.type, 'root');
      assert.equal(colour.type, 'decl');
    });

    it('should parse CSS containing an expression', () => {
      const source = `
        styled.h1\`
          padding: 2rem;
          $\{expr}: hotpink;
        \`;
      `;
      const ast = parse(source);
      const root = ast.nodes[0] as Root;
      const expr = root.nodes[1] as Declaration;
      assert.equal(ast.type, 'document');
      assert.equal(root.type, 'root');
      assert.equal(expr.type, 'decl');
      assert.equal(expr.prop, '--POSTCSS_styled-components_0');
      assert.equal(ast.source!.input.css, source);
    });

    it('should parse JS without any CSS', () => {
      const source = `
        const foo = 'bar';
      `;
      const ast = parse(source);
      assert.equal(ast.type, 'document');
      assert.equal(ast.nodes.length, 0);
      assert.deepEqual(ast.source!.start, {
        line: 1,
        column: 1,
        offset: 0
      });
      assert.equal(ast.source!.input.css, source);
    });

    it('should ignore non-css templates', () => {
      const source = `
        html\`<div></div>\`;
      `;
      const ast = parse(source);
      assert.equal(ast.type, 'document');
      assert.equal(ast.nodes.length, 0);
      assert.deepEqual(ast.source!.start, {
        line: 1,
        column: 1,
        offset: 0
      });
      assert.equal(ast.source!.input.css, source);
    });

    it('should ignore disabled lines', () => {
      const source = `
        // postcss-styled-components-disable-next-line
        styled.h1\`
          color: hotpink;
        \`;
      `;
      const ast = parse(source);
      assert.equal(ast.nodes.length, 0);
    });

    it('should ignore deeply disabled lines', () => {
      const source = `
        // postcss-styled-components-disable-next-line
        someFunction([a, b, styled.h1\`
          color: hotpink;
        \`]);
      `;
      const ast = parse(source);
      assert.equal(ast.nodes.length, 0);
    });

    it('should ignore invalid templates', () => {
      const source = `
        styled.h1\`
          .foo { /* absolute nonsense */
        \`;
      `;
      const ast = parse(source);

      assert.equal(ast.nodes.length, 0);
    });
  });

  describe('stringify', () => {
    it('should stringify basic CSS', () => {
      const source = `
        styled.h1\`
          color: hotpink;
        \`;
      `;

      const ast = parse(source);
      const output = ast.toString(syntax);

      assert.equal(output, source);
    });

    it('should stringify CSS with expressions', () => {
      const source = `
        styled.h1\`
          color: $\{expr};

          && {
            $\{expr}: red;
            color: $\{expr};
          }

          $\{expr} {
            color: hotpink;
          }
        \`;
      `;

      const ast = parse(source);
      const output = ast.toString(syntax);

      assert.equal(output, source);
    });

    it('should stringify multiple stylesheets', () => {
      const source = `
        styled.h1\`
          color: hotpink;
        \`;

        const somethingInTheMiddle = 808;

        styled.h1\`color: lime;\`;
      `;

      const ast = parse(source);
      const output = ast.toString(syntax);

      assert.equal(output, source);
    });

    it('should stringify non-css JS', () => {
      const source = `
        const a = 5;
        const b = 303;
      `;
      const ast = parse(source);
      const output = ast.toString(syntax);

      assert.equal(output, source);
    });

    it('should stringify empty CSS', () => {
      const source = `
        styled.h1\`\`;
      `;
      const ast = parse(source);
      const output = ast.toString(syntax);

      assert.equal(output, source);
    });

    it('should stringify single-line CSS', () => {
      const source = `
        styled.h1\`color: hotpink;\`;
      `;
      const ast = parse(source);
      const output = ast.toString(syntax);

      assert.equal(output, source);
    });
  });
});

import {Root, Rule, Declaration, Comment} from 'postcss';
import {assert} from 'chai';
import {createTestAst} from './util.js';

// keyframes`foo`
// createGlobalStyle`foo`
// etc.

// styled.div`foo`

// styled.div.attrs(...)`foo`

// styled(Component)`foo`

// styled(Component).attrs(...)`foo`

describe('parse', () => {
  it('should parse basic CSS via styled.*', () => {
    const {source, ast} = createTestAst(`
      styled.div\`
        color: hotpink;
      \`;
    `);
    const root = ast.nodes[0] as Root;
    const colour = root.nodes[0] as Declaration;
    assert.equal(ast.type, 'document');
    assert.equal(root.type, 'root');
    assert.equal(colour.type, 'decl');
    assert.equal(root.raws.codeBefore, '\n      styled.div`\n');
    assert.equal(root.parent, ast);
    assert.equal(root.raws.codeAfter, '`;\n    ');
    assert.deepEqual(ast.source!.start, {
      line: 1,
      column: 1,
      offset: 0
    });
    assert.equal(ast.source!.input.css, source);
  });

  it('should parse basic CSS via styled(*)', () => {
    const {source, ast} = createTestAst(`
      styled(Component)\`
        color: hotpink;
      \`;
    `);
    const root = ast.nodes[0] as Root;
    const colour = root.nodes[0] as Declaration;
    assert.equal(ast.type, 'document');
    assert.equal(root.type, 'root');
    assert.equal(colour.type, 'decl');
    assert.equal(root.raws.codeBefore, '\n      styled(Component)`\n');
    assert.equal(root.parent, ast);
    assert.equal(root.raws.codeAfter, '`;\n    ');
    assert.deepEqual(ast.source!.start, {
      line: 1,
      column: 1,
      offset: 0
    });
    assert.equal(ast.source!.input.css, source);
  });

  it('should parse basic CSS via styled.*.attrs(...)', () => {
    const {source, ast} = createTestAst(`
      styled.div.attrs({})\`
        color: hotpink;
      \`;
    `);
    const root = ast.nodes[0] as Root;
    const colour = root.nodes[0] as Declaration;
    assert.equal(ast.type, 'document');
    assert.equal(root.type, 'root');
    assert.equal(colour.type, 'decl');
    assert.equal(root.raws.codeBefore, '\n      styled.div.attrs({})`\n');
    assert.equal(root.parent, ast);
    assert.equal(root.raws.codeAfter, '`;\n    ');
    assert.deepEqual(ast.source!.start, {
      line: 1,
      column: 1,
      offset: 0
    });
    assert.equal(ast.source!.input.css, source);
  });

  it('should parse basic CSS via styled(*).attrs(...)', () => {
    const {source, ast} = createTestAst(`
      styled(Component).attrs({})\`
        color: hotpink;
      \`;
    `);
    const root = ast.nodes[0] as Root;
    const colour = root.nodes[0] as Declaration;
    assert.equal(ast.type, 'document');
    assert.equal(root.type, 'root');
    assert.equal(colour.type, 'decl');
    assert.equal(
      root.raws.codeBefore,
      '\n      styled(Component).attrs({})`\n'
    );
    assert.equal(root.parent, ast);
    assert.equal(root.raws.codeAfter, '`;\n    ');
    assert.deepEqual(ast.source!.start, {
      line: 1,
      column: 1,
      offset: 0
    });
    assert.equal(ast.source!.input.css, source);
  });

  it('should parse basic CSS via createGlobalStyle', () => {
    const {source, ast} = createTestAst(`
      createGlobalStyle\`
        .foo {
          color: hotpink;
        }
      \`;
    `);
    const root = ast.nodes[0] as Root;
    const rule = root.nodes[0] as Rule;
    const colour = rule.nodes[0] as Declaration;
    assert.equal(ast.type, 'document');
    assert.equal(root.type, 'root');
    assert.equal(rule.type, 'rule');
    assert.equal(rule.selector, '.foo');
    assert.equal(colour.type, 'decl');
    assert.equal(root.raws.codeBefore, '\n      createGlobalStyle`\n');
    assert.equal(root.parent, ast);
    assert.equal(root.raws.codeAfter, '`;\n    ');
    assert.deepEqual(ast.source!.start, {
      line: 1,
      column: 1,
      offset: 0
    });
    assert.equal(ast.source!.input.css, source);
  });

  it('should parse keyframes via keyframes', () => {
    const {source, ast} = createTestAst(`
      keyframes\`
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      \`;
    `);
    const root = ast.nodes[0] as Root;
    const from = root.nodes[0] as Rule;
    const to = root.nodes[1] as Rule;
    assert.equal(ast.type, 'document');
    assert.equal(root.type, 'root');
    assert.equal(from.type, 'rule');
    assert.equal(to.type, 'rule');
    assert.equal(from.selector, 'from');
    assert.equal(to.selector, 'to');
    assert.equal(root.raws.codeBefore, '\n      keyframes`\n');
    assert.equal(root.parent, ast);
    assert.equal(root.raws.codeAfter, '`;\n    ');
    assert.deepEqual(ast.source!.start, {
      line: 1,
      column: 1,
      offset: 0
    });
    assert.equal(ast.source!.input.css, source);
  });

  it('should parse modern JS', () => {
    const {ast} = createTestAst(`
      const someObj = {a: {b: 2}};
      const someValue = someObj?.a?.b ?? 3;
      styled.div\`
        color: hotpink;
      \`;
    `);
    const root = ast.nodes[0] as Root;
    const colour = root.nodes[0] as Declaration;
    assert.equal(ast.type, 'document');
    assert.equal(root.type, 'root');
    assert.equal(colour.type, 'decl');
  });

  it('should parse typescript', () => {
    const {ast} = createTestAst(`
      function doStuff(x: number, y: number): void {}
      styled.div\`
        color: hotpink;
      \`;
    `);
    const root = ast.nodes[0] as Root;
    const colour = root.nodes[0] as Declaration;
    assert.equal(ast.type, 'document');
    assert.equal(root.type, 'root');
    assert.equal(colour.type, 'decl');
  });

  it('should parse multiple stylesheets', () => {
    const {source, ast} = createTestAst(`
      styled.div\`
        color: hotpink;
      \`;

      styled.p\`background: lime;\`;
    `);
    assert.equal(ast.nodes.length, 2);
    const root1 = ast.nodes[0] as Root;
    const root2 = ast.nodes[1] as Root;

    assert.equal(root1.type, 'root');
    assert.equal(root1.raws.codeBefore, '\n      styled.div`\n');
    assert.equal(root1.raws.codeAfter, undefined);
    assert.equal(root1.parent, ast);
    assert.equal(root2.type, 'root');
    assert.equal(root2.raws.codeBefore, '`;\n\n      styled.p`');
    assert.equal(root2.raws.codeAfter, '`;\n    ');
    assert.equal(root2.parent, ast);

    assert.deepEqual(ast.source!.start, {
      line: 1,
      column: 1,
      offset: 0
    });
    assert.equal(ast.source!.input.css, source);
  });

  it('should parse multi-line stylesheets', async () => {
    const {source, ast} = createTestAst(`
      styled.div\`
        color: hotpink;
        background: red;
      \`;
    `);
    const root = ast.nodes[0] as Root;
    const colour = root.nodes[0] as Declaration;
    const background = root.nodes[1] as Declaration;
    assert.equal(ast.type, 'document');
    assert.equal(root.type, 'root');
    assert.equal(colour.type, 'decl');
    assert.equal(background.type, 'decl');
    assert.equal(root.raws.codeBefore, '\n      styled.div`\n');
    assert.equal(root.parent, ast);
    assert.equal(root.raws.codeAfter, '`;\n    ');
    assert.deepEqual(ast.source!.start, {
      line: 1,
      column: 1,
      offset: 0
    });
    assert.equal(ast.source!.input.css, source);
  });

  it('should parse multi-line stylesheets containing expressions', async () => {
    const {source, ast} = createTestAst(`
      styled.div\`
        color: hotpink;
        $\{expr}
      \`;
    `);
    const root = ast.nodes[0] as Root;
    const colour = root.nodes[0] as Declaration;
    assert.equal(ast.type, 'document');
    assert.equal(root.type, 'root');
    assert.equal(colour.type, 'decl');
    assert.equal(root.raws.codeBefore, '\n      styled.div`\n');
    assert.equal(root.parent, ast);
    assert.equal(root.raws.codeAfter, '`;\n    ');
    assert.deepEqual(ast.source!.start, {
      line: 1,
      column: 1,
      offset: 0
    });
    assert.equal(ast.source!.input.css, source);
  });

  it('should parse CSS containing an expression', () => {
    const {source, ast} = createTestAst(`
      styled.div\`
        $\{expr}color: hotpink;
      \`;
    `);
    const root = ast.nodes[0] as Root;
    const placeholder = root.nodes[0] as Comment;
    const colour = root.nodes[1] as Declaration;
    assert.equal(ast.type, 'document');
    assert.equal(root.type, 'root');
    assert.equal(placeholder.type, 'comment');
    assert.equal(colour.type, 'decl');
    assert.equal(ast.source!.input.css, source);
  });

  it('should parse JS without any CSS', () => {
    const {source, ast} = createTestAst(`
      const foo = 'bar';
    `);
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
    const {source, ast} = createTestAst(`
      html\`<div></div>\`;
    `);
    assert.equal(ast.type, 'document');
    assert.equal(ast.nodes.length, 0);
    assert.deepEqual(ast.source!.start, {
      line: 1,
      column: 1,
      offset: 0
    });
    assert.equal(ast.source!.input.css, source);
  });

  it('should ignore non-member styled call', () => {
    const {source, ast} = createTestAst(`
      styled\`color: hotpink;\`;
    `);
    assert.equal(ast.type, 'document');
    assert.equal(ast.nodes.length, 0);
    assert.deepEqual(ast.source!.start, {
      line: 1,
      column: 1,
      offset: 0
    });
    assert.equal(ast.source!.input.css, source);
  });
});

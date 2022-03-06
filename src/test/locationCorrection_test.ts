import {Root, Declaration, Comment} from 'postcss';
import {assert} from 'chai';
import {
  createTestAst,
  getSourceForNodeByRange,
  getSourceForNodeByLoc
} from './util.js';

describe('locationCorrection', () => {
  it('should translate basic CSS positions', () => {
    const {source, ast} = createTestAst(`
      styled.div\`
        color: hotpink;
      \`;
    `);
    const colour = (ast.nodes[0] as Root).nodes[0] as Declaration;
    assert.equal(colour.type, 'decl');
    assert.equal(getSourceForNodeByLoc(source, colour), 'color: hotpink;');
    assert.equal(getSourceForNodeByRange(source, colour), 'color: hotpink;');
  });

  it('should handle multi-line CSS', () => {
    const {source, ast} = createTestAst(`
      styled.div\`
        color: hotpink;
        background: red;
      \`;
    `);
    const colour = (ast.nodes[0] as Root).nodes[0] as Declaration;
    const background = (ast.nodes[0] as Root).nodes[1] as Declaration;
    assert.equal(colour.type, 'decl');
    assert.equal(background.type, 'decl');
    assert.equal(getSourceForNodeByLoc(source, colour), 'color: hotpink;');
    assert.equal(getSourceForNodeByLoc(source, background), 'background: red;');
    assert.equal(getSourceForNodeByRange(source, colour), 'color: hotpink;');
    assert.equal(
      getSourceForNodeByRange(source, background),
      'background: red;'
    );
  });

  it('should handle multi-line CSS with expressions', () => {
    const {source, ast} = createTestAst(`
      styled.div\`
        color: hotpink;
        $\{expr}
      \`;
    `);
    const colour = (ast.nodes[0] as Root).nodes[0] as Declaration;
    assert.equal(colour.type, 'decl');
    assert.equal(getSourceForNodeByLoc(source, colour), 'color: hotpink;');
    assert.equal(getSourceForNodeByRange(source, colour), 'color: hotpink;');
  });

  it('should handle single line expressions', () => {
    const {source, ast} = createTestAst(`styled.div\`color: hotpink;\`;`);
    const colour = (ast.nodes[0] as Root).nodes[0] as Declaration;
    assert.equal(colour.type, 'decl');
    assert.equal(getSourceForNodeByLoc(source, colour), 'color: hotpink;');
    assert.equal(getSourceForNodeByRange(source, colour), 'color: hotpink;');
  });

  it('should account for single-line expressions', () => {
    const {source, ast} = createTestAst(`
      styled.div\`
        $\{expr\}color: hotpink;
      \`;
    `);
    const comment = (ast.nodes[0] as Root).nodes[0] as Comment;
    const colour = (ast.nodes[0] as Root).nodes[1] as Declaration;
    assert.equal(colour.type, 'decl');
    assert.equal(comment.type, 'comment');
    assert.equal(getSourceForNodeByLoc(source, colour), 'color: hotpink;');
    assert.equal(getSourceForNodeByRange(source, colour), 'color: hotpink;');
  });

  it('should account for multiple single-line expressions', () => {
    const {source, ast} = createTestAst(`
      styled.div\`
        $\{expr\}color: $\{expr2\}hotpink;
      \`;
    `);
    const comment = (ast.nodes[0] as Root).nodes[0] as Comment;
    const colour = (ast.nodes[0] as Root).nodes[1] as Declaration;
    assert.equal(colour.type, 'decl');
    assert.equal(comment.type, 'comment');
    assert.equal(
      getSourceForNodeByLoc(source, colour),
      'color: ${expr2}hotpink;'
    );
    assert.equal(
      getSourceForNodeByRange(source, colour),
      'color: ${expr2}hotpink;'
    );
  });

  it('should account for multi-line expressions', () => {
    const {source, ast} = createTestAst(`
      styled.div\`
        $\{
          expr
        \}color: hotpink;
      \`;
    `);
    const comment = (ast.nodes[0] as Root).nodes[0] as Comment;
    const colour = (ast.nodes[0] as Root).nodes[1] as Declaration;
    assert.equal(colour.type, 'decl');
    assert.equal(comment.type, 'comment');
    assert.equal(getSourceForNodeByLoc(source, colour), 'color: hotpink;');
    assert.equal(getSourceForNodeByRange(source, colour), 'color: hotpink;');
  });

  it('should account for multiple mixed-size expressions', () => {
    const {source, ast} = createTestAst(`
      styled.div\`
        $\{
          expr
        \} $\{expr2\}color: hotpink;
      \`;
    `);
    const comment1 = (ast.nodes[0] as Root).nodes[0] as Comment;
    const comment2 = (ast.nodes[0] as Root).nodes[1] as Comment;
    const colour = (ast.nodes[0] as Root).nodes[2] as Declaration;
    assert.equal(colour.type, 'decl');
    assert.equal(comment1.type, 'comment');
    assert.equal(comment2.type, 'comment');
    assert.equal(getSourceForNodeByLoc(source, colour), 'color: hotpink;');
    assert.equal(getSourceForNodeByRange(source, colour), 'color: hotpink;');
  });

  it('should account for code before', () => {
    const {source, ast} = createTestAst(`
      const foo = bar + baz;
      styled.div\`
        color: hotpink;
      \`;
    `);
    const colour = (ast.nodes[0] as Root).nodes[0] as Declaration;
    assert.equal(colour.type, 'decl');
    assert.equal(getSourceForNodeByLoc(source, colour), 'color: hotpink;');
    assert.equal(getSourceForNodeByRange(source, colour), 'color: hotpink;');
  });

  it('should account for mixed indentation', () => {
    const {source, ast} = createTestAst(`
      styled.div\`
  $\{expr\}color: hotpink;
      \`;
    `);
    const comment = (ast.nodes[0] as Root).nodes[0] as Comment;
    const colour = (ast.nodes[0] as Root).nodes[1] as Declaration;
    assert.equal(colour.type, 'decl');
    assert.equal(comment.type, 'comment');
    assert.equal(getSourceForNodeByLoc(source, colour), 'color: hotpink;');
    assert.equal(getSourceForNodeByRange(source, colour), 'color: hotpink;');
  });
});

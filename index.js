const core = require('@actions/core');
const { marked } = require('marked');

function sculptTokenKey(token) {
  return token.text
    .replace(/[^a-zA-Z0-9]/g, '_');
}

const INPUT_KEY = 'markdown';
const OUTPUT_KEY = 'data';

try {
  const markdownInput = core.getInput(INPUT_KEY);

  let tokens = marked.lexer(markdownInput);
  // filter spaces out
  tokens = tokens.filter(t => t.type !== 'space');
  // add default values
  tokens.forEach(t => {
    if (t.type === 'heading') {
      t.subheader = {};
      t.bodies = [];
    }
  });
  // make hierarchy
  tokens.reverse();
  tokens.forEach((t, idx) => {
    let nextTokenIdx = idx + 1;
    while (nextTokenIdx <= tokens.length - 1) {
      if (tokens[nextTokenIdx].type === 'heading' && tokens[nextTokenIdx].depth < (t.depth || 999)) {
        if (t.type !== 'heading') {
          tokens[nextTokenIdx].bodies = [t, ...tokens[nextTokenIdx].bodies];
          break;
        }
        const key = sculptTokenKey(t);
        tokens[nextTokenIdx].subheader = {
          [key]: t,
          ...tokens[nextTokenIdx].subheader,
        };
        break;
      }
      nextTokenIdx += 1;
    }
  });
  tokens.reverse();
  // filter only headers
  tokens = tokens.filter(t => t.type === 'heading');
  // reduce to object
  if (tokens.length > 0) {
    const topTokenDepth = tokens[0].depth;
    tokens = tokens.reduce((acc, cur) => {
      if (cur.depth > topTokenDepth) return acc;
      return {
        ...acc,
        [sculptTokenKey(cur)]: cur,
      };
    }, {});
  }

  core.setOutput(OUTPUT_KEY, tokens);
} catch (error) {
  core.setFailed(error.message);
}

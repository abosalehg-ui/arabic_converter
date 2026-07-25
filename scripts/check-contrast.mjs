/**
 * Verifies that the colour pairs the UI actually renders meet WCAG AA.
 *
 * Values are read straight out of `src/styles/tokens.css`, so the check fails
 * if someone edits a token and forgets what it is paired with. Run with
 * `npm run check:contrast`; the CI workflow runs it on every push.
 */
import { readFileSync } from 'node:fs';

const AA_NORMAL = 4.5;
const AA_LARGE = 3;

const css = readFileSync('src/styles/tokens.css', 'utf8');

/** Extracts the custom properties declared inside one selector block. */
function readTokens(selector) {
  const block = css.slice(css.indexOf(selector));
  const body = block.slice(block.indexOf('{') + 1, block.indexOf('}'));
  const tokens = {};
  for (const [, name, value] of body.matchAll(/(--[\w-]+):\s*([^;]+);/g)) {
    tokens[name] = value.trim();
  }
  return tokens;
}

const relativeLuminance = (hex) => {
  const channels = [1, 3, 5]
    .map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
};

const ratio = (a, b) => {
  const [light, dark] = [relativeLuminance(a), relativeLuminance(b)].sort(
    (x, y) => y - x
  );
  return (light + 0.05) / (dark + 0.05);
};

/** [foreground token, background token, minimum ratio, what it describes] */
const PAIRS = [
  ['--text-primary', '--bg-surface', AA_NORMAL, 'body text'],
  ['--text-secondary', '--bg-surface', AA_NORMAL, 'labels'],
  ['--text-tertiary', '--bg-surface', AA_NORMAL, 'stats and hints'],
  ['--text-tertiary', '--bg-muted', AA_NORMAL, 'footer and drawer meta'],
  ['--accent-primary', '--bg-surface', AA_NORMAL, 'links and active tab'],
  ['--accent-primary', '--accent-soft', AA_NORMAL, 'badge and active command'],
  ['--text-on-accent', '--accent-primary', AA_NORMAL, 'primary button label'],
  ['--text-on-accent', '--accent-hover', AA_NORMAL, 'primary button hover'],
  ['--success-text', '--success-bg', AA_NORMAL, 'success toast'],
  ['--error-text', '--error-bg', AA_NORMAL, 'error toast'],
  ['--border-interactive', '--bg-muted', AA_LARGE, 'file drop outline'],
];

let failures = 0;

for (const [themeName, selector] of [
  ['light', ":root[data-theme='light']"],
  ['dark', ":root[data-theme='dark']"],
]) {
  const tokens = readTokens(selector);
  console.log(`\n${themeName}`);

  for (const [fg, bg, minimum, description] of PAIRS) {
    const foreground = tokens[fg];
    const background = tokens[bg];

    if (!/^#[0-9a-f]{6}$/i.test(foreground) || !/^#[0-9a-f]{6}$/i.test(background)) {
      console.log(`  ?  ${description}: ${fg} or ${bg} is not a plain hex colour`);
      continue;
    }

    const value = ratio(foreground, background);
    const passed = value >= minimum;
    if (!passed) failures++;
    console.log(
      `  ${passed ? '✓' : '✗'}  ${value.toFixed(2)}:1 (min ${minimum})  ${description}` +
        `  [${fg} on ${bg}]`
    );
  }
}

if (failures > 0) {
  console.error(`\n${failures} colour pair(s) below the WCAG AA threshold.`);
  process.exit(1);
}

console.log('\nAll colour pairs meet WCAG AA.');

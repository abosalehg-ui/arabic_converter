/**
 * Runs conversions off the main thread so a large file never freezes the UI.
 *
 * Work is done in line chunks and progress is reported between them. Chunking
 * by line is safe because every processor is line-scoped: `convertText` splits
 * on newlines, and the colour/quote patterns cannot match across a newline.
 */
import converter from './arabicConverter';

const PROCESSORS = {
  text: (input) => converter.convertText(input),
  color: (input) => converter.processColorTags(input),
  quoted: (input) => converter.processQuotedText(input),
};

const CHUNK_LINES = 2000;

self.onmessage = (event) => {
  const { id, mode, content } = event.data;
  const process = PROCESSORS[mode];

  if (!process) {
    self.postMessage({ id, type: 'error', message: `Unknown mode: ${mode}` });
    return;
  }

  try {
    const lines = content.split('\n');
    const output = [];

    for (let i = 0; i < lines.length; i += CHUNK_LINES) {
      output.push(process(lines.slice(i, i + CHUNK_LINES).join('\n')));
      self.postMessage({
        id,
        type: 'progress',
        value: Math.min(1, (i + CHUNK_LINES) / lines.length),
      });
    }

    self.postMessage({ id, type: 'done', result: output.join('\n') });
  } catch (error) {
    self.postMessage({ id, type: 'error', message: String(error?.message ?? error) });
  }
};

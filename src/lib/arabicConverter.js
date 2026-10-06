/**
 * Arabic shaping + visual reversing.
 *
 * The app targets renderers that have no bidirectional/shaping engine of their
 * own (game engines, subtitle tools, legacy design software). To make Arabic
 * look right there, we do two things the renderer would normally do:
 *
 *   1. Shaping  — replace each letter with the Unicode Presentation Form that
 *                 matches its position in the word (initial/medial/final).
 *   2. Reversing — lay the text out visually right-to-left by hand, so a purely
 *                 left-to-right renderer ends up displaying it correctly.
 *
 * Text is processed as *clusters* (a base letter plus any combining marks that
 * belong to it) so that diacritics never get separated from their letter.
 */

/**
 * Presentation forms per base letter: `[base, final, initial, medial]`.
 * `null` means the letter has no such form — those letters do not connect to
 * the following letter. The isolated form is the base character itself, which
 * keeps output identical to the previous implementation for isolated letters.
 */
const FORM_TABLE = [
  [0x0621, null, null, null], // ء
  [0x0622, 0xfe82, null, null], // آ
  [0x0623, 0xfe84, null, null], // أ
  [0x0624, 0xfe86, null, null], // ؤ
  [0x0625, 0xfe88, null, null], // إ
  [0x0626, 0xfe8a, 0xfe8b, 0xfe8c], // ئ
  [0x0627, 0xfe8e, null, null], // ا
  [0x0628, 0xfe90, 0xfe91, 0xfe92], // ب
  [0x0629, 0xfe94, null, null], // ة
  [0x062a, 0xfe96, 0xfe97, 0xfe98], // ت
  [0x062b, 0xfe9a, 0xfe9b, 0xfe9c], // ث
  [0x062c, 0xfe9e, 0xfe9f, 0xfea0], // ج
  [0x062d, 0xfea2, 0xfea3, 0xfea4], // ح
  [0x062e, 0xfea6, 0xfea7, 0xfea8], // خ
  [0x062f, 0xfeaa, null, null], // د
  [0x0630, 0xfeac, null, null], // ذ
  [0x0631, 0xfeae, null, null], // ر
  [0x0632, 0xfeb0, null, null], // ز
  [0x0633, 0xfeb2, 0xfeb3, 0xfeb4], // س
  [0x0634, 0xfeb6, 0xfeb7, 0xfeb8], // ش
  [0x0635, 0xfeba, 0xfebb, 0xfebc], // ص
  [0x0636, 0xfebe, 0xfebf, 0xfec0], // ض
  [0x0637, 0xfec2, 0xfec3, 0xfec4], // ط
  [0x0638, 0xfec6, 0xfec7, 0xfec8], // ظ
  [0x0639, 0xfeca, 0xfecb, 0xfecc], // ع
  [0x063a, 0xfece, 0xfecf, 0xfed0], // غ
  [0x0640, 0x0640, 0x0640, 0x0640], // ـ tatweel — connects on both sides
  [0x0641, 0xfed2, 0xfed3, 0xfed4], // ف
  [0x0642, 0xfed6, 0xfed7, 0xfed8], // ق
  [0x0643, 0xfeda, 0xfedb, 0xfedc], // ك
  [0x0644, 0xfede, 0xfedf, 0xfee0], // ل
  [0x0645, 0xfee2, 0xfee3, 0xfee4], // م
  [0x0646, 0xfee6, 0xfee7, 0xfee8], // ن
  [0x0647, 0xfeea, 0xfeeb, 0xfeec], // ه
  [0x0648, 0xfeee, null, null], // و
  [0x0649, 0xfef0, null, null], // ى
  [0x064a, 0xfef2, 0xfef3, 0xfef4], // ي
  // Persian / Urdu letters (Presentation Forms-A).
  [0x067e, 0xfb57, 0xfb58, 0xfb59], // پ
  [0x0686, 0xfb7b, 0xfb7c, 0xfb7d], // چ
  [0x0698, 0xfb8b, null, null], // ژ
  [0x06a9, 0xfb8f, 0xfb90, 0xfb91], // ک
  [0x06af, 0xfb93, 0xfb94, 0xfb95], // گ
  [0x06cc, 0xfbfd, 0xfbfe, 0xfbff], // ی
];

/**
 * Lam + Alef must render as a single ligature glyph. Maps the alef variant that
 * follows a lam to its `[isolated, final]` ligature forms.
 */
const LAM_ALEF = new Map([
  [0x0622, [0xfef5, 0xfef6]], // لآ
  [0x0623, [0xfef7, 0xfef8]], // لأ
  [0x0625, [0xfef9, 0xfefa]], // لإ
  [0x0627, [0xfefb, 0xfefc]], // لا
]);

const LAM = 'ل';

/** Arabic-script blocks, used to decide what belongs to a right-to-left run. */
const ARABIC_BLOCKS = [
  [0x0600, 0x06ff], // Arabic (letters, marks, Arabic punctuation)
  [0x0750, 0x077f], // Arabic Supplement
  [0x08a0, 0x08ff], // Arabic Extended-A
  [0xfb50, 0xfdff], // Presentation Forms-A
  [0xfe70, 0xfeff], // Presentation Forms-B
];

/**
 * Arabic-Indic digits. They sit inside the Arabic block but read left-to-right
 * like Latin digits, so reversing them would corrupt the number (١٢٣ → ٣٢١).
 */
const ARABIC_DIGITS = [
  [0x0660, 0x0669], // ٠-٩
  [0x06f0, 0x06f9], // ۰-۹ (Extended Arabic-Indic)
];

const IS_MARK = /\p{Mn}/u;
const IS_SPACE = /\s/;
/** Letters and digits: the characters that give a neutral run its own LTR order. */
const IS_STRONG_LTR = /[\p{L}\p{N}]/u;

/**
 * Paired punctuation that a bidi engine mirrors when it sits in a right-to-left
 * context. Without this, "(نص)" comes out as ")صن(" in a left-to-right renderer.
 */
const MIRRORED = new Map(
  ['()', '[]', '{}', '<>', '«»', '‹›'].flatMap(([open, close]) => [
    [open, close],
    [close, open],
  ])
);

/** Presentation Forms-A and -B: what the converter itself outputs. */
const PRESENTATION_FORMS = [
  [0xfb50, 0xfdff],
  [0xfe70, 0xfeff],
];

/** A whole markup tag such as `<b>` or `</color>`, kept as one unit. */
const IS_TAG = /^<[^<>]*>$/;

const inRanges = (code, ranges) =>
  ranges.some(([from, to]) => code >= from && code <= to);

const chr = (code) => String.fromCharCode(code);

/** base character -> { final, initial, medial } presentation forms */
const FORMS = new Map(
  FORM_TABLE.map(([base, final, initial, medial]) => [
    chr(base),
    {
      final: final === null ? null : chr(final),
      initial: initial === null ? null : chr(initial),
      medial: medial === null ? null : chr(medial),
    },
  ])
);

const RUN_ARABIC = 'arabic';
const RUN_SPACE = 'space';
const RUN_NEUTRAL = 'neutral';
/** Punctuation that follows the right-to-left flow of the line (and is mirrored). */
const RUN_RTL_NEUTRAL = 'rtl-neutral';

const BRACKET_PAIRS = ['()', '[]', '{}'];

/** Net count of `open` minus `close` in `chars`. */
const depth = (chars, open, close) =>
  chars.reduce((n, char) => n + (char === open) - (char === close), 0);

/** True when `char` closes a bracket left open inside `chars`. */
const closesOpenBracket = (chars, char) =>
  BRACKET_PAIRS.some(([open, close]) => char === close && depth(chars, open, close) > 0);

/** True when `char` opens a bracket that is closed inside `chars`. */
const opensClosedBracket = (chars, char) =>
  BRACKET_PAIRS.some(([open, close]) => char === open && depth(chars, open, close) < 0);

const mirror = (text) =>
  Array.from(text)
    .reverse()
    .map((char) => MIRRORED.get(char) ?? char)
    .join('');

export class ArabicConverter {
  /** True for Arabic-script characters, excluding Arabic-Indic digits. */
  isArabic(char) {
    if (!char) return false;
    const code = char.codePointAt(0);
    return inRanges(code, ARABIC_BLOCKS) && !inRanges(code, ARABIC_DIGITS);
  }

  /** True for ٠-٩ and ۰-۹, which must keep their left-to-right order. */
  isArabicDigit(char) {
    if (!char) return false;
    return inRanges(char.codePointAt(0), ARABIC_DIGITS);
  }

  /** True for combining marks (harakat, shadda, sukun, superscript alef, …). */
  isMark(char) {
    return !!char && IS_MARK.test(char);
  }

  /** True when the text contains at least one shapeable Arabic letter. */
  hasArabic(text) {
    if (!text) return false;
    return Array.from(text).some((char) => this.isArabic(char) && !this.isMark(char));
  }

  /**
   * True when most Arabic letters in `text` are already presentation forms,
   * i.e. the text looks like this converter's own output. Converting it again
   * would undo the reversal and leave broken shapes behind.
   */
  looksConverted(text) {
    if (!text) return false;
    let letters = 0;
    let presentation = 0;
    for (const char of text) {
      if (!this.isArabic(char) || this.isMark(char)) continue;
      letters++;
      if (inRanges(char.codePointAt(0), PRESENTATION_FORMS)) presentation++;
    }
    return letters > 0 && presentation / letters > 0.5;
  }

  /** A letter can take a final/medial form when something joins it from the right. */
  canConnectBefore(char) {
    return FORMS.get(char)?.final != null;
  }

  /** A letter joins the letter that follows it only if it has an initial form. */
  canConnectAfter(char) {
    return FORMS.get(char)?.initial != null;
  }

  /** Returns the presentation form of `char` at `position`, or `char` itself. */
  getForm(char, position) {
    if (position === 'isolated') return char;
    return FORMS.get(char)?.[position] ?? char;
  }

  /**
   * Splits text into clusters of one base character plus its combining marks,
   * merging lam+alef pairs into a single ligature cluster.
   *
   * @returns {Array<{base: string, marks: string, ligature: ?[string, string]}>}
   */
  #toClusters(text) {
    const clusters = [];

    for (const char of text) {
      if (this.isMark(char) && clusters.length > 0) {
        clusters[clusters.length - 1].marks += char;
        continue;
      }
      clusters.push({ base: char, marks: '', ligature: null });
    }

    // Merge every lam followed by an alef variant into one ligature cluster.
    const merged = [];
    for (let i = 0; i < clusters.length; i++) {
      const current = clusters[i];
      const next = clusters[i + 1];
      const ligature = next && LAM_ALEF.get(next.base.codePointAt(0));

      if (current.base === LAM && ligature) {
        merged.push({
          base: LAM,
          marks: current.marks + next.marks,
          ligature: [chr(ligature[0]), chr(ligature[1])],
        });
        i++; // consume the alef
        continue;
      }
      merged.push(current);
    }

    return merged;
  }

  /**
   * Applies positional shaping to the clusters of `text`.
   * Combining marks are invisible to the joining rules, which is why shaping
   * runs on clusters rather than raw characters.
   *
   * @returns {Array<{shaped: string, marks: string}>}
   */
  #shapeClusters(text) {
    const clusters = this.#toClusters(text);

    return clusters.map((cluster, i) => {
      const previous = clusters[i - 1];
      const next = clusters[i + 1];

      // A ligature accepts a join from the previous letter (through its lam)
      // but never joins the letter that follows it (its alef side is closed).
      const joinsBefore =
        !!previous &&
        !previous.ligature &&
        this.canConnectAfter(previous.base) &&
        (cluster.ligature ? true : this.canConnectBefore(cluster.base));

      const joinsAfter =
        !cluster.ligature &&
        !!next &&
        this.canConnectAfter(cluster.base) &&
        (next.ligature ? true : this.canConnectBefore(next.base));

      let shaped;
      if (cluster.ligature) {
        shaped = joinsBefore ? cluster.ligature[1] : cluster.ligature[0];
      } else if (joinsBefore && joinsAfter) {
        shaped = this.getForm(cluster.base, 'medial');
      } else if (joinsBefore) {
        shaped = this.getForm(cluster.base, 'final');
      } else if (joinsAfter) {
        shaped = this.getForm(cluster.base, 'initial');
      } else {
        shaped = this.getForm(cluster.base, 'isolated');
      }

      return { shaped, marks: cluster.marks };
    });
  }

  /** Replaces each Arabic letter with its positional presentation form. */
  shapeText(text) {
    if (!text) return text;
    return this.#shapeClusters(text)
      .map((cluster) => cluster.shaped + cluster.marks)
      .join('');
  }

  /** Classifies a character for run splitting. */
  #classify(char) {
    if (IS_SPACE.test(char)) return RUN_SPACE;
    if (this.isArabic(char)) return RUN_ARABIC;
    return RUN_NEUTRAL;
  }

  /**
   * Splits a line into runs of Arabic / whitespace / everything-else.
   * Whitespace is its own run so that reversing run order keeps word spacing
   * intact instead of dragging spaces to the ends of the line.
   */
  #toRuns(line) {
    const runs = [];

    for (const char of line) {
      const kind = this.#classify(char);
      const last = runs[runs.length - 1];
      if (last && last.kind === kind) {
        last.text += char;
      } else {
        runs.push({ kind, text: char });
      }
    }

    return this.#splitNeutralEdges(this.#mergeNeutralRuns(runs));
  }

  /**
   * Merges neutral runs that are separated only by whitespace into a single
   * block, so an embedded left-to-right phrase keeps its own word order when
   * the surrounding Arabic is laid out right-to-left ("X = 10" must not become
   * "10 = X"). Whitespace next to an Arabic run stays a standalone separator.
   */
  #mergeNeutralRuns(runs) {
    const merged = [];

    for (let i = 0; i < runs.length; i++) {
      const run = runs[i];
      const previous = merged[merged.length - 1];

      if (
        run.kind === RUN_SPACE &&
        previous?.kind === RUN_NEUTRAL &&
        runs[i + 1]?.kind === RUN_NEUTRAL
      ) {
        previous.text += run.text + runs[i + 1].text;
        i++; // the neutral run on the right was absorbed
        continue;
      }

      merged.push({ ...run });
    }

    return merged;
  }

  /**
   * Peels leading and trailing punctuation off each neutral run. A bidi engine
   * only keeps punctuation in left-to-right order when it sits *between* two
   * left-to-right characters; at the edge of a run it follows the
   * right-to-left line instead, which is also where bracket mirroring applies.
   * So "(نص 123)" lays out as "(123 صن)" rather than "123) صن(".
   */
  #splitNeutralEdges(runs) {
    const result = [];

    for (const run of runs) {
      if (run.kind !== RUN_NEUTRAL || IS_TAG.test(run.text)) {
        result.push(run);
        continue;
      }

      const chars = Array.from(run.text);
      let start = 0;
      let end = chars.length;
      while (start < end && !IS_STRONG_LTR.test(chars[start])) start++;
      while (end > start && !IS_STRONG_LTR.test(chars[end - 1])) end--;

      // A bracket whose partner is inside the left-to-right core belongs to
      // it ("f(x)" stays whole); only unpaired edge brackets follow the line.
      while (
        end < chars.length &&
        closesOpenBracket(chars.slice(start, end), chars[end])
      ) {
        end++;
      }
      while (start > 0 && opensClosedBracket(chars.slice(start, end), chars[start - 1])) {
        start--;
      }

      const lead = chars.slice(0, start).join('');
      const core = chars.slice(start, end).join('');
      const trail = chars.slice(end).join('');

      if (lead) result.push({ kind: RUN_RTL_NEUTRAL, text: lead });
      if (core) result.push({ kind: RUN_NEUTRAL, text: core });
      if (trail) result.push({ kind: RUN_RTL_NEUTRAL, text: trail });
    }

    return result;
  }

  /** Lays out one run in its visual left-to-right position. */
  #renderRun(run) {
    if (run.kind === RUN_ARABIC) return this.#reverseRun(run.text);
    if (run.kind === RUN_RTL_NEUTRAL) return mirror(run.text);
    return run.text;
  }

  /** Shapes an Arabic run and lays its clusters out right-to-left. */
  #reverseRun(text) {
    return this.#shapeClusters(text)
      .reverse()
      .map((cluster) => cluster.shaped + cluster.marks)
      .join('');
  }

  /**
   * Lays each line out visually right-to-left: Arabic runs are shaped and
   * reversed, neutral runs (Latin words, digits, punctuation) keep their own
   * internal order but move as blocks, and punctuation at the edge of a run
   * follows the right-to-left flow with brackets mirrored. Lines without
   * Arabic are untouched.
   *
   * A trailing `\r` (Windows CRLF line endings) is set aside before the line
   * is laid out and put back afterwards; otherwise, being whitespace, it would
   * be reversed to the *start* of every line.
   */
  reverseText(text) {
    if (!text) return text;

    return text
      .split('\n')
      .map((rawLine) => {
        const cr = rawLine.endsWith('\r') ? '\r' : '';
        const line = cr ? rawLine.slice(0, -1) : rawLine;

        const runs = this.#toRuns(line);
        if (!runs.some((run) => run.kind === RUN_ARABIC)) return rawLine;

        return (
          runs
            .map((run) => this.#renderRun(run))
            .reverse()
            .join('') + cr
        );
      })
      .join('\n');
  }

  /** Shapes and reverses text — the main entry point used by the UI. */
  convertText(text) {
    return this.reverseText(text);
  }

  /** Converts the Arabic inside `<clr:R,G,B>` colour tags, leaving tags intact. */
  processColorTags(text) {
    if (!text) return text;

    return text.replace(/<clr:([^>]+)>([^<\n"]*)/g, (match, color, content) =>
      this.hasArabic(content) ? `<clr:${color}>${this.convertText(content)}` : match
    );
  }

  /**
   * Converts the Arabic inside every double-quoted span, leaving keys and other
   * non-Arabic spans untouched. This covers all the documented shapes —
   * `"arabic"`, `"key" "arabic"` and any number of spans on one line — because
   * a span is rewritten based on its own content, not on its position.
   */
  processQuotedText(text) {
    if (!text) return text;

    return text.replace(/"([^"\n]*)"/g, (match, content) =>
      this.hasArabic(content) ? `"${this.reverseText(content)}"` : match
    );
  }
}

const arabicConverter = new ArabicConverter();
export default arabicConverter;

/**
 * Conversion modes, shared by the Web Worker and the synchronous fallback so
 * a new mode cannot be added to one and forgotten in the other.
 */
export const PROCESSORS = {
  text: (input) => arabicConverter.convertText(input),
  color: (input) => arabicConverter.processColorTags(input),
  quoted: (input) => arabicConverter.processQuotedText(input),
};

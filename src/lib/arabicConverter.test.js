import { describe, expect, it } from 'vitest';
import converter, { ArabicConverter } from './arabicConverter';

/** Renders a string as space-separated hex code points, for readable failures. */
const codes = (s) =>
  Array.from(s)
    .map((c) => c.codePointAt(0).toString(16).padStart(4, '0'))
    .join(' ');

describe('character classification', () => {
  it('treats Arabic letters as Arabic', () => {
    expect(converter.isArabic('م')).toBe(true);
    expect(converter.isArabic('ء')).toBe(true);
  });

  it('does not treat Arabic-Indic digits as Arabic', () => {
    for (const digit of '٠١٢٣٤٥٦٧٨٩۰۹') {
      expect(converter.isArabicDigit(digit)).toBe(true);
      expect(converter.isArabic(digit)).toBe(false);
    }
  });

  it('does not treat Latin text as Arabic', () => {
    expect(converter.isArabic('a')).toBe(false);
    expect(converter.isArabic('5')).toBe(false);
  });

  it('hasArabic ignores digits and standalone marks', () => {
    expect(converter.hasArabic('١٢٣')).toBe(false);
    expect(converter.hasArabic('abc 123')).toBe(false);
    expect(converter.hasArabic('نص')).toBe(true);
  });
});

describe('shaping', () => {
  it('picks initial, medial and final forms by position', () => {
    // بحر: ب initial, ح medial, ر final
    expect(codes(converter.shapeText('بحر'))).toBe('fe91 fea4 feae');
  });

  it('leaves a single letter isolated', () => {
    expect(converter.shapeText('ب')).toBe('ب');
  });

  it('does not join after a non-connecting letter', () => {
    // در: د has no initial form, so ر stays isolated
    expect(codes(converter.shapeText('در'))).toBe('062f 0631');
  });

  it('shapes letters around a hamza (regression: hamza forms were missing)', () => {
    // مأمون: م initial, أ final, م initial, و final, ن isolated
    expect(codes(converter.shapeText('مأمون'))).toBe('fee3 fe84 fee3 feee 0646');
  });

  it('supports every hamza variant', () => {
    expect(codes(converter.shapeText('بآ'))).toBe('fe91 fe82');
    expect(codes(converter.shapeText('بأ'))).toBe('fe91 fe84');
    expect(codes(converter.shapeText('بؤ'))).toBe('fe91 fe86');
    expect(codes(converter.shapeText('بإ'))).toBe('fe91 fe88');
    expect(codes(converter.shapeText('بئب'))).toBe('fe91 fe8c fe90');
  });

  it('connects through a tatweel', () => {
    expect(codes(converter.shapeText('بـب'))).toBe('fe91 0640 fe90');
  });

  it('shapes teh marbuta and alef maksura as final-only letters', () => {
    expect(codes(converter.shapeText('بة'))).toBe('fe91 fe94');
    expect(codes(converter.shapeText('بى'))).toBe('fe91 fef0');
  });
});

describe('lam-alef ligatures', () => {
  it('uses the isolated ligature when nothing joins from the right', () => {
    expect(codes(converter.shapeText('لا'))).toBe('fefb');
  });

  it('uses the final ligature when a letter joins from the right', () => {
    // سلا: س initial, then the لا ligature in its final form
    expect(codes(converter.shapeText('سلا'))).toBe('feb3 fefc');
  });

  it('covers all four alef variants', () => {
    expect(codes(converter.shapeText('لآ'))).toBe('fef5');
    expect(codes(converter.shapeText('لأ'))).toBe('fef7');
    expect(codes(converter.shapeText('لإ'))).toBe('fef9');
    expect(codes(converter.shapeText('لا'))).toBe('fefb');
  });

  it('does not join the letter after a ligature', () => {
    // لام: the ligature closes, so م stays isolated
    expect(codes(converter.shapeText('لام'))).toBe('fefb 0645');
  });

  it('shapes a whole word containing a ligature', () => {
    expect(codes(converter.convertText('السلام'))).toBe('0645 fefc feb4 fedf 0627');
  });
});

describe('combining marks (harakat)', () => {
  it('keeps letters shaped when diacritics are present', () => {
    const withMarks = converter.shapeText('بَحْر');
    const withoutMarks = converter.shapeText('بحر');
    expect(withMarks.replace(/\p{Mn}/gu, '')).toBe(withoutMarks);
  });

  it('keeps each mark attached to its own letter after reversing', () => {
    // Every mark must still directly follow the letter it belongs to.
    const out = converter.convertText('مَرْحَبًا');
    expect(out).toMatch(/^\P{Mn}/u);
    expect(Array.from(out).filter((c) => /\p{Mn}/u.test(c))).toHaveLength(4);
    // Reversing puts the last cluster first: alef final, then beh + fathatan.
    // Note ح is *initial*, not medial: ر before it has no initial form, so it
    // does not join forwards and ح starts a new joining group.
    expect(codes(out)).toBe('fe8e fe92 064b fea3 064e feae 0652 fee3 064e');
  });

  it('does not let a mark break the joining chain', () => {
    // Two letters only: the first is initial, the second final — the fatha
    // between them must not break the join.
    expect(codes(converter.shapeText('بَب'))).toBe('fe91 064e fe90');
  });
});

describe('digits', () => {
  it('keeps Arabic-Indic digits in reading order (regression: they were reversed)', () => {
    expect(converter.convertText('لديك ١٢٣ رسالة')).toContain('١٢٣');
    expect(converter.convertText('لديك ١٢٣ رسالة')).not.toContain('٣٢١');
  });

  it('keeps Latin digits in reading order', () => {
    expect(converter.convertText('لديك 123 رسالة')).toContain('123');
  });

  it('keeps digits attached to a word in the right visual place', () => {
    expect(converter.convertText('نص١٢٣')).toBe('١٢٣' + converter.convertText('نص'));
  });
});

describe('reversing and mixed text', () => {
  it('reverses word order for a plain Arabic line', () => {
    const out = converter.convertText('مرحبا بكم');
    const words = out.split(' ');
    expect(words).toHaveLength(2);
    // The last word of the input must come first in the visual layout.
    expect(words[0]).toBe(converter.convertText('بكم'));
    expect(words[1]).toBe(converter.convertText('مرحبا'));
  });

  it('preserves single spaces between words (regression: spaces were dragged to the ends)', () => {
    const out = converter.convertText('Hello مرحبا World');
    expect(out.startsWith(' ')).toBe(false);
    expect(out.endsWith(' ')).toBe(false);
    expect(out.split(' ')).toHaveLength(3);
    expect(out.split(' ')[0]).toBe('World');
    expect(out.split(' ')[2]).toBe('Hello');
  });

  it('preserves runs of multiple spaces', () => {
    expect(converter.convertText('مرحبا   بكم').split('   ')).toHaveLength(2);
  });

  it('keeps a neutral segment between Arabic words in place', () => {
    expect(converter.convertText('قيمة X = 10 وحدة')).toContain(' X = 10 ');
  });

  it('leaves lines without Arabic completely untouched', () => {
    expect(converter.convertText('Hello World 123')).toBe('Hello World 123');
  });

  it('processes each line independently', () => {
    const out = converter.convertText('مرحبا\nبكم');
    expect(out.split('\n')).toHaveLength(2);
    expect(out).toBe(
      `${converter.convertText('مرحبا')}\n${converter.convertText('بكم')}`
    );
  });

  it('keeps Arabic punctuation with its Arabic run', () => {
    expect(
      converter.convertText('مرحبا، بكم').startsWith(converter.convertText('بكم'))
    ).toBe(true);
  });

  it('handles empty and whitespace-only input', () => {
    expect(converter.convertText('')).toBe('');
    expect(converter.convertText('   ')).toBe('   ');
    expect(converter.convertText('\n\n')).toBe('\n\n');
  });

  it('round-trips: reversing a converted line restores the shaped original', () => {
    const original = 'مرحبا بكم';
    expect(converter.convertText(converter.convertText(original))).toBe(
      converter.shapeText(original)
    );
  });
});

describe('processColorTags', () => {
  it('converts the Arabic inside a colour tag and keeps the tag intact', () => {
    const out = converter.processColorTags('<clr:255,212,255>مرحبا');
    expect(out.startsWith('<clr:255,212,255>')).toBe(true);
    expect(out).toContain(converter.convertText('مرحبا'));
  });

  it('leaves non-Arabic tag content alone', () => {
    expect(converter.processColorTags('<clr:1,2,3>Hello')).toBe('<clr:1,2,3>Hello');
  });

  it('handles several tags across several lines', () => {
    const out = converter.processColorTags('<clr:1,1,1>مرحبا\n<clr:2,2,2>بكم');
    expect(out.split('\n')).toHaveLength(2);
    expect(out).toContain('<clr:1,1,1>');
    expect(out).toContain('<clr:2,2,2>');
  });
});

describe('processQuotedText', () => {
  it('converts a standalone quoted Arabic span', () => {
    expect(converter.processQuotedText('"مرحبا"')).toBe(
      `"${converter.convertText('مرحبا')}"`
    );
  });

  it('converts only the Arabic span in a key/value pair', () => {
    const out = converter.processQuotedText('"ep_02.test" "النص العربي"');
    expect(out.startsWith('"ep_02.test" "')).toBe(true);
    expect(out).toContain(converter.convertText('النص العربي'));
  });

  it('converts every Arabic span on a line (regression: the third was skipped)', () => {
    const out = converter.processQuotedText('"k1" "مرحبا" "بكم"');
    expect(out).toContain(converter.convertText('مرحبا'));
    expect(out).toContain(converter.convertText('بكم'));
    expect(out).not.toContain('مرحبا');
    expect(out).not.toContain('بكم');
  });

  it('converts repeated identical spans consistently (regression: indexOf matched the first)', () => {
    const out = converter.processQuotedText('"a" "نص"\n"b" "نص"');
    const [first, second] = out.split('\n');
    expect(first.slice(4)).toBe(second.slice(4));
    expect(first).toContain(converter.convertText('نص'));
  });

  it('leaves keys and unquoted text untouched', () => {
    expect(converter.processQuotedText('"scene_01" "scene_02"')).toBe(
      '"scene_01" "scene_02"'
    );
  });

  it('does not let a span span across lines', () => {
    expect(converter.processQuotedText('"مرحبا\nبكم"')).toBe('"مرحبا\nبكم"');
  });

  it('tolerates an unbalanced quote', () => {
    expect(converter.processQuotedText('"مرحبا')).toBe('"مرحبا');
  });
});

describe('robustness', () => {
  it('exposes a usable named export', () => {
    expect(new ArabicConverter().convertText('نص')).toBe(converter.convertText('نص'));
  });

  it('does not crash on emoji or surrogate pairs', () => {
    expect(() => converter.convertText('مرحبا 👋 بكم')).not.toThrow();
    expect(converter.convertText('مرحبا 👋 بكم')).toContain('👋');
  });

  it('handles a large input without pathological slowdown', () => {
    const big = 'مرحبا بكم في هذا النص\n'.repeat(20_000);
    const started = performance.now();
    converter.convertText(big);
    expect(performance.now() - started).toBeLessThan(5000);
  });
});

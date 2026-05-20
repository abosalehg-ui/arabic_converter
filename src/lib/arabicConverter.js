// Arabic shaping + reversing logic.
// Ported verbatim from the original index.html to preserve behavior exactly.

export class ArabicConverter {
  constructor() {
    this.arabicForms = {
      'ا': { isolated: 'ا', final: 'ﺎ' },
      'ب': { isolated: 'ب', final: 'ﺐ', initial: 'ﺑ', medial: 'ﺒ' },
      'ت': { isolated: 'ت', final: 'ﺖ', initial: 'ﺗ', medial: 'ﺘ' },
      'ث': { isolated: 'ث', final: 'ﺚ', initial: 'ﺛ', medial: 'ﺜ' },
      'ج': { isolated: 'ج', final: 'ﺞ', initial: 'ﺟ', medial: 'ﺠ' },
      'ح': { isolated: 'ح', final: 'ﺢ', initial: 'ﺣ', medial: 'ﺤ' },
      'خ': { isolated: 'خ', final: 'ﺦ', initial: 'ﺧ', medial: 'ﺨ' },
      'د': { isolated: 'د', final: 'ﺪ' },
      'ذ': { isolated: 'ذ', final: 'ﺬ' },
      'ر': { isolated: 'ر', final: 'ﺮ' },
      'ز': { isolated: 'ز', final: 'ﺰ' },
      'س': { isolated: 'س', final: 'ﺲ', initial: 'ﺳ', medial: 'ﺴ' },
      'ش': { isolated: 'ش', final: 'ﺶ', initial: 'ﺷ', medial: 'ﺸ' },
      'ص': { isolated: 'ص', final: 'ﺺ', initial: 'ﺻ', medial: 'ﺼ' },
      'ض': { isolated: 'ض', final: 'ﺾ', initial: 'ﺿ', medial: 'ﻀ' },
      'ط': { isolated: 'ط', final: 'ﻂ', initial: 'ﻃ', medial: 'ﻄ' },
      'ظ': { isolated: 'ظ', final: 'ﻆ', initial: 'ﻇ', medial: 'ﻈ' },
      'ع': { isolated: 'ع', final: 'ﻊ', initial: 'ﻋ', medial: 'ﻌ' },
      'غ': { isolated: 'غ', final: 'ﻎ', initial: 'ﻏ', medial: 'ﻐ' },
      'ف': { isolated: 'ف', final: 'ﻒ', initial: 'ﻓ', medial: 'ﻔ' },
      'ق': { isolated: 'ق', final: 'ﻖ', initial: 'ﻗ', medial: 'ﻘ' },
      'ك': { isolated: 'ك', final: 'ﻚ', initial: 'ﻛ', medial: 'ﻜ' },
      'ل': { isolated: 'ل', final: 'ﻞ', initial: 'ﻟ', medial: 'ﻠ' },
      'م': { isolated: 'م', final: 'ﻢ', initial: 'ﻣ', medial: 'ﻤ' },
      'ن': { isolated: 'ن', final: 'ﻦ', initial: 'ﻧ', medial: 'ﻨ' },
      'ه': { isolated: 'ه', final: 'ﻪ', initial: 'ﻫ', medial: 'ﻬ' },
      'و': { isolated: 'و', final: 'ﻮ' },
      'ي': { isolated: 'ي', final: 'ﻲ', initial: 'ﻳ', medial: 'ﻴ' },
      'ى': { isolated: 'ى', final: 'ﻰ' },
      'ة': { isolated: 'ة', final: 'ﺔ' },
    };

    this.nonConnecting = new Set(['ا', 'د', 'ذ', 'ر', 'ز', 'و']);
  }

  isArabic(char) {
    const code = char.charCodeAt(0);
    return code >= 0x0600 && code <= 0x06FF;
  }

  canConnectAfter(char) {
    return this.arabicForms[char] && !this.nonConnecting.has(char);
  }

  canConnectBefore(char) {
    return this.arabicForms[char] !== undefined;
  }

  getForm(char, position) {
    if (!this.arabicForms[char]) return char;
    const forms = this.arabicForms[char];
    return forms[position] || char;
  }

  shapeText(text) {
    if (!text) return text;

    const result = [];
    const chars = Array.from(text);

    for (let i = 0; i < chars.length; i++) {
      const char = chars[i];

      if (!this.isArabic(char)) {
        result.push(char);
        continue;
      }

      const connectsBefore =
        i > 0 &&
        this.canConnectAfter(chars[i - 1]) &&
        this.canConnectBefore(char);

      const connectsAfter =
        i < chars.length - 1 &&
        this.canConnectBefore(chars[i + 1]) &&
        this.canConnectAfter(char);

      let position;
      if (connectsBefore && connectsAfter) {
        position = 'medial';
      } else if (connectsBefore) {
        position = 'final';
      } else if (connectsAfter) {
        position = 'initial';
      } else {
        position = 'isolated';
      }

      const shaped = this.getForm(char, position);
      result.push(shaped);
    }

    return result.join('');
  }

  reverseText(text) {
    const lines = text.split('\n');
    const resultLines = [];

    for (const line of lines) {
      const parts = [];
      let current = '';
      let isArabic = false;

      for (const char of line) {
        const charIsArabic = this.isArabic(char);

        if (charIsArabic !== isArabic && current) {
          parts.push([current, isArabic]);
          current = char;
          isArabic = charIsArabic;
        } else {
          current += char;
          isArabic = charIsArabic;
        }
      }

      if (current) {
        parts.push([current, isArabic]);
      }

      const processed = [];
      for (const [part, isAr] of parts) {
        if (isAr) {
          const shaped = this.shapeText(part);
          const reversed = shaped.split('').reverse().join('');
          processed.push(reversed);
        } else {
          processed.push(part);
        }
      }

      if (parts.some(([, isAr]) => isAr)) {
        processed.reverse();
      }

      resultLines.push(processed.join(''));
    }

    return resultLines.join('\n');
  }

  convertText(text) {
    return this.reverseText(text);
  }

  hasArabic(text) {
    return Array.from(text).some((char) => this.isArabic(char));
  }

  processColorTags(text) {
    const pattern = /<clr:([^>]+)>([^<\n"]*)/g;

    return text.replace(pattern, (match, color, content) => {
      if (content && this.hasArabic(content)) {
        const converted = this.convertText(content);
        return `<clr:${color}>${converted}`;
      }
      return match;
    });
  }

  processQuotedText(text) {
    let result = text;

    result = result.replace(/"([^"]*)" "([^"]+)"/g, (match, prefix, content) => {
      if (content && this.hasArabic(content)) {
        const converted = this.reverseText(content);
        return `"${prefix}" "${converted}"`;
      }
      return match;
    });

    result = result.replace(/"([^"]*[؀-ۿ][^"]*?)"/g, (match, content) => {
      const beforeMatch = result.substring(0, result.indexOf(match));
      const afterMatch = result.substring(result.indexOf(match) + match.length);

      if (beforeMatch.endsWith('" ') || afterMatch.startsWith(' "')) {
        return match;
      }

      if (content && this.hasArabic(content)) {
        const converted = this.reverseText(content);
        return `"${converted}"`;
      }
      return match;
    });

    return result;
  }
}

const arabicConverter = new ArabicConverter();
export default arabicConverter;

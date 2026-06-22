const SCRIPTABLE_TOKENS = [
  'javascript:',
  'vbscript:',
  'data:text/html',
  'onerror=',
  'onload=',
  'onclick=',
  'onmouseover=',
  'onfocus=',
  'onmouseenter=',
  'onmouseleave=',
  'onanimationstart=',
];

export const TASTING_NOTE_TEXT_SECURITY_RULES = Object.freeze({
  pairing: Object.freeze({
    label: '페어링',
    maxLength: 160,
    multiline: false,
  }),
  memo: Object.freeze({
    label: '메모',
    maxLength: 1200,
    multiline: true,
  }),
});

export const REVIEW_TEXT_SECURITY_RULES = Object.freeze({
  contents: Object.freeze({
    label: '리뷰 내용',
    maxLength: 1200,
    multiline: true,
  }),
  reportReason: Object.freeze({
    label: '신고 사유',
    maxLength: 80,
    multiline: false,
  }),
  reportMemo: Object.freeze({
    label: '신고 메모',
    maxLength: 1000,
    multiline: true,
  }),
});

const isAsciiLetter = (char) => {
  const code = char.charCodeAt(0);
  return (code >= 65 && code <= 90) || (code >= 97 && code <= 122);
};

const normalizeNewlines = (value) => String(value ?? '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');

const normalizeUnicode = (value) => {
  return typeof value.normalize === 'function' ? value.normalize('NFKC') : value;
};

const removeControlCharacters = (value, { multiline = false } = {}) => {
  let normalizedValue = '';

  for (const char of value) {
    if (char === '\n') {
      if (multiline) normalizedValue += char;
      continue;
    }

    if (char === '\t') {
      normalizedValue += ' ';
      continue;
    }

    if (char.charCodeAt(0) >= 32) {
      normalizedValue += char;
    }
  }

  return normalizedValue;
};

export const normalizePlainTextInput = (value, rule = {}) => {
  return removeControlCharacters(normalizeUnicode(normalizeNewlines(value)), rule).trim();
};

const compactForScan = (value) => {
  let compactedValue = '';

  for (const char of value) {
    if (char.charCodeAt(0) > 32) {
      compactedValue += char;
    }
  }

  return compactedValue;
};

const hasHtmlTagStart = (value) => {
  for (let index = 0; index < value.length - 1; index += 1) {
    if (value[index] !== '<') continue;

    const nextChar = value[index + 1] === '/' ? value[index + 2] : value[index + 1];
    if (nextChar && isAsciiLetter(nextChar)) {
      return true;
    }
  }

  return false;
};

const findXssReason = (value) => {
  const lowerValue = value.toLowerCase();
  const compactedValue = compactForScan(lowerValue);

  if (hasHtmlTagStart(lowerValue)) {
    return 'HTML 태그';
  }

  return SCRIPTABLE_TOKENS.find((token) => compactedValue.includes(token)) || '';
};

export const validatePlainTextInput = (value, rule = {}) => {
  const label = rule.label || '입력값';
  const maxLength = Number.isFinite(Number(rule.maxLength)) ? Number(rule.maxLength) : 1000;
  const normalizedValue = normalizePlainTextInput(value, rule);
  const errors = [];

  if (normalizedValue.length > maxLength) {
    errors.push(`${label}은 ${maxLength}자 이하로 입력해주세요.`);
  }

  const xssReason = findXssReason(normalizedValue);
  if (xssReason) {
    errors.push(`${label}에 허용되지 않는 XSS 위험 패턴이 포함되어 있습니다: ${xssReason}`);
  }

  return {
    isValid: errors.length === 0,
    value: normalizedValue,
    errors,
  };
};

export const validateTastingNoteTextFields = ({ pairing, memo }) => {
  const pairingResult = validatePlainTextInput(pairing, TASTING_NOTE_TEXT_SECURITY_RULES.pairing);
  const memoResult = validatePlainTextInput(memo, TASTING_NOTE_TEXT_SECURITY_RULES.memo);

  return {
    isValid: pairingResult.isValid && memoResult.isValid,
    values: {
      pairing: pairingResult.value,
      memo: memoResult.value,
    },
    errors: [
      ...pairingResult.errors,
      ...memoResult.errors,
    ],
  };
};

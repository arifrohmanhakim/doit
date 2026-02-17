import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(customParseFormat);

const LEGACY_FORMATS = ['DD/MM/YYYY', 'D/M/YYYY', 'MM/DD/YYYY', 'M/D/YYYY'];

export const parseTransactionDate = (value: string) => {
  if (!value) {
    return dayjs('');
  }

  const direct = dayjs(value);
  if (direct.isValid()) {
    return direct;
  }

  for (const format of LEGACY_FORMATS) {
    const parsed = dayjs(value, format, true);
    if (parsed.isValid()) {
      return parsed;
    }
  }

  return dayjs('');
};

export const formatTransactionDateTime = (value: string) => {
  const parsed = parseTransactionDate(value);
  if (!parsed.isValid()) {
    return value;
  }

  return parsed.format('DD MMM YYYY HH:mm');
};

export const toDateKey = (value: string) => {
  const parsed = parseTransactionDate(value);
  if (!parsed.isValid()) {
    return '';
  }

  return parsed.format('YYYY-MM-DD');
};

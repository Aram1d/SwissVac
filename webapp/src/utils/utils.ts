import { useMediaQuery } from '@mantine/hooks';
import dayjs from 'dayjs';

export function getRevEffectiveDate(rev: string) {
  const century = new Date().getFullYear().toString().slice(0, 2);

  const yp = rev.slice(0, 2);
  const mp = rev.slice(2, 4);
  const dp = rev.slice(4, 6);

  return dayjs(`${century}${yp}-${mp}-${dp}`);
}

export function isRevObsolete(rev: string) {
  return dayjs().isAfter(dayjs(getRevEffectiveDate(rev).add(1, 'month')));
}

export function isRevProvisionallyValid(rev: string) {
  return dayjs().isBefore(dayjs(getRevEffectiveDate(rev)));
}

export function isRevCoeval(rev: string) {
  return !isRevObsolete(rev) && !isRevProvisionallyValid(rev);
}

function getEffectiveDateList(revs: string[]) {
  return revs
    .map((rev) => ({
      rev,
      date: getRevEffectiveDate(rev),
    }))
    .sort((a, b) => a.date.unix() - b.date.unix());
}

export function getCoevalRevFromList(revs: string[]) {
  const now = dayjs();
  const effectiveDateList = getEffectiveDateList(revs);
  for (const [idx, { date, rev }] of effectiveDateList.entries()) {
    if (
      now.isAfter(date) && effectiveDateList[idx + 1]
        ? now.isBefore(effectiveDateList[idx + 1].date)
        : true
    ) {
      return rev;
    }
  }
  return '';
}

export function shouldUpdateRevs(revs: string[]) {
  const now = dayjs();
  const effectiveDateList = getEffectiveDateList(revs);
  if (!effectiveDateList.length) return true;
  for (const [idx, { date }] of effectiveDateList.entries()) {
    if (now.isAfter(date.add(20, 'days')) && !effectiveDateList[idx + 1]) {
      return true;
    }
  }
  return false;
}

export const emptyArray = [] as [];

export function pagesFromInterval(interval: [number, number]) {
  const amount = interval[1] - interval[0] + 1;
  return Array.from({ length: amount }, (_, i) => interval[0] + i);
}

export const useSmallScreen = () => useMediaQuery('(max-width: 400px)');

export const fileDownloader = (data: Blob | undefined, filename: string) => {
  if (!data) return;
  const url =
    window.URL && window.URL.createObjectURL
      ? window.URL.createObjectURL(data)
      : window.webkitURL.createObjectURL(data);

  const anchor: HTMLAnchorElement = document.createElement('a');
  anchor.style.display = 'none';
  anchor.href = url;
  anchor.setAttribute('download', filename);

  if (typeof anchor.download === 'undefined') {
    anchor.setAttribute('target', '_blank');
  }

  document.body.appendChild(anchor);
  anchor.click();

  setTimeout(() => {
    document.body.removeChild(anchor);
    window.URL.revokeObjectURL(url);
  }, 100);
};

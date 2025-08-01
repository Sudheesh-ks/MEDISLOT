import dayjs from 'dayjs';

export function cn(...classes: Array<string | undefined | false | null>) {
  return classes.filter(Boolean).join(' ');
}

export const to12h = (t24: string) =>
  dayjs(`1970‑01‑01T${t24}`, 'YYYY‑MM‑DDTHH:mm').format('hh:mm A');

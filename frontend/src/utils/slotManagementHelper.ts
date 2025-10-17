import dayjs from 'dayjs';

export function cn(...classes: Array<string | undefined | false | null>) {
  return classes.filter(Boolean).join(' ');
}

export const to12h = (t: string) => dayjs(`1970-01-01T${t}`).format('hh:mm A').toLowerCase();


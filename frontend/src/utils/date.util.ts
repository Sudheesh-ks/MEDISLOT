import dayjs from 'dayjs';
import customParse from 'dayjs/plugin/customParseFormat';
dayjs.extend(customParse);

export const isoTo24 = (isoTime: string) => dayjs(isoTime).format('HH:mm');

export const to24h = (t12: string) => dayjs(t12, 'hh:mm A').format('HH:mm');

export const toDisplay = (t24: string, use12h: boolean) =>
  use12h ? dayjs(`1970-01-01T${t24}`).format('hh:mm A') : t24;

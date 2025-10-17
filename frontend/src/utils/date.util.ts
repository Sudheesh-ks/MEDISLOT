import dayjs from 'dayjs';
import customParse from 'dayjs/plugin/customParseFormat';
dayjs.extend(customParse);

export const toDisplay = (t24: string, use12h: boolean) =>
  use12h ? dayjs(`1970-01-01T${t24}`).format('hh:mm A') : t24;

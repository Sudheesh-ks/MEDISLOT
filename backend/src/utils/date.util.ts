import dayjs from 'dayjs';
import customParse from 'dayjs/plugin/customParseFormat';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(customParse);
dayjs.extend(utc);
dayjs.extend(timezone);

export const isoDate = (d: Date | string) => dayjs(d).tz('Asia/Kolkata').format('YYYY-MM-DD');



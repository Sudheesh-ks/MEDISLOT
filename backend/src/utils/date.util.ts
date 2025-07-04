import dayjs from "dayjs";
import customParse from "dayjs/plugin/customParseFormat";
import utc from "dayjs/plugin/utc";           
import timezone from "dayjs/plugin/timezone"; 

dayjs.extend(customParse);
dayjs.extend(utc);        
dayjs.extend(timezone);   

export const isoDate = (d: Date | string) =>
  dayjs(d).tz("Asia/Kolkata").format("YYYY-MM-DD");

export const to24h = (t12: string) =>
  dayjs(t12, "hh:mm A").format("HH:mm");

export const to12h = (t24: string) =>
  dayjs(`1970-01-01T${t24}`).format("hh:mm A");

import dayjs from "dayjs";
import customParse from "dayjs/plugin/customParseFormat";
import utc from "dayjs/plugin/utc";           // ← ➊  add
import timezone from "dayjs/plugin/timezone"; // ← ➋  add

dayjs.extend(customParse);
dayjs.extend(utc);        // ← ➌  register
dayjs.extend(timezone);   // ← ➍  register

/** Always returns e.g. "2025-07-04" (IST) */
export const isoDate = (d: Date | string) =>
  dayjs(d).tz("Asia/Kolkata").format("YYYY-MM-DD");

/** Convert "03:30 PM" → "15:30" */
export const to24h = (t12: string) =>
  dayjs(t12, "hh:mm A").format("HH:mm");

/** Convert "15:30" → "03:30 PM" */
export const to12h = (t24: string) =>
  dayjs(`1970-01-01T${t24}`).format("hh:mm A");

import type { DateRange } from '../components/common/DateFilter';

export const computeRange = (range: DateRange) => {
  const today = new Date();
  const start = new Date();
  let end = new Date();
  switch (range.type) {
    case 'today':
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      break;
    case 'yesterday':
      start.setDate(today.getDate() - 1);
      start.setHours(0, 0, 0, 0);
      end = new Date(start);
      end.setHours(23, 59, 59, 999);
      break;
    case 'lastweek':
      start.setDate(today.getDate() - 7);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      break;
    case 'lastmonth':
      start.setMonth(today.getMonth() - 1);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      break;
    case 'custom':
      if (range.startDate) start.setTime(new Date(range.startDate).getTime());
      else start.setTime(0);
      if (range.endDate) {
        end = new Date(range.endDate);
        end.setHours(23, 59, 59, 999);
      } else end = new Date();
      break;
    default:
      start.setDate(today.getDate() - 7);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
  }
  return { start: start.toISOString(), end: end.toISOString() };
};

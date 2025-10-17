import dayjs from 'dayjs';

export const getDateRange = (dateRange?: string): { start?: string; end?: string } => {
  if (!dateRange) return {};

  let start: string | undefined;
  let end: string | undefined;

  switch (dateRange) {
    case 'today':
      start = dayjs().format('YYYY-MM-DD');
      end = start;
      break;
    case 'yesterday':
      start = dayjs().subtract(1, 'day').format('YYYY-MM-DD');
      end = start;
      break;
    case 'last_week':
      start = dayjs().subtract(7, 'day').format('YYYY-MM-DD');
      end = dayjs().format('YYYY-MM-DD');
      break;
    case 'last_month':
      start = dayjs().subtract(1, 'month').format('YYYY-MM-DD');
      end = dayjs().format('YYYY-MM-DD');
      break;
    default: {
      const [from, to] = dateRange.split('_');
      if (from && to) {
        start = dayjs(from).format('YYYY-MM-DD');
        end = dayjs(to).format('YYYY-MM-DD');
      }
      break;
    }
  }

  return { start, end };
};

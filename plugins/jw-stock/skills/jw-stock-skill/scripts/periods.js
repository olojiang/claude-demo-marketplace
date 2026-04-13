/** Time period presets: today, 1w, 1m, 3m, 6m, 1y */
export function getPeriodRange(period) {
  const now = new Date();
  const to = new Date(now);
  const from = new Date(now);

  switch (period) {
    case 'today':
      from.setHours(0, 0, 0, 0);
      break;
    case '1w':
    case 'week':
      from.setDate(from.getDate() - 7);
      break;
    case '1m':
    case 'month':
      from.setMonth(from.getMonth() - 1);
      break;
    case '3m':
      from.setMonth(from.getMonth() - 3);
      break;
    case '6m':
      from.setMonth(from.getMonth() - 6);
      break;
    case '1y':
    case 'year':
      from.setFullYear(from.getFullYear() - 1);
      break;
    default:
      from.setMonth(from.getMonth() - 1);
  }

  return { from, to };
}

export function formatDateYmd(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}${m}${day}`;
}

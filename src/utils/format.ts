export function formatDate(iso: string) {
  // "YYYY-MM-DD HH:mm"
  try {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) {
      return iso;
    }

    return new Date(iso).toLocaleString('sv-SE', { timeZone: 'Asia/Seoul', hour12: false });
  } catch {
    return iso;
  }
}

export function formatDateShort(iso: string) {
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) {
      return iso;
    }

    const today = new Date();
    const isToday =
      d.toLocaleDateString('sv-SE', { timeZone: 'Asia/Seoul' }) ===
      today.toLocaleDateString('sv-SE', { timeZone: 'Asia/Seoul' });

    if (isToday) {
      return d.toLocaleTimeString('sv-SE', {
        timeZone: 'Asia/Seoul',
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
      }); // "HH:mm"
    }

    // "MM-DD HH:mm"
    const full = d.toLocaleString('sv-SE', {
      timeZone: 'Asia/Seoul',
      hour12: false,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
    return full.slice(5);
  } catch {
    return iso;
  }
}

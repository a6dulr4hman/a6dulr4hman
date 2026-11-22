import { useEffect, useState } from 'react';
import Icon from './ui/Icon';

const fmt = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Dubai', hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
const hourFmt = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Dubai', hour12: false, hour: '2-digit' });

function greeting(date) {
  const h = Number(hourFmt.format(date));
  if (h < 5) return "It's the middle of the night in Dubai. Yes, I might be coding.";
  if (h < 12) return 'Good morning from Dubai ☀️';
  if (h < 18) return 'Good afternoon from Dubai 🌤️';
  return 'Good evening from Dubai 🌙';
}

// Live Dubai time. The tooltip greets you based on the local hour there.
export default function Clock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <p className="mono clock cursor-target" title={greeting(now)}>
      <Icon name="clock" size={16} /> <span>{fmt.format(now)}</span> GMT+4
    </p>
  );
}

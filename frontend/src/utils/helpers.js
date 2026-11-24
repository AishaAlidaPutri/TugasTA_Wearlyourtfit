export const CATEGORIES = [
  'All',
  'Atasan',
  'Bawahan',
  'Outerwear',
  'Dress',
  'Sepatu',
  'Tas',
  'Aksesori'
];

export const OCCASIONS = [
  'All',
  'Casual',
  'Campus',
  'Work',
  'Party',
  'Formal',
  'Date Night',
  'Sporty'
];

export const POPULAR_COLORS = [
  { name: 'White', hex: '#FFFFFF', border: true },
  { name: 'Cream', hex: '#FAF8F5' },
  { name: 'Beige', hex: '#E6D7C3' },
  { name: 'Gold / Camel', hex: '#BFA074' },
  { name: 'Terracotta', hex: '#C26D53' },
  { name: 'Taupe', hex: '#8C8275' },
  { name: 'Sage Green', hex: '#94A38E' },
  { name: 'Navy', hex: '#1B263B' },
  { name: 'Charcoal', hex: '#2A2723' },
  { name: 'Black', hex: '#1C1917' }
];

export function formatDateIndonesian(dateInput) {
  if (!dateInput) return '-';
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return String(dateInput);

  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const dayName = days[date.getDay()];
  const day = date.getDate();
  const monthName = months[date.getMonth()];
  const year = date.getFullYear();

  return `${dayName}, ${day} ${monthName} ${year}`;
}

export function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 11) return 'Selamat Pagi';
  if (hour < 15) return 'Selamat Siang';
  if (hour < 18) return 'Selamat Sore';
  return 'Selamat Malam';
}

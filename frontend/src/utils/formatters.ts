export function getAqiColor(aqi: number): {
  bg: string;
  text: string;
  border: string;
  badge: string;
  category: string;
} {
  if (aqi <= 50) {
    return {
      bg: 'bg-emerald-950/40',
      text: 'text-emerald-400',
      border: 'border-emerald-500/30',
      badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      category: 'Good',
    };
  } else if (aqi <= 100) {
    return {
      bg: 'bg-amber-950/40',
      text: 'text-amber-400',
      border: 'border-amber-500/30',
      badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      category: 'Moderate',
    };
  } else if (aqi <= 150) {
    return {
      bg: 'bg-orange-950/40',
      text: 'text-orange-400',
      border: 'border-orange-500/30',
      badge: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
      category: 'Unhealthy for Sensitive Groups',
    };
  } else if (aqi <= 200) {
    return {
      bg: 'bg-red-950/40',
      text: 'text-red-400',
      border: 'border-red-500/30',
      badge: 'bg-red-500/20 text-red-300 border-red-500/40',
      category: 'Unhealthy',
    };
  } else if (aqi <= 300) {
    return {
      bg: 'bg-purple-950/40',
      text: 'text-purple-400',
      border: 'border-purple-500/30',
      badge: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
      category: 'Very Unhealthy',
    };
  } else {
    return {
      bg: 'bg-rose-950/60',
      text: 'text-rose-400',
      border: 'border-rose-500/40',
      badge: 'bg-rose-500/20 text-rose-300 border-rose-500/50',
      category: 'Hazardous',
    };
  }
}

export function getEuropeanAqiBadge(aqi: number): {
  category: string;
  badge: string;
} {
  if (aqi <= 20) {
    return { category: 'Good', badge: 'bg-teal-500/20 text-teal-300 border-teal-500/40' };
  } else if (aqi <= 40) {
    return { category: 'Fair', badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' };
  } else if (aqi <= 60) {
    return { category: 'Moderate', badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40' };
  } else if (aqi <= 80) {
    return { category: 'Poor', badge: 'bg-orange-500/20 text-orange-300 border-orange-500/40' };
  } else if (aqi <= 100) {
    return { category: 'Very Poor', badge: 'bg-red-500/20 text-red-300 border-red-500/40' };
  } else {
    return { category: 'Extremely Poor', badge: 'bg-purple-500/20 text-purple-300 border-purple-500/40' };
  }
}

// Indian CPCB National Air Quality Index (NAQI) Breakpoints (0-50 Good, 51-100 Satisfactory, 101-200 Moderate, 201-300 Poor, 301-400 Very Poor, 401-500 Severe)
export function getCpcbAqiCategory(aqi: number): string {
  if (aqi <= 50) return 'Good';
  if (aqi <= 100) return 'Satisfactory';
  if (aqi <= 200) return 'Moderate';
  if (aqi <= 300) return 'Poor';
  if (aqi <= 400) return 'Very Poor';
  return 'Severe';
}

export function formatTime(isoString: string): string {
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return isoString;
  }
}

export function formatDate(isoString: string): string {
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    return d.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
  } catch {
    return isoString;
  }
}

// US AQI Category determination based on EPA Standard Breakpoints
export function getUsAqiCategory(aqi: number): {
  category: 'Good' | 'Moderate' | 'Unhealthy for Sensitive Groups' | 'Unhealthy' | 'Very Unhealthy' | 'Hazardous';
  color: string;
  advisory: string;
} {
  if (aqi <= 50) {
    return {
      category: 'Good',
      color: '#10B981', // green
      advisory: 'Air quality is satisfactory, and air pollution poses little or no risk.',
    };
  } else if (aqi <= 100) {
    return {
      category: 'Moderate',
      color: '#F59E0B', // yellow/amber
      advisory: 'Air quality is acceptable; however, sensitive individuals may experience minor irritation.',
    };
  } else if (aqi <= 150) {
    return {
      category: 'Unhealthy for Sensitive Groups',
      color: '#F97316', // orange
      advisory: 'Members of sensitive groups may experience health effects. The general public is less likely to be affected.',
    };
  } else if (aqi <= 200) {
    return {
      category: 'Unhealthy',
      color: '#EF4444', // red
      advisory: 'Some members of the general public may experience health effects; sensitive groups experience more serious effects.',
    };
  } else if (aqi <= 300) {
    return {
      category: 'Very Unhealthy',
      color: '#8B5CF6', // purple
      advisory: 'Health alert: The risk of health effects is increased for everyone.',
    };
  } else {
    return {
      category: 'Hazardous',
      color: '#7F1D1D', // maroon/dark red
      advisory: 'Health warning of emergency conditions: The entire population is likely to be affected.',
    };
  }
}

export function getEuropeanAqiCategory(aqi: number): string {
  if (aqi <= 20) return 'Good';
  if (aqi <= 40) return 'Fair';
  if (aqi <= 60) return 'Moderate';
  if (aqi <= 80) return 'Poor';
  if (aqi <= 100) return 'Very Poor';
  return 'Extremely Poor';
}


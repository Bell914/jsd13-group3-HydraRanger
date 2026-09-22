const FIELD_RULES = [
  { name: 'chestCm', label: 'Chest', min: 60, max: 160 },
  { name: 'waistCm', label: 'Waist', min: 50, max: 160 },
  { name: 'hipsCm', label: 'Hips', min: 60, max: 180 }
];

export function validateSizeProfile(profile) {
  const errors = [];

  FIELD_RULES.forEach((field) => {
    const value = Number(profile[field.name]);
    if (!Number.isFinite(value) || value < field.min || value > field.max) {
      errors.push(`${field.label} must be between ${field.min} and ${field.max}`);
    }
  });

  if (!['fitted', 'regular', 'relaxed'].includes(profile.preferredFit)) {
    errors.push('Preferred fit must be fitted, regular, or relaxed');
  }

  if (profile.consentGiven !== true) {
    errors.push('Consent is required before saving body measurements');
  }

  return { isValid: errors.length === 0, errors };
}

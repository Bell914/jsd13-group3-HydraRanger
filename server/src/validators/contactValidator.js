export function validateContactInput({ name, email, phone, topic, message }) {
  const errors = [];
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (typeof name !== 'string' || name.trim().length < 2 || name.trim().length > 100) {
    errors.push('Name must contain 2 to 100 characters');
  }
  if (typeof email !== 'string' || !emailPattern.test(email.trim())) {
    errors.push('A valid email address is required');
  }
  if (phone !== undefined && phone !== '' && (typeof phone !== 'string' || phone.trim().length > 30)) {
    errors.push('Phone must not exceed 30 characters');
  }
  if (typeof topic !== 'string' || !topic.trim() || topic.trim().length > 150) {
    errors.push('Topic is required and must not exceed 150 characters');
  }
  if (typeof message !== 'string' || message.trim().length < 10 || message.trim().length > 3000) {
    errors.push('Message must contain 10 to 3000 characters');
  }
  return { isValid: errors.length === 0, errors };
}

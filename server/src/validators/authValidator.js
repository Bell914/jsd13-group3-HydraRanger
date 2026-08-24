export const validateRegisterInput = ({ username, email, password }) => {
  const errors = [];

  if (!username || typeof username !== 'string' || username.trim().length < 3) {
    errors.push('Username is required and must be at least 3 characters');
  }

  const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
  if (!email || !emailRegex.test(email.trim())) {
    errors.push('A valid email address is required');
  }

  if (!password || password.length < 6) {
    errors.push('Password is required and must be at least 6 characters');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateLoginInput = ({ email, password }) => {
  const errors = [];

  if (!email || typeof email !== 'string' || !email.trim()) {
    errors.push('Email is required');
  }

  if (!password || typeof password !== 'string') {
    errors.push('Password is required');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateRegisterInput = ({ username, email, password }) => {
  const errors = [];

  if (!username || typeof username !== 'string' || username.trim().length < 3) {
    errors.push('Username is required and must be at least 3 characters');
  }

  const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
  if (!email || !emailRegex.test(email.trim())) {
    errors.push('A valid email address is required');
  }

  if (!password || password.length < 8) {
    errors.push('Password is required and must be at least 8 characters');
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

export const validateUpdateProfileInput = ({ username, email, birthday }) => {
  const errors = [];

  if (
    username !== undefined &&
    (typeof username !== 'string' || username.trim().length < 3)
  ) {
    errors.push('Username must be at least 3 characters');
  }

  const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
  if (
    email !== undefined &&
    (typeof email !== 'string' || !emailRegex.test(email.trim()))
  ) {
    errors.push('A valid email address is required');
  }

  if (birthday !== undefined && birthday !== null && birthday !== '') {
    const birthDate = new Date(birthday);
    if (Number.isNaN(birthDate.getTime())) {
      errors.push('A valid birthday date is required');
    } else if (birthDate.getTime() > Date.now()) {
      errors.push('Birthday cannot be in the future');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateChangePasswordInput = ({ currentPassword, newPassword }) => {
  const errors = [];

  if (!currentPassword || typeof currentPassword !== 'string') {
    errors.push('Current password is required');
  }

  if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 8) {
    errors.push('New password is required and must be at least 8 characters');
  }

  if (newPassword && currentPassword && newPassword === currentPassword) {
    errors.push('New password must be different from the current password');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateRefreshToken = ({ token }) => {
  const isValid = typeof token === 'string' && token.trim().length > 0;
  return {
    isValid,
    errors: isValid ? [] : ['Token is required']
  };
};

export const validateForgotPasswordInput = ({ email }) => {
  const isValid = typeof email === 'string' && /^\S+@\S+\.\S+$/.test(email.trim());
  return {
    isValid,
    errors: isValid ? [] : ['A valid email address is required']
  };
};

export const validateResetPasswordInput = ({ password }) => {
  const isValid = typeof password === 'string' && password.length >= 8;
  return {
    isValid,
    errors: isValid ? [] : ['Password must be at least 8 characters']
  };
};

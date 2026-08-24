import { HTTP_STATUS } from '../config/constants.js';

export const validate = (validatorFn) => {
  return (req, res, next) => {
    const { isValid, errors } = validatorFn(req.body);
    if (!isValid) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }
    next();
  };
};

import { HTTP_STATUS } from '../config/constants.js';
import * as dashboardService from '../services/dashboardService.js';

export async function getDashboardSummary(req, res, next) {
  try {
    const summary = await dashboardService.getDashboardSummary();
    res.status(HTTP_STATUS.OK).json({ success: true, data: summary });
  } catch (error) {
    next(error);
  }
}

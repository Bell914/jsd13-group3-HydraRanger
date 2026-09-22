import { User } from '../models/User.js';
import { HTTP_STATUS } from '../config/constants.js';

// POST /api/lookbooks/:id/favorite - บันทึก / ยกเลิกบันทึก Lookbook (Toggle)
export const toggleFavoriteLookbook = async (req, res, next) => {
  try {
    const userId = req.user?._id || req.user?.id;
    const { id: lookbookId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({ success: false, message: 'User not found' });
    }

    if (!user.favoriteLookbooks) {
      user.favoriteLookbooks = [];
    }

    const index = user.favoriteLookbooks.indexOf(lookbookId);
    let isFavorited = false;

    if (index > -1) {
      // มีอยู่แล้ว -> ลบออก (Unfavorite)
      user.favoriteLookbooks.splice(index, 1);
      isFavorited = false;
    } else {
      // ยังไม่มี -> เพิ่มเข้า (Favorite)
      user.favoriteLookbooks.push(lookbookId);
      isFavorited = true;
    }

    await user.save();

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: isFavorited ? 'Saved to Favorite Lookbooks' : 'Removed from Favorite Lookbooks',
      isFavorited,
      favoriteLookbooks: user.favoriteLookbooks
    });
  } catch (error) {
    next(error);
  }
};
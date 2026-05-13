import * as categoryService from '../services/category.service.js';

const getCategories = async (req, res, next) => {
  try {
    const result = await categoryService.getCategories();
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export { getCategories };
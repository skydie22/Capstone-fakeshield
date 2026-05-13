// src/controllers/auth.controller.js
import * as authService from '../services/auth.service.js';

const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const result = await authService.register({ name, email, password });

    res.status(201).json({
      success: true,
      message: 'Registration successful.',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login({ email, password });

    res.status(200).json({
      success: true,
      message: 'Login successful.',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// const me = async (req, res) => {
//   res.status(200).json({
//     success: true,
//     data: req.user,
//   });
// };

const me = async (req, res) => {
  res.status(200).json({
    id: req.user.id,
    name: req.user.name,
    email: req.user.email,
    created_at: req.user.createdAt,
  });
};

export { register, login, me };

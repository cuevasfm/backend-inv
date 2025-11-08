const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { jwt: jwtConfig } = require('../config/auth');
const { logAction, getRequestInfo } = require('../utils/auditLogger');

// Generar JWT token
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role
    },
    jwtConfig.secret,
    { expiresIn: jwtConfig.expiresIn }
  );
};

// Generar refresh token
const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user.id },
    jwtConfig.refreshSecret,
    { expiresIn: jwtConfig.refreshExpiresIn }
  );
};

// Login
exports.login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    // Validar entrada
    if (!username || !password) {
      return res.status(400).json({
        error: 'Missing credentials',
        message: 'Username and password are required'
      });
    }

    // Buscar usuario
    const user = await User.findOne({ where: { username } });

    if (!user) {
      return res.status(401).json({
        error: 'Invalid credentials',
        message: 'Username or password is incorrect'
      });
    }

    // Verificar contraseña
    const isValidPassword = await user.validatePassword(password);

    if (!isValidPassword) {
      return res.status(401).json({
        error: 'Invalid credentials',
        message: 'Username or password is incorrect'
      });
    }

    // Verificar si el usuario está activo
    if (!user.isActive) {
      return res.status(403).json({
        error: 'Account disabled',
        message: 'Your account has been disabled'
      });
    }

    // Actualizar último login
    await user.update({ lastLogin: new Date() });

    // Generar tokens
    const token = generateToken(user);
    const refreshToken = generateRefreshToken(user);

    // Registrar log de auditoría
    const requestInfo = getRequestInfo(req);
    await logAction({
      userId: user.id,
      username: user.username,
      action: 'LOGIN',
      module: 'auth',
      description: `Usuario ${user.username} inició sesión exitosamente`,
      ipAddress: requestInfo.ipAddress,
      userAgent: requestInfo.userAgent
    });

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        preferredInterface: user.preferredInterface
      },
      token,
      refreshToken
    });
  } catch (error) {
    next(error);
  }
};

// Registro (solo para admin)
exports.register = async (req, res, next) => {
  try {
    const {
      username,
      email,
      password,
      firstName,
      lastName,
      role,
      preferredInterface
    } = req.body;

    // Validar entrada
    if (!username || !email || !password) {
      return res.status(400).json({
        error: 'Missing fields',
        message: 'Username, email and password are required'
      });
    }

    // Crear usuario
    const user = await User.create({
      username,
      email,
      passwordHash: password, // El hook beforeCreate encriptará la contraseña
      firstName,
      lastName,
      role: role || 'cashier',
      preferredInterface: preferredInterface || 'desktop'
    });

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
};

// Obtener usuario actual
exports.me = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['passwordHash'] }
    });

    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    res.json({ user });
  } catch (error) {
    next(error);
  }
};

// Refresh token
exports.refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        error: 'Missing refresh token'
      });
    }

    // Verificar refresh token
    const decoded = jwt.verify(refreshToken, jwtConfig.refreshSecret);

    // Buscar usuario
    const user = await User.findByPk(decoded.id);

    if (!user || !user.isActive) {
      return res.status(401).json({
        error: 'Invalid refresh token'
      });
    }

    // Generar nuevos tokens
    const token = generateToken(user);
    const newRefreshToken = generateRefreshToken(user);

    res.json({
      token,
      refreshToken: newRefreshToken
    });
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Invalid refresh token'
      });
    }
    next(error);
  }
};

// Logout
exports.logout = async (req, res, next) => {
  try {
    // Registrar log de auditoría
    const requestInfo = getRequestInfo(req);
    await logAction({
      userId: req.user?.id,
      username: req.user?.username,
      action: 'LOGOUT',
      module: 'auth',
      description: `Usuario ${req.user?.username} cerró sesión`,
      ipAddress: requestInfo.ipAddress,
      userAgent: requestInfo.userAgent
    });

    // En un sistema más complejo, aquí invalidaríamos el token
    // Por ahora, solo enviamos un mensaje de éxito
    res.json({
      message: 'Logout successful'
    });
  } catch (error) {
    next(error);
  }
};

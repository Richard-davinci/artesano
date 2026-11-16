import { profileImageExtension } from '../middlewares/profileImageUpload.js';
import { buscarPerfil, guardarFotoPerfil, iniciarSesion, registrarUsuario } from '../services/AuthService.js';

class AuthController {
  // Registra un usuario.
  async register(req, res, next) {
    try {
      const { name, email, password } = req.body ?? {};

      if (typeof name !== 'string' || !name.trim()) {
        return res.status(400).json({ message: 'Ingresá tu nombre' });
      }

      const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
        return res.status(400).json({ message: 'Ingresá un email válido' });
      }

      if (typeof password !== 'string' || [...password].length < 8) {
        return res.status(400).json({
          message: 'La contraseña debe tener al menos 8 caracteres'
        });
      }

      // Límite de entrada de bcrypt.
      if (Buffer.byteLength(password, 'utf8') > 72) {
        return res.status(400).json({
          message: 'La contraseña es demasiado larga. Probá acortarla'
        });
      }

      const passwordRequirements =
        'Incluí al menos una minúscula, una mayúscula, un número y un carácter especial';

      // Caracteres permitidos.
      const allowedCharacters = /^[\p{L}\p{M}\x20-\x7E]+$/u;
      const specialCharacter = /[\x21-\x2F\x3A-\x40\x5B-\x60\x7B-\x7E]/;
      if (!allowedCharacters.test(password) || /[^\S ]/u.test(password) || /[\u20E3\uFE0E\uFE0F]/u.test(password)) {
        return res.status(400).json({
          message: passwordRequirements
        });
      }

      if (!/\p{Lu}/u.test(password) || !/\p{Ll}/u.test(password) ||
          !/[0-9]/.test(password) || !specialCharacter.test(password)) {
        return res.status(400).json({
          message: passwordRequirements
        });
      }

      const user = await registrarUsuario({ name, email: normalizedEmail, password });
      if (!user) {
        return res.status(409).json({ message: 'El email ya está registrado' });
      }

      return res.status(201).json({
        message: 'Usuario registrado',
        data: { _id: user._id, email: user.email }
      });
    } catch (error) {
      return next(error);
    }
  }

  // Devuelve el perfil del usuario autenticado.
  async getMe(req, res, next) {
    try {
      const user = await buscarPerfil(req.user._id);
      if (!user) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }

      return res.status(200).json({
        message: 'Perfil del usuario',
        data: { _id: user._id, name: user.name, email: user.email, profileImage: user.profileImage ?? null }
      });
    } catch (error) {
      return next(error);
    }
  }

  // Guarda la foto y actualiza el perfil.
  async uploadProfileImage(req, res, next) {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'Enviá una imagen en el campo profileImage' });
      }

      const extension = profileImageExtension(req.file.buffer);
      if (!extension) {
        return res.status(400).json({ message: 'Usá una imagen JPEG, PNG o WebP' });
      }

      const perfil = await guardarFotoPerfil(req.user._id, req.file.buffer, extension);
      if (!perfil) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }

      return res.status(200).json({
        message: 'Foto de perfil actualizada',
        data: perfil
      });
    } catch (error) {
      return next(error);
    }
  }

  // Inicia sesión y emite un token.
  async login(req, res, next) {
    try {
      const { email, password } = req.body ?? {};
      const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';

      if (!normalizedEmail || typeof password !== 'string' || !password ||
          Buffer.byteLength(password, 'utf8') > 72) {
        return res.status(400).json({ message: 'Ingresá un email y una contraseña válidos' });
      }

      const token = await iniciarSesion(normalizedEmail, password);
      if (!token) return res.status(401).json({ message: 'Credenciales inválidas' });

      return res.status(200).json({ message: 'Sesión iniciada', token });
    } catch (error) {
      return next(error);
    }
  }
}

export default AuthController;

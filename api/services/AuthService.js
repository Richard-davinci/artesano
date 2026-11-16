import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { randomUUID } from 'node:crypto';
import { mkdir, writeFile, unlink } from 'node:fs/promises';
import { join } from 'node:path';
import User from '../models/User.js';
import { profileImageDir } from '../middlewares/profileImageUpload.js';

// Comprueba el email y registra la cuenta con el hash.
export async function registrarUsuario({ name, email, password }) {
  const existingUser = await User.findOne({ email });
  if (existingUser) return null;

  const hashedPassword = await bcrypt.hash(password, 10);
  return User.create({ name: name.trim(), email, password: hashedPassword });
}

// Valida las credenciales y firma el JWT.
export async function iniciarSesion(email, password) {
  const user = await User.findOne({ email });
  if (!user || !(await bcrypt.compare(password, user.password))) return null;

  const secret = process.env.SECRET_KEY;
  if (!secret?.trim()) throw new Error('Falta configurar SECRET_KEY');

  return jwt.sign(
    { _id: user._id, name: user.name, role: user.role ?? 'user' },
    secret,
    { expiresIn: '1h' }
  );
}

export function buscarPerfil(id) {
  return User.findById(id).select('name email profileImage');
}

// Guarda la foto nueva y elimina la anterior.
export async function guardarFotoPerfil(id, bytes, extension) {
  const filename = `${randomUUID()}.${extension}`;
  const path = join(profileImageDir, filename);
  const profileImage = `/uploads/profiles/${filename}`;
  await mkdir(profileImageDir, { recursive: true });
  await writeFile(path, bytes, { flag: 'wx' });

  let user;
  try {
    user = await User.findByIdAndUpdate(id, { profileImage }, { new: false })
      .select('name email profileImage');
  } catch (error) {
    await unlink(path).catch(() => {});
    throw error;
  }

  if (!user) {
    await unlink(path);
    return null;
  }

  const previous = user.profileImage?.match(/^\/uploads\/profiles\/([0-9a-f-]{36}\.(?:jpg|png|webp))$/i);
  if (previous) await unlink(join(profileImageDir, previous[1])).catch(() => {});

  return { _id: user._id, name: user.name, email: user.email, profileImage };
}

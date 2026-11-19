import PasswordInput from '../components/PasswordInput.jsx';
import useErroresCampos from '../components/useErroresCampos.js';
import ErrorCampo from '../components/ErrorCampo.jsx';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registrarUsuario } from '../services/api.js';

export default function Registro() {
  const { errores, setErrorCampo, limpiarErrores, atributosCampo, eventosFormulario } = useErroresCampos();
  const [usuario, setUsuario] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Actualiza el campo que se está editando.
  function handleChange(event) {
    const { name, value } = event.target;
    setUsuario({ ...usuario, [name]: value });
  }

  // Confirma la contraseña y registra la cuenta.
  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    limpiarErrores();
    const { name, email, password, confirmPassword } = usuario;
    if (!name.trim()) {
      setErrorCampo('name', 'Ingresá tu nombre.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setErrorCampo('email', 'Ingresá un email válido.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorCampo('confirmPassword', 'Las contraseñas no coinciden.');
      return;
    }
    if ([...password].length < 8) {
      setErrorCampo('password', 'La contraseña debe tener al menos 8 caracteres.');
      return;
    }
    if (new TextEncoder().encode(password).length > 72) {
      setErrorCampo('password', 'La contraseña es demasiado larga. Probá acortarla.');
      return;
    }

    const caracteresPermitidos = /^[\p{L}\p{M}\x20-\x7E]+$/u;
    const caracterEspecial = /[\x21-\x2F\x3A-\x40\x5B-\x60\x7B-\x7E]/;
    if (!caracteresPermitidos.test(password) || /[\u20E3\uFE0E\uFE0F]/u.test(password)) {
      setErrorCampo('password', 'La contraseña contiene caracteres no admitidos. Usá letras, números, espacios y signos comunes.');
      return;
    }
    if (!/\p{Ll}/u.test(password) || !/\p{Lu}/u.test(password) ||
        !/[0-9]/.test(password) || !caracterEspecial.test(password)) {
      setErrorCampo('password', 'Incluí al menos una minúscula, una mayúscula, un número y un carácter especial.');
      return;
    }

    setEnviando(true);
    try {
      await registrarUsuario(name.trim(), email.trim(), password);
      navigate('/login');
    } catch (error) {
      setError(error.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <main className="auth-card">
      <h1>Registrarme</h1>
      <form {...eventosFormulario} onSubmit={handleSubmit}>
        <p>
          <label htmlFor="name">Nombre</label>
          <input id="name" {...atributosCampo('name')} name="name" autoComplete="name"
            value={usuario.name} onChange={handleChange} required />
            <ErrorCampo id="name" mensaje={errores['name']} />
        </p>
        <p>
          <label htmlFor="email">Correo electrónico</label>
          <input id="email" {...atributosCampo('email')} name="email" type="email" autoComplete="email"
            value={usuario.email} onChange={handleChange} required />
            <ErrorCampo id="email" mensaje={errores['email']} />
        </p>
        <p>
          <label htmlFor="password">Contraseña</label>
          <PasswordInput id="password" {...atributosCampo('password', 'reglas-password')} name="password" type="password" autoComplete="new-password" minLength={8}
            value={usuario.password} onChange={handleChange} required />
            <ErrorCampo id="password" mensaje={errores['password']} />
        </p>
        <p className="auth-hint" id="reglas-password">
          Usá al menos 8 caracteres. Incluí al menos una minúscula, una mayúscula, un número y un carácter especial.
        </p>
        <p>
          <label htmlFor="confirmPassword">Repetir contraseña</label>
          <PasswordInput id="confirmPassword" {...atributosCampo('confirmPassword')} name="confirmPassword" type="password" autoComplete="new-password"
            value={usuario.confirmPassword} onChange={handleChange} required />
            <ErrorCampo id="confirmPassword" mensaje={errores['confirmPassword']} />
        </p>
        <button type="submit" disabled={enviando}>
          {enviando ? 'Registrando...' : 'Registrarme'}
        </button>
        {error && <p role="alert">{error}</p>}
      </form>
      <p className="auth-alternative">¿Ya tenés cuenta? <Link to="/login">Iniciá sesión</Link></p>
    </main>
  );
}

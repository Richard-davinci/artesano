import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registrarUsuario } from '../services/api.js';

export default function Registro() {
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
    const { name, email, password, confirmPassword } = usuario;
    if (!name.trim()) {
      setError('Ingresá tu nombre.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Ingresá un email válido.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    if ([...password].length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.');
      return;
    }
    if (new TextEncoder().encode(password).length > 72) {
      setError('La contraseña es demasiado larga. Probá acortarla.');
      return;
    }

    const caracteresPermitidos = /^[\p{L}\p{M}\x20-\x7E]+$/u;
    const caracterEspecial = /[\x21-\x2F\x3A-\x40\x5B-\x60\x7B-\x7E]/;
    if (!caracteresPermitidos.test(password) || /[\u20E3\uFE0E\uFE0F]/u.test(password) ||
        !/\p{Ll}/u.test(password) || !/\p{Lu}/u.test(password) ||
        !/[0-9]/.test(password) || !caracterEspecial.test(password)) {
      setError('Incluí al menos una minúscula, una mayúscula, un número y un carácter especial.');
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
    <main className="menu">
      <h1>Registrarme</h1>
      <form onSubmit={handleSubmit}>
        <p>
          <label htmlFor="name">Nombre</label>{' '}
          <input id="name" name="name" autoComplete="name"
            value={usuario.name} onChange={handleChange} required />
        </p>
        <p>
          <label htmlFor="email">Email</label>{' '}
          <input id="email" name="email" type="email" autoComplete="email"
            value={usuario.email} onChange={handleChange} required />
        </p>
        <p>
          <label htmlFor="password">Contraseña</label>{' '}
          <input id="password" name="password" type="password" autoComplete="new-password"
            aria-describedby="reglas-password" minLength={8}
            value={usuario.password} onChange={handleChange} required />
        </p>
        <p id="reglas-password">
          Usá al menos 8 caracteres. Incluí al menos una minúscula, una mayúscula, un número y un carácter especial.
        </p>
        <p>
          <label htmlFor="confirmPassword">Repetir contraseña</label>{' '}
          <input id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password"
            value={usuario.confirmPassword} onChange={handleChange} required />
        </p>
        <button type="submit" disabled={enviando}>
          {enviando ? 'Registrando...' : 'Registrarme'}
        </button>
        {error && <p role="alert">{error}</p>}
      </form>
    </main>
  );
}

import { useState } from 'react';

// Permite mostrar u ocultar el texto del campo.
export default function PasswordInput(props) {
  const [visible, setVisible] = useState(false);

  return (
    <span className="password-field">
      <input {...props} type={visible ? 'text' : 'password'} />
      <button type="button" aria-controls={props.id}
        aria-label={`${visible ? 'Ocultar' : 'Mostrar'} contraseña${props.name === 'confirmPassword' ? ' de confirmación' : ''}`}
        onClick={() => setVisible(!visible)}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"
          strokeLinejoin="round" aria-hidden="true" focusable="false">
          <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
          <circle cx="12" cy="12" r="3" />
          {visible && <path d="M3 3 21 21" />}
        </svg>
      </button>
    </span>
  );
}

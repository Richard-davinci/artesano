import { useState } from 'react';

// Asocia los mensajes de validación a cada campo.
export default function useErroresCampos() {
  const [errores, setErrores] = useState({});

  function setErrorCampo(id, mensaje) {
    setErrores((actuales) => ({ ...actuales, [id]: mensaje }));
    document.getElementById(id)?.focus();
  }

  function limpiarErrores() {
    setErrores({});
  }

  function atributosCampo(id, ayuda = '') {
    return {
      'aria-invalid': Boolean(errores[id]),
      'aria-describedby': [ayuda, errores[id] && `${id}-error`].filter(Boolean).join(' ') || undefined
    };
  }

  function onInvalid(event) {
    event.preventDefault();
    const campo = event.target;
    let mensaje = 'Revisá el valor de este campo.';
    if (campo.validity.valueMissing) mensaje = 'Completá este campo.';
    else if (campo.validity.typeMismatch) mensaje = 'Ingresá un correo electrónico válido.';
    else if (campo.validity.rangeUnderflow) mensaje = `Ingresá un valor mayor o igual a ${campo.min}.`;
    else if (campo.validity.tooShort) mensaje = `Usá al menos ${campo.minLength} caracteres.`;
    setErrores((actuales) => ({ ...actuales, [campo.id]: mensaje }));
    const primero = campo.form?.querySelector(':invalid');
    primero?.focus();
  }

  function onInput(event) {
    const { id } = event.target;
    setErrores((actuales) => ({ ...actuales, [id]: '' }));
  }

  return { errores, setErrorCampo, limpiarErrores, atributosCampo, eventosFormulario: { onInvalid, onInput } };
}

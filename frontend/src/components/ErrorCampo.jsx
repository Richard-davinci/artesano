// Muestra el mensaje junto al campo que debe corregirse.
export default function ErrorCampo({ id, mensaje }) {
  return mensaje ? <span className="field-error" id={`${id}-error`} role="alert">{mensaje}</span> : null;
}

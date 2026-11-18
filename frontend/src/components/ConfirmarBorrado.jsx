import { useEffect, useRef } from 'react';

export default function ConfirmarBorrado({ tipo, nombre, onCancelar, onConfirmar }) {
  const dialogo = useRef(null);
  const cancelar = useRef(null);

  useEffect(() => {
    const panel = dialogo.current;
    panel.showModal();
    cancelar.current.focus();
    return () => panel.close();
  }, []);

  function cerrar(accion) {
    dialogo.current.close();
    accion();
  }

  return (
    <dialog ref={dialogo} className="confirmar-borrado" aria-labelledby="titulo-borrado"
      aria-describedby="detalle-borrado" onCancel={(event) => {
        event.preventDefault();
        cerrar(onCancelar);
      }}>
      <h3 id="titulo-borrado">¿Borrar {tipo}?</h3>
      <p id="detalle-borrado">Se eliminará <strong>{nombre}</strong> de forma permanente.</p>
      <footer>
        <button ref={cancelar} type="button" onClick={() => cerrar(onCancelar)}>Cancelar</button>
        <button className="boton-borrar" type="button" onClick={() => cerrar(onConfirmar)}>Borrar {tipo}</button>
      </footer>
    </dialog>
  );
}

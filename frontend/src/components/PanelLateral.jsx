export default function PanelLateral({ panelRef, tituloId, titulo, guardando, acciones, children }) {
  return (
    <dialog ref={panelRef} className={acciones ? 'panel-lateral con-footer' : 'panel-lateral'} aria-labelledby={tituloId}
      onCancel={(event) => { if (guardando) event.preventDefault(); }}>
      <div className="panel-header">
        <h3 id={tituloId}>{titulo}</h3>
        <button type="button" aria-label="Cerrar formulario" disabled={guardando}
          onClick={() => panelRef.current.close()}>×</button>
      </div>
      {acciones ? (
        <>
          <div className="panel-content">{children}</div>
          <footer className="panel-footer">{acciones}</footer>
        </>
      ) : children}
    </dialog>
  );
}

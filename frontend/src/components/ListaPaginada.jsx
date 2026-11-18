import { useEffect, useState } from 'react';

const filasPorPagina = 10;

export default function ListaPaginada({ elementos, etiqueta, children }) {
  const [pagina, setPagina] = useState(1);
  const totalPaginas = Math.max(1, Math.ceil(elementos.length / filasPorPagina));
  const paginaActual = Math.min(pagina, totalPaginas);
  const inicio = (paginaActual - 1) * filasPorPagina;

  useEffect(() => {
    if (pagina > totalPaginas) setPagina(totalPaginas);
  }, [pagina, totalPaginas]);

  return (
    <>
      {children(elementos.slice(inicio, inicio + filasPorPagina))}
      {totalPaginas > 1 && (
        <nav className="paginacion-admin" aria-label={etiqueta}>
          <button type="button" disabled={paginaActual === 1}
            onClick={() => setPagina(paginaActual - 1)}>Anterior</button>
          <span role="status">Página {paginaActual} de {totalPaginas}</span>
          <button type="button" disabled={paginaActual === totalPaginas}
            onClick={() => setPagina(paginaActual + 1)}>Siguiente</button>
        </nav>
      )}
    </>
  );
}

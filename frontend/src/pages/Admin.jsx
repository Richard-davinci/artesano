import { useEffect, useState } from 'react';
import ListaCategorias from '../components/ListaCategorias.jsx';
import { obtenerCategorias } from '../services/api.js';

export default function Admin() {
  const [categorias, setCategorias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();

    // Carga las categorías para el panel.
    async function cargarCategorias() {
      try {
        const resultado = await obtenerCategorias(controller.signal);
        if (!controller.signal.aborted) setCategorias(resultado);
      } catch {
        if (!controller.signal.aborted) setError('No pudimos cargar las categorías.');
      } finally {
        if (!controller.signal.aborted) setCargando(false);
      }
    }

    cargarCategorias();
    return () => controller.abort();
  }, []);

  return (
    <main className="menu">
      <h1>Administración</h1>
      <section aria-labelledby="titulo-categorias">
        <h2 id="titulo-categorias">Categorías</h2>
        {cargando && <p role="status">Cargando categorías...</p>}
        {error && <p role="alert">{error}</p>}
        {!cargando && !error && <ListaCategorias categorias={categorias} />}
      </section>
    </main>
  );
}

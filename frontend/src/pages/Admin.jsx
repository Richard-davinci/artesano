import { useEffect, useState } from 'react';
import ListaCategorias from '../components/ListaCategorias.jsx';
import ListaPlatos from '../components/ListaPlatos.jsx';
import { obtenerCategorias, obtenerPlatos } from '../services/api.js';

export default function Admin() {
  const [seccion, setSeccion] = useState('platos');
  const [categorias, setCategorias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [platos, setPlatos] = useState([]);
  const [cargandoPlatos, setCargandoPlatos] = useState(true);
  const [errorPlatos, setErrorPlatos] = useState('');

  useEffect(() => {
    const controller = new AbortController();

    // Carga los platos para el panel.
    async function cargarPlatos() {
      try {
        const resultado = await obtenerPlatos(controller.signal);
        if (!controller.signal.aborted) setPlatos(resultado);
      } catch {
        if (!controller.signal.aborted) setErrorPlatos('No pudimos cargar los platos.');
      } finally {
        if (!controller.signal.aborted) setCargandoPlatos(false);
      }
    }

    cargarPlatos();
    return () => controller.abort();
  }, []);

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
    <main className="container vista-admin">
      <h1>Administración</h1>
      <div className="pestanas-admin" role="group" aria-label="Secciones de administración">
        <button type="button" aria-pressed={seccion === 'platos'} aria-controls="panel-platos"
          onClick={() => setSeccion('platos')}>Platos</button>
        <button type="button" aria-pressed={seccion === 'categorias'} aria-controls="panel-categorias"
          onClick={() => setSeccion('categorias')}>Categorías</button>
      </div>
      <div className="secciones-admin">
        <section id="panel-categorias" aria-labelledby="titulo-categorias" hidden={seccion !== 'categorias'}>
          {(cargando || error) && <h2 id="titulo-categorias">Categorías</h2>}
          {cargando && <p role="status">Cargando categorías...</p>}
          {error && <p role="alert">{error}</p>}
          {!cargando && !error && (
            <ListaCategorias categorias={categorias} setCategorias={setCategorias} />
          )}
        </section>
        <section id="panel-platos" aria-labelledby="titulo-platos" hidden={seccion !== 'platos'}>
          {(cargandoPlatos || errorPlatos) && <h2 id="titulo-platos">Platos</h2>}
          {cargandoPlatos && <p role="status">Cargando platos...</p>}
          {errorPlatos && <p role="alert">{errorPlatos}</p>}
          {!cargandoPlatos && !errorPlatos && (
            <ListaPlatos platos={platos} setPlatos={setPlatos} categorias={categorias} />
          )}
        </section>
      </div>
    </main>
  );
}

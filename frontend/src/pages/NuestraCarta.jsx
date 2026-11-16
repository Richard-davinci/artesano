import { useEffect, useState } from 'react';
import PlatoCard from '../components/PlatoCard.jsx';
import { apiUrl, obtenerCategorias, obtenerPlatos } from '../services/api.js';

const filtrosIniciales = { name: '', category: '', minPrice: '', maxPrice: '' };
// Carta pública con filtros de búsqueda.
export default function NuestraCarta() {
  const [platos, setPlatos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [categorias, setCategorias] = useState([]);
  const [errorCategorias, setErrorCategorias] = useState('');
  // Separa lo que se escribe de los filtros aplicados.
  const [campos, setCampos] = useState(filtrosIniciales);
  const [filtros, setFiltros] = useState(filtrosIniciales);

  useEffect(() => {
    const controller = new AbortController();

    // Carga las opciones del desplegable.
    async function cargarCategorias() {
      try {
        const resultado = await obtenerCategorias(controller.signal);
        if (!controller.signal.aborted) setCategorias(resultado);
      } catch {
        if (!controller.signal.aborted) setErrorCategorias('No pudimos cargar las categorías.');
      }
    }

    cargarCategorias();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    // Consulta los platos cuando se aplican los filtros.
    async function cargarPlatos() {
      try {
        setCargando(true);
        setError('');
        const resultado = await obtenerPlatos(controller.signal, filtros);
        if (!controller.signal.aborted) setPlatos(resultado);
      } catch (error) {
        if (!controller.signal.aborted) setError(error.message);
      } finally {
        if (!controller.signal.aborted) setCargando(false);
      }
    }

    cargarPlatos();
    return () => controller.abort();
  }, [filtros]);

  // Actualiza el filtro que está editando el usuario.
  function handleChange(event) {
    const { name, value } = event.target;
    setCampos({ ...campos, [name]: value });
  }

  // Aplica los filtros al consultar los platos.
  function aplicarFiltros(event) {
    event.preventDefault();
    setFiltros({ ...campos, name: campos.name.trim() });
  }

  // Vuelve a mostrar el menú completo.
  function limpiarFiltros() {
    setCampos(filtrosIniciales);
    setFiltros({ ...filtrosIniciales });
  }

  return (
    <main className="container carta-publica">
      <header>
        <p className="marca">Explorá nuestra carta</p>
        <h1>La carta de la casa<span>.</span></h1>
        <p className="intro-carta">Sin vueltas. Buenos ingredientes y mucho sabor.</p>
      </header>
      <form className="filtros-carta" aria-label="Filtros del menú" onSubmit={aplicarFiltros}>
        <p>
          <label htmlFor="buscar-plato">Nombre del plato</label>{' '}
          <input id="buscar-plato" type="search" name="name" placeholder="¿Qué tenés ganas de comer?"
            value={campos.name} onChange={handleChange} />
        </p>
        <p>
          <label htmlFor="categoria-plato">Categoría</label>{' '}
          <select id="categoria-plato" name="category" value={campos.category} onChange={handleChange}>
            <option value="">Todas</option>
            {categorias.map((categoria) => (
              <option key={categoria._id} value={categoria._id}>{categoria.name}</option>
            ))}
          </select>
        </p>
        <p>
          <label htmlFor="precio-minimo">Precio mínimo</label>{' '}
          <input id="precio-minimo" type="number" min="0" step="any" name="minPrice"
            value={campos.minPrice} onChange={handleChange} />
        </p>
        <p>
          <label htmlFor="precio-maximo">Precio máximo</label>{' '}
          <input id="precio-maximo" type="number" min="0" step="any" name="maxPrice"
            value={campos.maxPrice} onChange={handleChange} />
        </p>
        <div className="acciones-filtros-carta">
          <button type="submit">Aplicar filtros</button>
          <button type="button" onClick={limpiarFiltros}>Limpiar filtros</button>
        </div>
        {errorCategorias && <p className="aviso-carta" role="alert">{errorCategorias}</p>}
      </form>
      {cargando && <p role="status">Cargando menú...</p>}
      {error && <p role="alert">{error}</p>}
      {!cargando && !error && (
        <p className="total-carta" role="status">
          {platos.length === 0 ? 'No se encontraron platos.' : (platos.length === 1 ? '1 plato para disfrutar' : `${platos.length} platos para disfrutar`)}
        </p>
      )}
      {/* Tarjetas de los platos encontrados. */}
      <div className="lista-platos">
        {!cargando && !error && platos.map((plato) => (
          <PlatoCard
            key={plato._id}
            nombre={plato.name}
            descripcion={plato.description}
            categoria={plato.category?.name ?? 'Sin categoría'}
            precio={plato.price}
            foto={plato.image ? `${apiUrl}${plato.image}` : null}
            fotoCategoria={plato.category?.image ? `${apiUrl}${plato.category.image}` : null}
          />
        ))}
      </div>
    </main>
  );
}

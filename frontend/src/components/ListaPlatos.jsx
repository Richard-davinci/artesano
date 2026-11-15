import { useState } from 'react';
import PlatoCard from './PlatoCard.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { crearPlato } from '../services/api.js';

const platoInicial = { name: '', description: '', price: '', category: '', available: true };

export default function ListaPlatos({ platos, setPlatos, categorias }) {
  const { token } = useAuth();
  const [plato, setPlato] = useState(platoInicial);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');

  // Actualiza el campo que se está editando.
  function handleChange(event) {
    const { name, value, type, checked } = event.target;
    setPlato({ ...plato, [name]: type === 'checkbox' ? checked : value });
  }

  // Guarda el plato y lo agrega al listado.
  async function guardarPlato(event) {
    event.preventDefault();
    setError('');
    setMensaje('');

    const name = plato.name.trim();
    const description = plato.description.trim();
    const categoria = categorias.find((actual) => actual._id === plato.category);
    if (!name || !description || !categoria) {
      setError('Completá el nombre, la descripción y la categoría.');
      return;
    }

    setGuardando(true);
    try {
      const creado = await crearPlato(token, {
        ...plato, name, description, price: Number(plato.price)
      });
      setPlatos((actuales) => [...actuales, { ...creado, category: categoria }]);
      setPlato(platoInicial);
      setMensaje('Plato creado.');
    } catch (error) {
      setError(error.message);
    } finally {
      setGuardando(false);
    }
  }

  return (
    <>
      {platos.length === 0 ? <p>Todavía no hay platos.</p> : (
        <ul>
          {platos.map((plato) => (
            <li key={plato._id}>
              <PlatoCard
                nombre={plato.name}
                descripcion={plato.description}
                categoria={plato.category?.name ?? 'Sin categoría'}
                precio={plato.price}
              />
              <p>{plato.available ? 'Disponible' : 'No disponible'}</p>
            </li>
          ))}
        </ul>
      )}
      <h3>Nuevo plato</h3>
      <form onSubmit={guardarPlato}>
        <fieldset disabled={guardando}>
          <p>
            <label htmlFor="nombre-nuevo-plato">Nombre</label>{' '}
            <input id="nombre-nuevo-plato" name="name" value={plato.name} onChange={handleChange} required />
          </p>
          <p>
            <label htmlFor="descripcion-nuevo-plato">Descripción</label>{' '}
            <textarea id="descripcion-nuevo-plato" name="description"
              value={plato.description} onChange={handleChange} required />
          </p>
          <p>
            <label htmlFor="precio-nuevo-plato">Precio</label>{' '}
            <input id="precio-nuevo-plato" name="price" type="number" min="0.01" step="any"
              value={plato.price} onChange={handleChange} required />
          </p>
          <p>
            <label htmlFor="categoria-nuevo-plato">Categoría</label>{' '}
            <select id="categoria-nuevo-plato" name="category"
              value={plato.category} onChange={handleChange} required>
              <option value="">Elegí una categoría</option>
              {categorias.map((categoria) => (
                <option key={categoria._id} value={categoria._id}>{categoria.name}</option>
              ))}
            </select>
          </p>
          <p>
            <label>
              <input type="checkbox" name="available" checked={plato.available} onChange={handleChange} />{' '}
              Disponible
            </label>
          </p>
          <button type="submit" disabled={categorias.length === 0}>
            {guardando ? 'Guardando...' : 'Crear plato'}
          </button>
        </fieldset>
      </form>
      {error && <p role="alert">{error}</p>}
      {mensaje && <p role="status">{mensaje}</p>}
    </>
  );
}

import { useState } from 'react';
import PlatoCard from './PlatoCard.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { borrarPlato, crearPlato, editarPlato } from '../services/api.js';

const platoInicial = { name: '', description: '', price: '', category: '', available: true };

export default function ListaPlatos({ platos, setPlatos, categorias }) {
  const { token } = useAuth();
  const [plato, setPlato] = useState(platoInicial);
  const [idEnEdicion, setIdEnEdicion] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [idBorrando, setIdBorrando] = useState(null);
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');
  const ocupado = guardando || idBorrando !== null;

  // Actualiza el campo que se está editando.
  function handleChange(event) {
    const { name, value, type, checked } = event.target;
    setPlato({ ...plato, [name]: type === 'checkbox' ? checked : value });
  }

  // Carga los datos del plato seleccionado.
  function iniciarEdicion(seleccionado) {
    setIdEnEdicion(seleccionado._id);
    setPlato({
      name: seleccionado.name,
      description: seleccionado.description,
      price: String(seleccionado.price),
      category: seleccionado.category?._id ?? '',
      available: Boolean(seleccionado.available)
    });
    setError('');
    setMensaje('');
  }

  // Limpia el formulario y vuelve al alta.
  function limpiarFormulario() {
    setIdEnEdicion(null);
    setPlato(platoInicial);
    setError('');
    setMensaje('');
  }

  // Guarda el plato y actualiza el listado.
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
      const datos = {
        ...plato, name, description, price: Number(plato.price)
      };
      if (idEnEdicion) {
        const actualizado = await editarPlato(token, idEnEdicion, datos);
        setPlatos((actuales) => actuales.map((actual) =>
          actual._id === idEnEdicion ? actualizado : actual
        ));
      } else {
        const creado = await crearPlato(token, datos);
        setPlatos((actuales) => [...actuales, { ...creado, category: categoria }]);
      }
      limpiarFormulario();
      setMensaje(idEnEdicion ? 'Plato actualizado.' : 'Plato creado.');
    } catch (error) {
      setError(error.message);
    } finally {
      setGuardando(false);
    }
  }

  // Confirma el borrado y quita el plato del listado.
  async function eliminarPlato(seleccionado) {
    if (!window.confirm(`¿Borrar el plato «${seleccionado.name}»?`)) return;

    setError('');
    setMensaje('');
    setIdBorrando(seleccionado._id);

    try {
      await borrarPlato(token, seleccionado._id);
      setPlatos((actuales) => actuales.filter((actual) => actual._id !== seleccionado._id));
      if (idEnEdicion === seleccionado._id) limpiarFormulario();
      setMensaje('Plato eliminado.');
    } catch (error) {
      setError(error.message);
    } finally {
      setIdBorrando(null);
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
              <button type="button" disabled={ocupado} onClick={() => iniciarEdicion(plato)}>
                Editar
              </button>
              <button type="button" disabled={ocupado} onClick={() => eliminarPlato(plato)}>
                {idBorrando === plato._id ? 'Borrando...' : 'Borrar'}
              </button>
            </li>
          ))}
        </ul>
      )}
      <h3>{idEnEdicion ? 'Editar plato' : 'Nuevo plato'}</h3>
      <form onSubmit={guardarPlato}>
        <fieldset disabled={ocupado}>
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
            {guardando ? 'Guardando...' : idEnEdicion ? 'Guardar cambios' : 'Crear plato'}
          </button>
          {idEnEdicion && <button type="button" onClick={limpiarFormulario}>Cancelar</button>}
        </fieldset>
      </form>
      {error && <p role="alert">{error}</p>}
      {mensaje && <p role="status">{mensaje}</p>}
    </>
  );
}

import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { crearCategoria, editarCategoria } from '../services/api.js';

export default function ListaCategorias({ categorias, setCategorias }) {
  const { token } = useAuth();
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [idEnEdicion, setIdEnEdicion] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');

  // Carga la categoría seleccionada en el formulario.
  function iniciarEdicion(categoria) {
    setIdEnEdicion(categoria._id);
    setNombre(categoria.name);
    setDescripcion(categoria.description ?? '');
    setError('');
    setMensaje('');
  }

  // Limpia el formulario y vuelve al modo de creación.
  function limpiarFormulario() {
    setIdEnEdicion(null);
    setNombre('');
    setDescripcion('');
    setError('');
    setMensaje('');
  }

  // Guarda la categoría y actualiza el listado.
  async function guardarCategoria(event) {
    event.preventDefault();
    setError('');
    setMensaje('');

    if (!nombre.trim()) {
      setError('Ingresá el nombre de la categoría.');
      return;
    }

    setGuardando(true);
    try {
      const datos = {
        name: nombre.trim(),
        description: descripcion.trim()
      };

      if (idEnEdicion) {
        const actualizada = await editarCategoria(token, idEnEdicion, datos);
        setCategorias((actuales) => actuales.map((categoria) =>
          categoria._id === idEnEdicion ? actualizada : categoria
        ));
      } else {
        const creada = await crearCategoria(token, datos);
        setCategorias((actuales) => [...actuales, creada]);
      }

      limpiarFormulario();
      setMensaje(idEnEdicion ? 'Categoría actualizada.' : 'Categoría creada.');
    } catch (error) {
      setError(error.message);
    } finally {
      setGuardando(false);
    }
  }

  return (
    <>
      {categorias.length === 0 ? <p>Todavía no hay categorías.</p> : (
        <ul>
          {categorias.map((categoria) => (
            <li key={categoria._id}>
              <strong>{categoria.name}</strong>
              {categoria.description && <p>{categoria.description}</p>}
              <button type="button" disabled={guardando} onClick={() => iniciarEdicion(categoria)}>
                Editar
              </button>
            </li>
          ))}
        </ul>
      )}
      <h3>{idEnEdicion ? 'Editar categoría' : 'Nueva categoría'}</h3>
      <form onSubmit={guardarCategoria}>
        <fieldset disabled={guardando}>
          <p>
            <label htmlFor="nombre-categoria">Nombre</label>{' '}
            <input id="nombre-categoria" value={nombre}
              onChange={(event) => setNombre(event.target.value)} required />
          </p>
          <p>
            <label htmlFor="descripcion-categoria">Descripción</label>{' '}
            <textarea id="descripcion-categoria" value={descripcion}
              onChange={(event) => setDescripcion(event.target.value)} />
          </p>
          <button type="submit">
            {guardando ? 'Guardando...' : idEnEdicion ? 'Guardar cambios' : 'Crear categoría'}
          </button>
          {idEnEdicion && <button type="button" onClick={limpiarFormulario}>Cancelar</button>}
        </fieldset>
      </form>
      {error && <p role="alert">{error}</p>}
      {mensaje && <p role="status">{mensaje}</p>}
    </>
  );
}

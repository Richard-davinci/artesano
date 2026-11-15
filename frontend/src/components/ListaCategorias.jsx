import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { crearCategoria } from '../services/api.js';

export default function ListaCategorias({ categorias, setCategorias }) {
  const { token } = useAuth();
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');

  // Guarda la categoría y la agrega al listado.
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
      const categoria = await crearCategoria(token, {
        name: nombre.trim(),
        description: descripcion.trim()
      });
      setCategorias((actuales) => [...actuales, categoria]);
      setNombre('');
      setDescripcion('');
      setMensaje('Categoría creada.');
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
            </li>
          ))}
        </ul>
      )}
      <h3>Nueva categoría</h3>
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
          <button type="submit">{guardando ? 'Guardando...' : 'Crear categoría'}</button>
        </fieldset>
      </form>
      {error && <p role="alert">{error}</p>}
      {mensaje && <p role="status">{mensaje}</p>}
    </>
  );
}

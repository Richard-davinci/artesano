import { useRef, useState } from 'react';
import IconoAccion from './IconoAccion.jsx';
import ConfirmarBorrado from './ConfirmarBorrado.jsx';
import PanelLateral from './PanelLateral.jsx';
import ListaPaginada from './ListaPaginada.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { apiUrl, borrarPlato, crearPlato, editarPlato, subirFotoPlato } from '../services/api.js';

const platoInicial = { name: '', description: '', price: '', category: '', available: true };
const precioCarta = new Intl.NumberFormat('es-AR', {
  style: 'currency', currency: 'ARS', maximumFractionDigits: 0
});

const errorFormatoFoto = 'Elegí una foto JPEG, PNG o WebP de hasta 2 MiB.';

function fotoValida(archivo) {
  return ['image/jpeg', 'image/png', 'image/webp'].includes(archivo.type) && archivo.size <= 2 * 1024 * 1024;
}

export default function ListaPlatos({ platos, setPlatos, categorias }) {
  const { token } = useAuth();
  const campoNombre = useRef(null);
  const panel = useRef(null);
  const formularioFoto = useRef(null);
  const [nombreFoto, setNombreFoto] = useState('');
  const [plato, setPlato] = useState(platoInicial);
  const [idEnEdicion, setIdEnEdicion] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [idBorrando, setIdBorrando] = useState(null);
  const [pendienteBorrado, setPendienteBorrado] = useState(null);
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [mensajeFoto, setMensajeFoto] = useState('');
  const [avisoBorrado, setAvisoBorrado] = useState(null);
  const ocupado = guardando || idBorrando !== null;
  const platoEnEdicion = platos.find((actual) => actual._id === idEnEdicion);
  const fotoActual = platoEnEdicion?.image ? `${apiUrl}${platoEnEdicion.image}` : null;

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
    setAvisoBorrado(null);
    abrirPanel();
  }

  function abrirPanel() {
    formularioFoto.current?.reset();
    setNombreFoto('');
    setMensajeFoto('');
    panel.current.showModal();
    campoNombre.current.focus();
  }

  // Limpia el formulario y vuelve al alta.
  function limpiarFormulario() {
    setAvisoBorrado(null);
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
    const archivo = formularioFoto.current?.elements.foto.files[0];
    if (!idEnEdicion && archivo && !fotoValida(archivo)) {
      setError(errorFormatoFoto);
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
        if (archivo) {
          try {
            const { image } = await subirFotoPlato(token, creado._id, archivo);
            setPlatos((actuales) => actuales.map((actual) =>
              actual._id === creado._id ? { ...actual, image } : actual
            ));
          } catch (error) {
            setIdEnEdicion(creado._id);
            setError(`El plato se creó, pero no se pudo subir la foto. ${error.message}`);
            return;
          }
        }
      }
      panel.current.close();
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
    setError('');
    setMensaje('');
    setAvisoBorrado(null);
    setIdBorrando(seleccionado._id);

    try {
      await borrarPlato(token, seleccionado._id);
      setPlatos((actuales) => actuales.filter((actual) => actual._id !== seleccionado._id));
      if (idEnEdicion === seleccionado._id) limpiarFormulario();
      setAvisoBorrado({ mensaje: 'Plato eliminado.' });
    } catch (error) {
      setAvisoBorrado({ error: error.message });
    } finally {
      setIdBorrando(null);
    }
  }

  // Actualiza la foto sin modificar los otros datos del plato.
  async function guardarFoto(event) {
    event.preventDefault();
    const formulario = event.currentTarget;
    const archivo = formulario.elements.foto.files[0];
    if (!archivo || !idEnEdicion) return;

    setError('');
    setMensajeFoto('');
    if (!fotoValida(archivo)) {
      setError(errorFormatoFoto);
      return;
    }

    setGuardando(true);
    try {
      const { image } = await subirFotoPlato(token, idEnEdicion, archivo);
      setPlatos((actuales) => actuales.map((actual) =>
        actual._id === idEnEdicion ? { ...actual, image } : actual
      ));
      formulario.reset();
      setNombreFoto('');
      setMensajeFoto('Foto del plato actualizada.');
    } catch (error) {
      setError(error.message);
    } finally {
      setGuardando(false);
    }
  }

  return (
    <>
      {pendienteBorrado && (
        <ConfirmarBorrado tipo="plato" nombre={pendienteBorrado.name}
          onCancelar={() => setPendienteBorrado(null)}
          onConfirmar={() => {
            setPendienteBorrado(null);
            eliminarPlato(pendienteBorrado);
          }} />
      )}
      <div className="admin-toolbar">
        <h2 id="titulo-platos">Platos</h2>
        <button className="boton-nuevo-admin" type="button" aria-haspopup="dialog" disabled={ocupado} onClick={() => {
          limpiarFormulario();
          abrirPanel();
        }}>Nuevo plato</button>
      </div>
      <PanelLateral panelRef={panel} tituloId="titulo-form-plato"
        titulo={idEnEdicion ? 'Editar plato' : 'Nuevo plato'} guardando={guardando}
        acciones={
          <>
            <button type="button" disabled={ocupado} onClick={() => panel.current.close()}>Cancelar</button>
            <button type="submit" form="form-datos-plato" disabled={ocupado || categorias.length === 0}>
              {guardando ? 'Guardando...' : idEnEdicion ? 'Guardar cambios' : 'Crear plato'}
            </button>
          </>
        }>
        <form id="form-datos-plato" onSubmit={guardarPlato}>
          <fieldset disabled={ocupado}>
            <p>
              <label htmlFor="nombre-nuevo-plato">Nombre</label>{' '}
              <input id="nombre-nuevo-plato" ref={campoNombre} name="name" value={plato.name} onChange={handleChange} required />
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
            <div className="disponibilidad-plato">
              <label htmlFor="disponibilidad-plato">
                <strong>Disponible en la carta</strong>
                <span>{plato.available ? 'Marcado como disponible' : 'Marcado como no disponible'}</span>
              </label>
              <input id="disponibilidad-plato" type="checkbox" name="available" checked={plato.available} onChange={handleChange} />
            </div>
          </fieldset>
        </form>
          <form className="form-foto-plato" ref={formularioFoto} onSubmit={guardarFoto}>
            <fieldset disabled={ocupado}>
              <legend>Foto del plato (opcional)</legend>
              <div className="foto-plato-controles">
                {fotoActual && <img className="miniatura-plato" src={fotoActual} alt="Foto actual del plato" />}
                <div className="admin-file-picker selector-foto-plato">
                <input id="foto-plato" name="foto" type="file" accept="image/jpeg,image/png,image/webp"
                  aria-describedby="ayuda-foto-plato" required
                  onChange={(event) => setNombreFoto(event.target.files[0]?.name || '')} />
                <label className="admin-file-label" htmlFor="foto-plato">Elegir foto</label>
                  {nombreFoto && <span className="admin-file-name">{nombreFoto}</span>}
                  <p id="ayuda-foto-plato">JPEG, PNG o WebP · Hasta 2 MiB</p>
                </div>
              </div>
              {idEnEdicion && nombreFoto && <button className="boton-foto-secundario" type="submit">
                {fotoActual ? 'Reemplazar foto' : 'Subir foto'}
              </button>}
            </fieldset>
          </form>
        {mensajeFoto && <p role="status">{mensajeFoto}</p>}
        {error && <p role="alert">{error}</p>}
      </PanelLateral>
      {mensaje && <p role="status">{mensaje}</p>}
      {avisoBorrado?.error && <p className="aviso-borrado" role="alert">{avisoBorrado.error}</p>}
      {avisoBorrado?.mensaje && <p className="aviso-borrado" role="status">{avisoBorrado.mensaje}</p>}
      {platos.length === 0 ? <p>Todavía no hay platos.</p> : (
        <ListaPaginada elementos={platos} etiqueta="Páginas de platos">
          {(filas) => (
        <table className="tabla-admin" aria-label="Listado de platos">
          <thead>
            <tr>
              <th scope="col">Plato</th>
              <th scope="col" className="columna-detalle">Categoría</th>
              <th scope="col" className="columna-detalle">Precio</th>
              <th scope="col" className="columna-detalle">Disponibilidad</th>
              <th scope="col">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filas.map((plato) => {
              const categoria = plato.category?.name ?? 'Sin categoría';
              const precio = precioCarta.format(plato.price);
              const disponibilidad = plato.available ? 'Disponible' : 'No disponible';
              return (
                <tr key={plato._id}>
                  <th scope="row">
                    {plato.name}
                    <span className="detalle-compacto">{categoria} · {precio} · {disponibilidad}</span>
                  </th>
                  <td className="columna-detalle">{categoria}</td>
                  <td className="columna-detalle">{precio}</td>
                  <td className="columna-detalle">{disponibilidad}</td>
                  <td>
                    <div className="acciones-tabla">
                      <button type="button" aria-label={`Editar ${plato.name}`} disabled={ocupado} onClick={() => iniciarEdicion(plato)}>
                        <IconoAccion tipo="editar" />
                      </button>
                      <button type="button" aria-haspopup="dialog" aria-label={`Borrar ${plato.name}`} disabled={ocupado} onClick={() => setPendienteBorrado(plato)}>
                        {idBorrando === plato._id ? '…' : <IconoAccion tipo="borrar" />}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
          )}
        </ListaPaginada>
      )}
    </>
  );
}

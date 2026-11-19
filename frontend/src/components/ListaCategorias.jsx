import useErroresCampos from '../components/useErroresCampos.js';
import ErrorCampo from '../components/ErrorCampo.jsx';
import { useRef, useState } from 'react';
import IconoAccion from './IconoAccion.jsx';
import ConfirmarBorrado from './ConfirmarBorrado.jsx';
import PanelLateral from './PanelLateral.jsx';
import ListaPaginada from './ListaPaginada.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { apiUrl, borrarCategoria, crearCategoria, editarCategoria, subirFotoCategoria } from '../services/api.js';

export default function ListaCategorias({ categorias, setCategorias }) {
  const { errores, setErrorCampo, limpiarErrores, atributosCampo, eventosFormulario } = useErroresCampos();
  const { token } = useAuth();
  const [busqueda, setBusqueda] = useState('');

  const campoNombre = useRef(null);
  const campoFoto = useRef(null);
  const panel = useRef(null);
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [idEnEdicion, setIdEnEdicion] = useState(null);
  const [archivoFoto, setArchivoFoto] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [idBorrando, setIdBorrando] = useState(null);
  const [pendienteBorrado, setPendienteBorrado] = useState(null);
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [avisoBorrado, setAvisoBorrado] = useState(null);
  const ocupado = guardando || idBorrando !== null;
  const imagenActual = categorias.find((categoria) => categoria._id === idEnEdicion)?.image;

  // Carga la categoría seleccionada en el formulario.
  function iniciarEdicion(categoria) {
    setIdEnEdicion(categoria._id);
    setNombre(categoria.name);
    setDescripcion(categoria.description ?? '');
    setError('');
    limpiarErrores();
    setMensaje('');
    setAvisoBorrado(null);
    abrirPanel();
  }

  function abrirPanel() {
    campoFoto.current.value = '';
    setArchivoFoto(null);
    panel.current.showModal();
    campoNombre.current.focus();
  }

  // Limpia el formulario y vuelve al modo de creación.
  function limpiarFormulario() {
    setAvisoBorrado(null);
    setIdEnEdicion(null);
    setNombre('');
    setDescripcion('');
    setError('');
    limpiarErrores();
    setMensaje('');
  }

  // Guarda la categoría y actualiza el listado.
  async function guardarCategoria(event) {
    event.preventDefault();
    setError('');
    limpiarErrores();
    setMensaje('');

    const nombreLimpio = nombre.trim();
    const descripcionLimpia = descripcion.trim();
    if (!nombreLimpio) {
      setErrorCampo('nombre-categoria', 'Ingresá el nombre de la categoría.');
      return;
    }
    if (nombreLimpio.length < 3 || nombreLimpio.length > 60) {
      setErrorCampo('nombre-categoria', 'El nombre de la categoría debe tener entre 3 y 60 caracteres.');
      return;
    }
    if (descripcionLimpia.length > 300) {
      setErrorCampo('descripcion-categoria', 'La descripción de la categoría no puede superar los 300 caracteres.');
      return;
    }
    if (archivoFoto && (!['image/jpeg', 'image/png', 'image/webp'].includes(archivoFoto.type) ||
        archivoFoto.size > 4 * 1024 * 1024)) {
      setErrorCampo('foto-categoria', 'Elegí una imagen JPEG, PNG o WebP de hasta 4 MiB.');
      return;
    }

    setGuardando(true);
    try {
      const datos = {
        name: nombreLimpio,
        description: descripcionLimpia
      };

      const categoriaGuardada = idEnEdicion
        ? await editarCategoria(token, idEnEdicion, datos)
        : await crearCategoria(token, datos);

      if (idEnEdicion) {
        setCategorias((actuales) => actuales.map((categoria) =>
          categoria._id === idEnEdicion ? categoriaGuardada : categoria
        ));
      } else {
        setCategorias((actuales) => [...actuales, categoriaGuardada]);
      }

      if (archivoFoto) {
        try {
          const { image } = await subirFotoCategoria(token, categoriaGuardada._id, archivoFoto);
          setCategorias((actuales) => actuales.map((categoria) =>
            categoria._id === categoriaGuardada._id ? { ...categoria, image } : categoria
          ));
        } catch (error) {
          setIdEnEdicion(categoriaGuardada._id);
          setError(`Los datos se guardaron, pero la foto no se pudo subir. ${error.message}`);
          return;
        }
      }

      panel.current.close();
      limpiarFormulario();
      setMensaje(idEnEdicion ? 'Categoría actualizada.' : 'Categoría creada.');
    } catch (error) {
      setError(error.message);
    } finally {
      setGuardando(false);
    }
  }

  // Pide confirmación y quita la categoría tras el borrado.
  async function eliminarCategoria(categoria) {
    setError('');
    limpiarErrores();
    setMensaje('');
    setAvisoBorrado(null);
    setIdBorrando(categoria._id);

    try {
      await borrarCategoria(token, categoria._id);
      setCategorias((actuales) => actuales.filter((actual) => actual._id !== categoria._id));
      if (idEnEdicion === categoria._id) limpiarFormulario();
      setAvisoBorrado({ mensaje: 'Categoría eliminada.' });
    } catch (error) {
      setAvisoBorrado({ error: error.message });
    } finally {
      setIdBorrando(null);
    }
  }

  // Busca por nombre antes de dividir el listado en páginas.
  const resultados = categorias.filter((actual) =>
    actual.name.toLocaleLowerCase('es').includes(busqueda.trim().toLocaleLowerCase('es'))
  );

  return (
    <>
      {pendienteBorrado && (
        <ConfirmarBorrado tipo="categoría" nombre={pendienteBorrado.name}
          onCancelar={() => setPendienteBorrado(null)}
          onConfirmar={() => {
            setPendienteBorrado(null);
            eliminarCategoria(pendienteBorrado);
          }} />
      )}
      <div className="admin-toolbar">
        <h2 id="titulo-categorias">Categorías</h2>
        <button className="boton-nuevo-admin" type="button" aria-haspopup="dialog" disabled={ocupado} onClick={() => {
          limpiarFormulario();
          abrirPanel();
        }}>Nueva categoría</button>
      </div>
      <div className="admin-filters" aria-label="Filtros de categorias">
        <div>
          <label htmlFor="buscar-categorias-admin">Buscar categoría</label>
          <input id="buscar-categorias-admin" type="search" value={busqueda}
            placeholder="Buscar por nombre" onChange={(event) => setBusqueda(event.target.value)} />
        </div>
        <button type="button" disabled={!busqueda}
          onClick={() => { setBusqueda(''); }}>
          Limpiar filtros
        </button>
      </div>
      <p className="admin-results" role="status">
        {resultados.length} de {categorias.length} categorías
      </p>
      <PanelLateral panelRef={panel} tituloId="titulo-form-categoria"
        titulo={idEnEdicion ? 'Editar categoría' : 'Nueva categoría'} guardando={guardando}
        acciones={
          <>
            <button type="button" disabled={ocupado} onClick={() => panel.current.close()}>Cancelar</button>
            <button type="submit" form="form-datos-categoria" disabled={ocupado}>
              {guardando ? 'Guardando...' : idEnEdicion ? 'Guardar cambios' : 'Crear categoría'}
            </button>
          </>
        }>
        <form {...eventosFormulario} id="form-datos-categoria" onSubmit={guardarCategoria}>
          <fieldset disabled={ocupado}>
            <p>
              <label htmlFor="nombre-categoria">Nombre</label>{' '}
              <input id="nombre-categoria" {...atributosCampo('nombre-categoria')} ref={campoNombre} value={nombre}
                onChange={(event) => setNombre(event.target.value)} required />
            <ErrorCampo id="nombre-categoria" mensaje={errores['nombre-categoria']} />
            </p>
            <p>
              <label htmlFor="descripcion-categoria">Descripción</label>{' '}
              <textarea id="descripcion-categoria" {...atributosCampo('descripcion-categoria')} value={descripcion}
                onChange={(event) => setDescripcion(event.target.value)} />
            <ErrorCampo id="descripcion-categoria" mensaje={errores['descripcion-categoria']} />
            </p>
            <div className="form-foto-plato">
              {imagenActual && <img className="miniatura-plato" src={`${apiUrl}${imagenActual}`} alt="Foto actual de la categoría" />}
              <div className="admin-file-picker selector-foto-plato">
                <input ref={campoFoto} id="foto-categoria" {...atributosCampo('foto-categoria', 'ayuda-foto-categoria')} type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => setArchivoFoto(event.target.files[0] || null)} />
                <label className="admin-file-label" htmlFor="foto-categoria">
                  {imagenActual ? 'Elegir otra foto' : 'Elegir foto de categoría'}
                </label>
            <ErrorCampo id="foto-categoria" mensaje={errores['foto-categoria']} />
                {archivoFoto && <span className="admin-file-name">{archivoFoto.name}</span>}
                <p id="ayuda-foto-categoria">Opcional · JPEG, PNG o WebP · Hasta 4 MiB</p>
              </div>
            </div>
          </fieldset>
        </form>
        {error && <p role="alert">{error}</p>}
      </PanelLateral>
      {mensaje && <p role="status">{mensaje}</p>}
      {avisoBorrado?.error && <p className="aviso-borrado" role="alert">{avisoBorrado.error}</p>}
      {avisoBorrado?.mensaje && <p className="aviso-borrado" role="status">{avisoBorrado.mensaje}</p>}
      {categorias.length === 0 ? <p>Todavía no hay categorías.</p> : resultados.length === 0 ? <p>No se encontraron categorías con esos filtros.</p> : (
        <ListaPaginada key={busqueda} elementos={resultados} etiqueta="Páginas de categorías">
          {(filas) => (
        <table className="tabla-admin" aria-label="Listado de categorías">
          <thead>
            <tr>
              <th scope="col">Categoría</th>
              <th scope="col" className="columna-detalle">Descripción</th>
              <th scope="col">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filas.map((categoria) => (
              <tr key={categoria._id}>
                <th scope="row">
                  <div className="admin-item">
                    {categoria.image
                      ? <img className="admin-thumbnail" src={apiUrl + categoria.image} alt="" width="48" height="48" loading="lazy" />
                      : <span className="admin-thumbnail admin-thumbnail-empty">Sin foto</span>}
                    <div>
                      {categoria.name}
                      {categoria.description && <span className="detalle-compacto">{categoria.description}</span>}
                    </div>
                  </div>
                </th>
                <td className="columna-detalle">{categoria.description || '—'}</td>
                <td>
                  <div className="acciones-tabla">
                    <button type="button" aria-label={`Editar ${categoria.name}`} disabled={ocupado} onClick={() => iniciarEdicion(categoria)}>
                      <IconoAccion tipo="editar" />
                    </button>
                    <button type="button" aria-haspopup="dialog" aria-label={`Borrar ${categoria.name}`} disabled={ocupado} onClick={() => setPendienteBorrado(categoria)}>
                      {idBorrando === categoria._id ? '…' : <IconoAccion tipo="borrar" />}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
          )}
        </ListaPaginada>
      )}
    </>
  );
}

import useErroresCampos from '../components/useErroresCampos.js';
import ErrorCampo from '../components/ErrorCampo.jsx';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { apiUrl, obtenerPerfil, subirFotoPerfil } from '../services/api.js';

export default function Perfil() {
  const { errores, setErrorCampo, limpiarErrores, atributosCampo, eventosFormulario } = useErroresCampos();
  const { token, user, logout } = useAuth();
  const [perfil, setPerfil] = useState(null);
  const [archivo, setArchivo] = useState(null);
  const [preview, setPreview] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [subiendo, setSubiendo] = useState(false);
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');

  useEffect(() => {
    let activo = true;

    async function cargarPerfil() {
      try {
        const datos = await obtenerPerfil(token);
        if (activo) setPerfil(datos);
      } catch (error) {
        if (activo) setError(error.message);
      } finally {
        if (activo) setCargando(false);
      }
    }

    cargarPerfil();
    return () => {
      activo = false;
    };
  }, [token]);

  useEffect(() => {
    if (preview) return () => URL.revokeObjectURL(preview);
  }, [preview]);

  const imagenActual = preview || (perfil?.profileImage ? `${apiUrl}${perfil.profileImage}` : null);

  const nombre = perfil?.name || user.name || 'Usuario';
  const iniciales = nombre.trim().split(/\s+/).slice(0, 2).map((parte) => parte[0]).join('').toUpperCase();

  // Valida y muestra una vista previa de la foto elegida.
  function seleccionarImagen(evento) {
    const foto = evento.target.files[0];
    setArchivo(null);
    setPreview(null);
    setError('');
    limpiarErrores();
    setMensaje('');
    if (!foto) return;

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(foto.type)) {
      setErrorCampo('profileImage', 'Elegí una imagen JPEG, PNG o WebP.');
      evento.target.value = '';
      return;
    }
    if (foto.size > 2 * 1024 * 1024) {
      setErrorCampo('profileImage', 'La imagen no puede superar los 2 MiB.');
      evento.target.value = '';
      return;
    }

    setArchivo(foto);
    setPreview(URL.createObjectURL(foto));
  }

  // Guarda la foto y actualiza el perfil.
  async function guardarImagen(evento) {
    evento.preventDefault();
    if (!archivo) return;

    const formulario = evento.currentTarget;
    setSubiendo(true);
    setError('');
    limpiarErrores();
    setMensaje('');

    try {
      setPerfil(await subirFotoPerfil(token, archivo));
      formulario.reset();
      setArchivo(null);
      setPreview(null);
      setMensaje('Foto de perfil actualizada.');
    } catch (error) {
      setError(error.message);
    } finally {
      setSubiendo(false);
    }
  }

  return (
    <main className="container perfil">
      <header className="perfil-header">
        <h1>Mi perfil<span className="acento">.</span></h1>
        <button className="perfil-salir" type="button" onClick={logout}>Cerrar sesión</button>
      </header>
      <div className="perfil-grid">
        <section className="perfil-card perfil-imagen" aria-labelledby="titulo-foto">
          <h2 id="titulo-foto">Foto de perfil</h2>
          <div className="perfil-avatar">
            {imagenActual
              ? <img className="foto-perfil" src={imagenActual} alt={preview ? 'Vista previa de la foto' : 'Foto de perfil'} />
              : <span aria-hidden="true">{iniciales}</span>}
          </div>
          {perfil && (
            <form {...eventosFormulario} onSubmit={guardarImagen}>
              <div className="perfil-selector">
                <input id="profileImage" {...atributosCampo('profileImage', 'ayuda-foto archivo-foto')} type="file" accept="image/jpeg,image/png,image/webp" onChange={seleccionarImagen} disabled={subiendo} />
                <label className="perfil-upload-label" htmlFor="profileImage">
                  {archivo ? 'Elegir otra foto' : 'Elegir foto'}
                </label>
            <ErrorCampo id="profileImage" mensaje={errores['profileImage']} />
              </div>
              <p id="ayuda-foto" className="perfil-ayuda">JPEG, PNG o WebP · Hasta 2 MiB</p>
              <p id="archivo-foto" className="perfil-archivo" hidden={!archivo}>{archivo?.name}</p>
              {archivo && (
                <button type="submit" disabled={subiendo}>
                  {subiendo ? 'Guardando...' : 'Guardar foto'}
                </button>
              )}
            </form>
          )}
          {error && <p role="alert">{error}</p>}
          {mensaje && <p role="status">{mensaje}</p>}
        </section>
        <section className="perfil-card" aria-labelledby="titulo-cuenta">
          <h2 id="titulo-cuenta">Datos de la cuenta</h2>
          {cargando && <p className="perfil-ayuda" role="status">Cargando perfil...</p>}
          <dl className="perfil-datos">
            <div><dt>Nombre</dt><dd>{nombre}</dd></div>
            {perfil && <div><dt>Correo electrónico</dt><dd>{perfil.email}</dd></div>}
            <div><dt>Rol</dt><dd><span className="perfil-rol">{user.role === 'admin' ? 'Administrador' : 'Usuario'}</span></dd></div>
          </dl>
        </section>
      </div>
    </main>
  );
}

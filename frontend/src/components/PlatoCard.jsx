const formatoPrecio = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  maximumFractionDigits: 0
});

export default function PlatoCard({ nombre, descripcion, categoria, precio, foto, fotoCategoria }) {
  return (
    <article className="plato">
      {/* Prioriza la foto del plato y usa la de su categoría si falta. */}
      {(foto || fotoCategoria) && (
        <div className="foto-carta">
          <img src={foto || fotoCategoria} alt={foto ? nombre : ''} loading="lazy" />
          {!foto && <span>Foto no disponible</span>}
        </div>
      )}
      <div className="contenido-plato">
        <p className="categoria">{categoria}</p>
        <h2>{nombre}</h2>
        <p className="descripcion">{descripcion}</p>
        <p className="precio">{formatoPrecio.format(precio)}</p>
      </div>
    </article>
  );
}

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PlatoCard from '../components/PlatoCard.jsx';
import { apiUrl, obtenerPlatos } from '../services/api.js';

// Usa las fotos devueltas por la API.
function fotoPlato(plato) {
  return plato.image ? apiUrl + plato.image : null;
}

function fotoCategoria(plato) {
  return plato.category?.image ? apiUrl + plato.category.image : null;
}

function PlatosDestacados({ platos }) {
  return (
    <div className="lista-platos">
      {platos.map((plato) => (
        <PlatoCard key={plato._id} nombre={plato.name} descripcion={plato.description}
          categoria={plato.category?.name ?? 'Sin categoría'} precio={plato.price}
          foto={fotoPlato(plato)} fotoCategoria={fotoCategoria(plato)} />
      ))}
    </div>
  );
}
const destacados = ['Ñoquis de la casa', 'Pizza Arte-Sano', 'Arte-Nesa XXL'];
const fotosPortada = ['/diseno/carta-noquis.png', '/diseno/carta-pizza.png', '/diseno/carta-milanesa.png'];

function usePlatosPublicos() {
  const [platos, setPlatos] = useState([]);
  const [estado, setEstado] = useState('Cargando platos...');

  useEffect(() => {
    const controller = new AbortController();
    obtenerPlatos(controller.signal).then((resultado) => {
      setPlatos(resultado);
      setEstado('');
    }).catch(() => {
      if (!controller.signal.aborted) setEstado('No pudimos cargar los platos.');
    });
    return () => controller.abort();
  }, []);

  return { platos, estado };
}

export function Inicio() {
  const [destacado, setDestacado] = useState(0);
  const { platos, estado } = usePlatosPublicos();
  const seleccion = destacados.map((nombre) => platos.find((plato) => plato.name === nombre));
  const platosDeLaCasa = seleccion.filter(Boolean);
  const enlaceDestacado = '/carta';
  const platoDestacado = seleccion[destacado];
  const respaldoDestacado = platoDestacado && !fotoPlato(platoDestacado) && fotoCategoria(platoDestacado);
  const fotoDestacada = platoDestacado
    ? fotoPlato(platoDestacado) || fotoCategoria(platoDestacado)
    : fotosPortada[destacado];

  return (
    <main className="public-page">
      <section className="portada">
        <div className="container hero">
          <div>
            <p className="ceja">Bodegón · Cocina de verdad</p>
            <h1><span className="hero-title-line">Hay sabores</span><span className="hero-title-line">que te hacen</span><span className="hero-title-line hero-title-accent">sentir en casa.</span></h1>
            <p className="intro">Platos abundantes, recetas de familia y una mesa que siempre te espera. Bienvenido a Arte-Sano.</p>
            <div className="acciones"><Link className="boton-acento" to="/carta">Descubrí la carta</Link><Link to="/nosotros">Nuestra historia</Link></div>
            <p className="ubicacion">Frente a la plaza. Lejos de lo de siempre.</p>
          </div>
          <div>
            <figure className="foto-hero">
              {fotoDestacada && <img src={fotoDestacada} alt={destacados[destacado]} />}
              {respaldoDestacado && <span className="foto-ilustrativa foto-ilustrativa-portada">Foto no disponible</span>}

              <figcaption><strong>{destacados[destacado]}</strong><Link className="boton-acento" to={enlaceDestacado} aria-label="Explorar la carta">→</Link></figcaption>
            </figure>
            <div className="paginacion-hero">
              {destacados.map((nombre, indice) => <button type="button" key={nombre} aria-label={nombre} aria-pressed={indice === destacado} onClick={() => setDestacado(indice)} />)}

            </div>
          </div>
        </div>
      </section>
      <div className="franja"><div className="container"><span>Cocina artesanal</span><span>Porciones para compartir</span><span>Cerveza tirada</span><span>Desde 2020, en familia</span></div></div>
      <section className="container seccion-publica carta-publica">
        <div className="titulo-con-enlace">
          <div><p className="ceja">Para ir abriendo el apetito</p><h2>Platos de la casa.</h2></div>
          <Link className="enlace-acento" to="/carta">Explorá toda la carta</Link>
        </div>
        {estado && <p role="status">{estado}</p>}
        <PlatosDestacados platos={platosDeLaCasa.length ? platosDeLaCasa : platos.slice(0, 3)} />
      </section>
    </main>
  );
}

const historia = [
  ['Una familia, una cocina', 'Marta y Carlos comenzaron con panes, budines y pizzas. Cada plato sigue llevando esa dedicación del primer día.'],
  ['Una casona centenaria', 'Frente a la plaza del pueblo, nuestro salón reúne a familias y amigos en un espacio con más de cien años de historia.'],
  ['Encuentros que quedan', 'Cerveza tirada, platos para compartir y noches con música. Mucho más que sentarse a comer.']
];

export function Nosotros() {
  return (
    <main className="public-page pagina-bodegon">
      <div className="container seccion-publica">
        <section className="historia">
          <img src="/diseno/salon.png" alt="Salón de Arte-Sano en su casona frente a la plaza" />
          <div>
            <p className="ceja">Un bodegón con historia</p>
            <h1>No es solo comer.<br />Es sentirse parte.</h1>
            <p className="intro">Empezamos en 2020, entre panes caseros y recetas de familia. Hoy, Marta y Carlos te reciben en una casona centenaria frente a la plaza, con el mismo amor por cocinar de siempre.</p>
            <p className="intro">Acá hay lugar para los amigos, los domingos largos y las ganas de volver. La mesa ya está puesta.</p>
            <Link className="enlace-acento" to="/contacto">Conocé nuestro rincón</Link>
          </div>
        </section>
        <div className="grilla-carta valores">
          {historia.map(([titulo, texto]) => <article key={titulo}><h2>{titulo}</h2><p className="intro">{texto}</p></article>)}
        </div>
      </div>
    </main>
  );
}

const canalesContacto = [
  ['WhatsApp', '02324 47-4786', 'https://wa.me/542324474786'],
  ['Instagram', '@artesanobodegon', 'https://www.instagram.com/artesanobodegon/'],
  ['Facebook', 'Arte-Sano Beer & Co', 'https://www.facebook.com/artesano.beer.co']
];

const mapaContacto = 'https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d243.4401136827116!2d-59.9074352!3d-34.6133726!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95b955b1e6837001%3A0x3df6a1f0bcaf766f!2sARTE%20-%20SANO%20Beer%20%26%20Co!5e1!3m2!1ses-419!2sar!4v1794738330292!5m2!1ses-419!2sar';

export function Contacto() {
  return (
    <main className="public-page pagina-contacto">
      <div className="container seccion-publica">
        <h1>Contacto<span className="acento">.</span></h1>
        <p className="intro">Consultanos por WhatsApp o encontrá cómo llegar al bodegón.</p>
        <div className="contacto-grilla">
          <div className="contacto-datos">
            <img src="/diseno/mostrador.png" alt="Interior y mostrador de Arte-Sano" />
            <section className="datos-contacto" aria-labelledby="titulo-canales">
              <h2 id="titulo-canales">Canales de contacto</h2>
              <dl className="canales-contacto">
                {canalesContacto.map(([canal, dato, enlace]) => (
                  <div key={canal}><dt>{canal}</dt><dd><a className="enlace-acento" href={enlace}>{dato}</a></dd></div>
                ))}
              </dl>
            </section>
          </div>
          <section className="datos-contacto" aria-labelledby="titulo-ubicacion">
            <h2 id="titulo-ubicacion">Dónde estamos</h2>
            <iframe className="mapa-contacto" title="Ubicación de Arte-Sano en Google Maps" src={mapaContacto}
              loading="lazy" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" />
            <a className="boton-acento" href="https://www.google.com/maps/dir/?api=1&destination=-34.6133726%2C-59.9074352">
              Cómo llegar
            </a>
          </section>
        </div>
      </div>
    </main>
  );
}

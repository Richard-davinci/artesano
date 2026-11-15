import PlatoCard from './PlatoCard.jsx';

export default function ListaPlatos({ platos }) {
  if (platos.length === 0) return <p>Todavía no hay platos.</p>;

  return (
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
  );
}

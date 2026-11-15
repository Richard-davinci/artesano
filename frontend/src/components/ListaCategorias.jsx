export default function ListaCategorias({ categorias }) {
  if (categorias.length === 0) return <p>Todavía no hay categorías.</p>;

  return (
    <ul>
      {categorias.map((categoria) => (
        <li key={categoria._id}>
          <strong>{categoria.name}</strong>
          {categoria.description && <p>{categoria.description}</p>}
        </li>
      ))}
    </ul>
  );
}

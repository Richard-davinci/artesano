const trazos = {
  editar: 'M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L9 17l-4 1 1-4L16.5 3.5Z',
  borrar: 'M3 6h18M8 6V4h8v2m3 0-1 14H6L5 6m5 4v6m4-6v6'
};

export default function IconoAccion({ tipo }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={trazos[tipo]} />
    </svg>
  );
}

export const apiUrl = (import.meta.env.VITE_API_URL?.trim() || 'http://localhost:3001').replace(/\/+$/, '');

export async function obtenerPlatos(signal, filtros = {}) {
  const parametros = [];
  if (filtros.name) parametros.push(`name=${encodeURIComponent(filtros.name)}`);
  if (filtros.category) parametros.push(`category=${encodeURIComponent(filtros.category)}`);
  if (filtros.minPrice) parametros.push(`minPrice=${encodeURIComponent(filtros.minPrice)}`);
  if (filtros.maxPrice) parametros.push(`maxPrice=${encodeURIComponent(filtros.maxPrice)}`);
  const consulta = parametros.length ? `?${parametros.join('&')}` : '';

  const respuesta = await fetch(`${apiUrl}/api/dishes${consulta}`, { signal });
  if (!respuesta.ok) {
    const datos = await respuesta.json().catch(() => null);
    throw new Error(datos?.message || 'No se pudieron obtener los platos.');
  }

  const { data } = await respuesta.json();
  if (!Array.isArray(data)) throw new Error('La respuesta no contiene una lista de platos');
  return data;
}

export async function obtenerCategorias(signal) {
  const respuesta = await fetch(`${apiUrl}/api/categories`, { signal });
  if (!respuesta.ok) throw new Error('No pudimos cargar las categorías.');

  const { data } = await respuesta.json();
  return data;
}

export async function iniciarSesion(email, password) {
  const respuesta = await fetch(`${apiUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  if (!respuesta.ok) {
    throw new Error('No se pudo iniciar sesión.');
  }
  return respuesta.json();
}

// Envía los datos necesarios para crear una cuenta.
export async function registrarUsuario(name, email, password) {
  const respuesta = await fetch(`${apiUrl}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password })
  });
  const datos = await respuesta.json().catch(() => null);
  if (!respuesta.ok) {
    throw new Error(datos?.message || 'No se pudo completar el registro.');
  }
}

// Envía el token en las solicitudes privadas.
async function fetchPrivado(endpoint, token, options = {}) {
  const respuesta = await fetch(`${apiUrl}${endpoint}`, {
    ...options,
    headers: { ...options.headers, Authorization: `Bearer ${token}` }
  });
  const datos = await respuesta.json().catch(() => null);
  if (!respuesta.ok) {
    throw new Error(datos?.message || 'No se pudo completar la solicitud.');
  }
  return datos.data;
}

export function obtenerPerfil(token) {
  return fetchPrivado('/api/auth/me', token);
}

export function crearCategoria(token, categoria) {
  return fetchPrivado('/api/categories', token, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(categoria)
  });
}

export function subirFotoPerfil(token, archivo) {
  const formData = new FormData();
  formData.append('profileImage', archivo);
  return fetchPrivado('/api/auth/profileimage', token, { method: 'POST', body: formData });
}

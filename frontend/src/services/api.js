export const apiUrl = (import.meta.env.VITE_API_URL?.trim() || 'http://localhost:3001').replace(/\/+$/, '');

async function solicitar(url, options) {
  try {
    return await fetch(url, options);
  } catch (error) {
    if (error.name === 'AbortError') throw error;
    throw new Error('No se pudo conectar con el servidor. Intentá nuevamente.');
  }
}

export async function obtenerPlatos(signal, filtros = {}) {
  const parametros = [];
  if (filtros.name) parametros.push(`name=${encodeURIComponent(filtros.name)}`);
  if (filtros.category) parametros.push(`category=${encodeURIComponent(filtros.category)}`);
  if (filtros.minPrice) parametros.push(`minPrice=${encodeURIComponent(filtros.minPrice)}`);
  if (filtros.maxPrice) parametros.push(`maxPrice=${encodeURIComponent(filtros.maxPrice)}`);
  const consulta = parametros.length ? `?${parametros.join('&')}` : '';

  const respuesta = await solicitar(`${apiUrl}/api/dishes${consulta}`, { signal });
  if (!respuesta.ok) {
    const datos = await respuesta.json().catch(() => null);
    throw new Error(datos?.message || 'No se pudieron obtener los platos.');
  }

  const { data } = await respuesta.json();
  if (!Array.isArray(data)) throw new Error('La respuesta no contiene una lista de platos');
  return data;
}

export async function obtenerCategorias(signal) {
  const respuesta = await solicitar(`${apiUrl}/api/categories`, { signal });
  if (!respuesta.ok) throw new Error('No pudimos cargar las categorías.');

  const { data } = await respuesta.json();
  return data;
}

export async function iniciarSesion(email, password) {
  const respuesta = await solicitar(`${apiUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  if (!respuesta.ok) {
    const datos = await respuesta.json().catch(() => null);
    throw new Error(respuesta.status === 401
      ? 'El correo o la contraseña son incorrectos.'
      : datos?.message || 'No se pudo iniciar sesión.');
  }
  return respuesta.json();
}

// Envía los datos necesarios para crear una cuenta.
export async function registrarUsuario(name, email, password) {
  const respuesta = await solicitar(`${apiUrl}/api/auth/register`, {
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
  const respuesta = await solicitar(`${apiUrl}${endpoint}`, {
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

export function editarCategoria(token, id, categoria) {
  return fetchPrivado(`/api/categories/${id}`, token, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(categoria)
  });
}

export function borrarCategoria(token, id) {
  return fetchPrivado(`/api/categories/${id}`, token, { method: 'DELETE' });
}

export function crearPlato(token, plato) {
  return fetchPrivado('/api/dishes', token, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(plato)
  });
}

export function editarPlato(token, id, plato) {
  return fetchPrivado(`/api/dishes/${id}`, token, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(plato)
  });
}

export function borrarPlato(token, id) {
  return fetchPrivado(`/api/dishes/${id}`, token, { method: 'DELETE' });
}

export function subirFotoPerfil(token, archivo) {
  const formData = new FormData();
  formData.append('profileImage', archivo);
  return fetchPrivado('/api/auth/profileimage', token, { method: 'POST', body: formData });
}

export function subirFotoCategoria(token, id, archivo) {
  const formData = new FormData();
  formData.append('image', archivo);
  return fetchPrivado(`/api/categories/${id}/image`, token, { method: 'POST', body: formData });
}

export function subirFotoPlato(token, id, archivo) {
  const formData = new FormData();
  formData.append('image', archivo);
  return fetchPrivado(`/api/dishes/${id}/image`, token, { method: 'POST', body: formData });
}

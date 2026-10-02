import axios from 'axios'

// URL base del backend (FastAPI). Sin prefijo /api: las rutas son /auth/login, /auth/me, etc.
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'
const api = axios.create({ baseURL: API_URL })

const CLAVE_SESION = 'clinicadental_sesion'

// ---------- Sesión (localStorage) ----------
// Se guarda: { access_token, refresh_token, usuario }
function guardarSesion(datos) {
  localStorage.setItem(CLAVE_SESION, JSON.stringify(datos))
}

export function obtenerSesion() {
  try {
    return JSON.parse(localStorage.getItem(CLAVE_SESION))
  } catch {
    return null
  }
}

export function haySesion() {
  return Boolean(obtenerSesion()?.access_token)
}

export function cerrarSesion() {
  localStorage.removeItem(CLAVE_SESION)
}

// ---------- Errores ----------
// FastAPI responde { detail: "texto" } (errores de negocio) o
// { detail: [{ msg, ... }] } (errores de validación 422).
export function mensajeError(err, porDefecto) {
  if (!err.response) return 'No se pudo conectar con el servidor. Intente de nuevo.'
  const detail = err.response.data?.detail
  if (typeof detail === 'string') return detail
  if (Array.isArray(detail) && detail.length > 0) {
    return detail
      .map((d) => String(d.msg || '').replace(/^Value error, /, ''))
      .filter(Boolean)
      .join('. ')
  }
  return porDefecto
}

// ---------- Interceptores ----------
// 1) Adjunta el access token a cada petición
api.interceptors.request.use((config) => {
  const token = obtenerSesion()?.access_token
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// 2) Si el access token venció (dura 15 min), pide uno nuevo con el refresh token y reintenta
const RUTAS_PUBLICAS = [
  '/auth/login',
  '/auth/register',
  '/auth/refresh',
  '/auth/logout',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/auth/mfa/verify',
]

let renovando = null // evita varios /auth/refresh a la vez (el refresh se rota: solo sirve una vez)

function renovarTokens() {
  if (!renovando) {
    const sesion = obtenerSesion()
    if (!sesion?.refresh_token) return Promise.reject(new Error('Sin refresh token'))
    renovando = axios
      .post(`${API_URL}/auth/refresh`, { refresh_token: sesion.refresh_token })
      .then(({ data }) => {
        guardarSesion({ ...sesion, access_token: data.access_token, refresh_token: data.refresh_token })
        return data.access_token
      })
      .finally(() => {
        renovando = null
      })
  }
  return renovando
}

api.interceptors.response.use(
  (respuesta) => respuesta,
  async (error) => {
    const original = error.config
    const esPublica = RUTAS_PUBLICAS.some((ruta) => original?.url?.startsWith(ruta))
    if (error.response?.status !== 401 || !original || original._reintento || esPublica) {
      return Promise.reject(error)
    }
    original._reintento = true
    try {
      const nuevoToken = await renovarTokens()
      original.headers.Authorization = `Bearer ${nuevoToken}`
      return api(original)
    } catch {
      cerrarSesion()
      window.location.href = '/login'
      return Promise.reject(error)
    }
  }
)

// ---------- Endpoints ----------

// Guarda los tokens y consulta /auth/me para tener los datos del usuario
async function completarLogin(tokens) {
  guardarSesion({ access_token: tokens.access_token, refresh_token: tokens.refresh_token })
  try {
    const { data: usuario } = await api.get('/auth/me')
    guardarSesion({ ...obtenerSesion(), usuario })
  } catch (err) {
    cerrarSesion()
    throw err
  }
}

// POST /auth/login
// Devuelve { mfaRequired: false } si entró, o { mfaRequired: true, mfaToken } si la cuenta tiene MFA.
export async function login({ email, password }) {
  const { data } = await api.post('/auth/login', { email, password })
  if (data.mfa_required) return { mfaRequired: true, mfaToken: data.mfa_token }
  await completarLogin(data)
  return { mfaRequired: false }
}

// POST /auth/mfa/verify  (segundo paso del login cuando hay MFA)
export async function verificarMfa({ mfaToken, codigo }) {
  const { data } = await api.post('/auth/mfa/verify', { mfa_token: mfaToken, code: codigo })
  await completarLogin(data)
}

// POST /auth/register
export async function registrar({ nombre, documento, telefono, email, password }) {
  const { data } = await api.post('/auth/register', {
    email,
    document_number: documento,
    full_name: nombre,
    phone_number: telefono,
    password,
  })
  return data
}

// POST /auth/forgot-password  (envía un código de 6 dígitos al correo)
export async function recuperarPassword({ email }) {
  const { data } = await api.post('/auth/forgot-password', { email })
  return data
}

// POST /auth/reset-password  (código + contraseña nueva)
export async function restablecerPassword({ email, codigo, password }) {
  const { data } = await api.post('/auth/reset-password', {
    email,
    code: codigo,
    new_password: password,
  })
  return data
}

// GET /auth/me  (ruta protegida: usa el access token y lo renueva solo si venció)
export async function obtenerPerfil() {
  const { data } = await api.get('/auth/me')
  guardarSesion({ ...obtenerSesion(), usuario: data })
  return data
}

// POST /auth/logout  (revoca el refresh token en el servidor y limpia la sesión local)
export async function logout() {
  const refresh = obtenerSesion()?.refresh_token
  try {
    if (refresh) await api.post('/auth/logout', { refresh_token: refresh })
  } catch {
    // aunque falle el servidor, cerramos la sesión local igual
  } finally {
    cerrarSesion()
  }
}

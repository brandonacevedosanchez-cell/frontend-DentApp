import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthLayout from '../componentes/AuthLayout'
import Campo from '../componentes/Campo'
import { mensajeError, registrar } from '../service/authService'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const DOCUMENTO_REGEX = /^[0-9A-Za-z]{5,20}$/
const TELEFONO_REGEX = /^\+[1-9]\d{7,14}$/

// El backend exige el teléfono con indicativo (+57...). Si escriben un celular colombiano
// de 10 dígitos (3001234567) le agregamos el +57.
function normalizarTelefono(valor) {
  const limpio = valor.replace(/[\s-]/g, '')
  return /^3\d{9}$/.test(limpio) ? `+57${limpio}` : limpio
}

// Mismas reglas que validate_password_strength del backend
function errorPassword(p) {
  if (p.length < 8) return 'La contraseña debe tener al menos 8 caracteres'
  const faltan = []
  if (!/[a-z]/.test(p)) faltan.push('una minúscula')
  if (!/[A-Z]/.test(p)) faltan.push('una mayúscula')
  if (!/\d/.test(p)) faltan.push('un número')
  if (!/[^\w\s]/.test(p)) faltan.push('un símbolo')
  return faltan.length ? `Falta: ${faltan.join(', ')}` : ''
}

export default function RegistroView() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ nombre: '', documento: '', telefono: '', email: '', password: '', confirmar: '' })
  const [errores, setErrores] = useState({})
  const [errorServidor, setErrorServidor] = useState('')
  const [cargando, setCargando] = useState(false)

  const cambiar = (campo) => (e) => setForm({ ...form, [campo]: e.target.value })
  const cambiarTelefono = (e) => {
    const telefono = e.target.value.replace(/[^0-9]/g, '').slice(0, 10)
    setForm({ ...form, telefono })
  }

  const validar = () => {
    const n = {}
    if (form.nombre.trim().length < 3) n.nombre = 'Ingrese su nombre completo'
    if (!DOCUMENTO_REGEX.test(form.documento.trim())) n.documento = 'Documento inválido (5 a 20 letras o números)'
    if (!TELEFONO_REGEX.test(normalizarTelefono(form.telefono))) n.telefono = 'Ingrese un teléfono válido, ej: 3001234567'
    if (!form.email.trim()) n.email = 'Ingrese su correo electrónico'
    else if (!EMAIL_REGEX.test(form.email)) n.email = 'El correo no tiene un formato válido'
    const ep = errorPassword(form.password)
    if (ep) n.password = ep
    if (form.confirmar !== form.password) n.confirmar = 'Las contraseñas no coinciden'
    return n
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorServidor('')
    const n = validar()
    setErrores(n)
    if (Object.keys(n).length > 0) return

    setCargando(true)
    try {
      await registrar({
        nombre: form.nombre.trim(),
        documento: form.documento.trim(),
        telefono: normalizarTelefono(form.telefono),
        email: form.email.trim(),
        password: form.password,
      })
      navigate('/login', { state: { mensaje: 'Cuenta creada. Ya puede iniciar sesión.' } })
    } catch (err) {
      setErrorServidor(mensajeError(err, 'No se pudo crear la cuenta. Intente de nuevo.'))
    } finally {
      setCargando(false)
    }
  }

  return (
    <AuthLayout subtitulo="Cree su cuenta" amplio>
      <form onSubmit={handleSubmit} noValidate className="grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2">
        <Campo id="nombre" label="Nombre completo" autoComplete="name" placeholder="Nombre Apellido" value={form.nombre} onChange={cambiar('nombre')} error={errores.nombre} />
        <Campo id="documento" label="Número de documento" placeholder="1234567890" value={form.documento} onChange={cambiar('documento')} error={errores.documento} />
        <Campo id="telefono" label="Teléfono" type="tel" autoComplete="tel" inputMode="numeric" placeholder="3001234567" value={form.telefono} onChange={cambiarTelefono} error={errores.telefono} />
        <Campo id="email" label="Correo electrónico" type="email" autoComplete="email" placeholder="nombre@ejemplo.com" value={form.email} onChange={cambiar('email')} error={errores.email} />
        <Campo id="password" label="Contraseña" type="password" mostrarContrasena autoComplete="new-password" placeholder="Mín. 8 con mayúscula, número y símbolo" value={form.password} onChange={cambiar('password')} error={errores.password} />
        <Campo id="confirmar" label="Confirmar contraseña" type="password" mostrarContrasena autoComplete="new-password" placeholder="Repita la contraseña" value={form.confirmar} onChange={cambiar('confirmar')} error={errores.confirmar} />

        {errorServidor && (
          <p role="alert" className="md:col-span-2 text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-4 py-3">{errorServidor}</p>
        )}

        <div className="pt-2 md:col-span-2 md:flex md:justify-center md:pt-3">
          <button type="submit" disabled={cargando} className="w-full h-12 btn-gradient text-white font-semibold rounded-lg ios-shadow transition-colors hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed md:w-72">
            {cargando ? 'Creando cuenta...' : 'Crear cuenta'}
          </button>
        </div>

        <p className="text-center text-sm text-slate-500 pt-1 md:col-span-2">
          ¿Ya tiene cuenta?{' '}
          <Link to="/login" className="text-primary font-semibold hover:underline">Iniciar sesión</Link>
        </p>
      </form>
    </AuthLayout>
  )
}

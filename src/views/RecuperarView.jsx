import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthLayout from '../componentes/AuthLayout'
import Campo from '../componentes/Campo'
import { mensajeError, recuperarPassword, restablecerPassword } from '../service/authService'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

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

const claseBoton =
  'w-full h-14 btn-gradient text-white font-bold rounded-lg ios-shadow active:scale-[0.98] transition-transform text-lg disabled:opacity-70 disabled:cursor-not-allowed'

// Paso 1: el usuario pide el código (POST /auth/forgot-password)
// Paso 2: escribe el código + contraseña nueva (POST /auth/reset-password)
export default function RecuperarView() {
  const navigate = useNavigate()
  const [paso, setPaso] = useState(1)
  const [email, setEmail] = useState('')
  const [codigo, setCodigo] = useState('')
  const [password, setPassword] = useState('')
  const [confirmar, setConfirmar] = useState('')
  const [errores, setErrores] = useState({})
  const [errorServidor, setErrorServidor] = useState('')
  const [cargando, setCargando] = useState(false)

  const pedirCodigo = async (e) => {
    e.preventDefault()
    setErrorServidor('')
    if (!EMAIL_REGEX.test(email.trim())) {
      setErrores({ email: 'Ingrese un correo electrónico válido' })
      return
    }
    setErrores({})
    setCargando(true)
    try {
      await recuperarPassword({ email: email.trim() })
      setPaso(2)
    } catch (err) {
      setErrorServidor(mensajeError(err, 'No se pudo enviar la solicitud. Intente de nuevo.'))
    } finally {
      setCargando(false)
    }
  }

  const cambiarPassword = async (e) => {
    e.preventDefault()
    setErrorServidor('')
    const n = {}
    if (!/^\d{6}$/.test(codigo)) n.codigo = 'El código tiene 6 dígitos'
    const ep = errorPassword(password)
    if (ep) n.password = ep
    if (confirmar !== password) n.confirmar = 'Las contraseñas no coinciden'
    setErrores(n)
    if (Object.keys(n).length > 0) return

    setCargando(true)
    try {
      await restablecerPassword({ email: email.trim(), codigo, password })
      navigate('/login', { state: { mensaje: 'Contraseña actualizada. Ya puede iniciar sesión.' } })
    } catch (err) {
      setErrorServidor(mensajeError(err, 'No se pudo cambiar la contraseña. Intente de nuevo.'))
    } finally {
      setCargando(false)
    }
  }

  const alerta = errorServidor && (
    <p role="alert" className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-4 py-3">{errorServidor}</p>
  )

  return (
    <AuthLayout subtitulo="Recupere el acceso a su cuenta">
      {paso === 1 ? (
        <form onSubmit={pedirCodigo} noValidate className="space-y-5">
          <p className="text-slate-500 text-sm">Ingrese el correo de su cuenta y le enviaremos un código de 6 dígitos.</p>
          <Campo id="email" label="Correo electrónico" type="email" autoComplete="email" placeholder="nombre@ejemplo.com" value={email} onChange={(e) => setEmail(e.target.value)} error={errores.email} />
          {alerta}
          <div className="pt-4">
            <button type="submit" disabled={cargando} className={claseBoton}>
              {cargando ? 'Enviando...' : 'Enviar código'}
            </button>
          </div>
          <p className="text-center pt-2">
            <Link to="/login" className="text-primary text-sm font-medium hover:underline">Volver a iniciar sesión</Link>
          </p>
        </form>
      ) : (
        <form onSubmit={cambiarPassword} noValidate className="space-y-5">
          <p className="text-slate-600 bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-sm">
            Si el correo está registrado, recibirá un código de 6 dígitos. Vence en 10 minutos.
          </p>
          <Campo id="codigo" label="Código" inputMode="numeric" autoComplete="one-time-code" maxLength={6} placeholder="123456" value={codigo} onChange={(e) => setCodigo(e.target.value.replace(/\D/g, ''))} error={errores.codigo} />
          <Campo id="password" label="Contraseña nueva" type="password" autoComplete="new-password" placeholder="Mín. 8 con mayúscula, número y símbolo" value={password} onChange={(e) => setPassword(e.target.value)} error={errores.password} />
          <Campo id="confirmar" label="Confirmar contraseña" type="password" autoComplete="new-password" placeholder="Repita la contraseña" value={confirmar} onChange={(e) => setConfirmar(e.target.value)} error={errores.confirmar} />
          {alerta}
          <div className="pt-4">
            <button type="submit" disabled={cargando} className={claseBoton}>
              {cargando ? 'Guardando...' : 'Cambiar contraseña'}
            </button>
          </div>
          <p className="text-center pt-2">
            <button type="button" onClick={() => { setPaso(1); setErrorServidor(''); setErrores({}) }} className="text-primary text-sm font-medium hover:underline">
              Pedir un código nuevo
            </button>
          </p>
        </form>
      )}
    </AuthLayout>
  )
}

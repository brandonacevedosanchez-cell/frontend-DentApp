import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import Campo from './Campo'
import { login, mensajeError, verificarMfa } from '../service/authService'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const claseInput =
  'w-full h-14 bg-slate-50 border rounded-lg px-4 text-slate-900 placeholder:text-slate-400 focus:ring-1 focus:ring-primary focus:border-primary transition-all outline-none'

export default function LoginForm() {
  const navigate = useNavigate()
  const mensaje = useLocation().state?.mensaje
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [verPassword, setVerPassword] = useState(false)
  const [errores, setErrores] = useState({})
  const [errorServidor, setErrorServidor] = useState('')
  const [cargando, setCargando] = useState(false)
  // Si la cuenta tiene MFA, el login pide un segundo paso con el código de la app autenticadora
  const [mfaToken, setMfaToken] = useState('')
  const [codigo, setCodigo] = useState('')

  const validar = () => {
    const nuevos = {}
    if (!email.trim()) nuevos.email = 'Ingrese su correo electrónico'
    else if (!EMAIL_REGEX.test(email)) nuevos.email = 'El correo no tiene un formato válido'
    if (!password) nuevos.password = 'Ingrese su contraseña'
    return nuevos
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorServidor('')
    const nuevos = validar()
    setErrores(nuevos)
    if (Object.keys(nuevos).length > 0) return

    setCargando(true)
    try {
      const res = await login({ email: email.trim(), password })
      if (res.mfaRequired) {
        setMfaToken(res.mfaToken)
        return
      }
      navigate('/panel')
    } catch (err) {
      setErrorServidor(mensajeError(err, 'No se pudo iniciar sesión. Revise sus datos e intente de nuevo.'))
    } finally {
      setCargando(false)
    }
  }

  const handleMfa = async (e) => {
    e.preventDefault()
    setErrorServidor('')
    if (!/^\d{6}$/.test(codigo)) {
      setErrorServidor('El código debe tener 6 dígitos')
      return
    }
    setCargando(true)
    try {
      await verificarMfa({ mfaToken, codigo })
      navigate('/panel')
    } catch (err) {
      setErrorServidor(mensajeError(err, 'Código inválido. Intente de nuevo.'))
    } finally {
      setCargando(false)
    }
  }

  const volverAlLogin = () => {
    setMfaToken('')
    setCodigo('')
    setErrorServidor('')
  }

  if (mfaToken) {
    return (
      <form onSubmit={handleMfa} noValidate className="space-y-5">
        <p className="text-slate-500 text-sm">
          Ingrese el código de 6 dígitos de su aplicación autenticadora.
        </p>
        <Campo
          id="codigo"
          label="Código de verificación"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          placeholder="123456"
          value={codigo}
          onChange={(e) => setCodigo(e.target.value.replace(/\D/g, ''))}
        />
        {errorServidor && (
          <p role="alert" className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-4 py-3">
            {errorServidor}
          </p>
        )}
        <div className="pt-4">
          <button
            type="submit"
            disabled={cargando}
            className="w-full h-14 btn-gradient text-white font-bold rounded-lg ios-shadow active:scale-[0.98] transition-transform text-lg disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {cargando ? 'Verificando...' : 'Verificar'}
          </button>
        </div>
        <p className="text-center pt-2">
          <button type="button" onClick={volverAlLogin} className="text-primary text-sm font-medium hover:underline">
            Volver
          </button>
        </p>
      </form>
    )
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <div className="flex flex-col gap-2">
        <label htmlFor="email" className="text-primary text-sm font-semibold ml-1">
          Correo electrónico
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="nombre@ejemplo.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={`${claseInput} ${errores.email ? 'border-red-400' : 'border-neutral-border'}`}
        />
        {errores.email && <p className="text-red-500 text-xs ml-1">{errores.email}</p>}
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="password" className="text-primary text-sm font-semibold ml-1">
          Contraseña
        </label>
        <div className="relative flex items-center">
          <input
            id="password"
            type={verPassword ? 'text' : 'password'}
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`${claseInput} pr-12 ${errores.password ? 'border-red-400' : 'border-neutral-border'}`}
          />
          <button
            type="button"
            onClick={() => setVerPassword((v) => !v)}
            aria-label={verPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            className="absolute right-4 text-slate-400 hover:text-primary transition-colors"
          >
            <span className="material-symbols-outlined">{verPassword ? 'visibility_off' : 'visibility'}</span>
          </button>
        </div>
        {errores.password && <p className="text-red-500 text-xs ml-1">{errores.password}</p>}
      </div>

      {mensaje && (
        <p role="status" className="text-green-700 text-sm bg-green-50 border border-green-200 rounded-lg px-4 py-3">
          {mensaje}
        </p>
      )}

      {errorServidor && (
        <p role="alert" className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          {errorServidor}
        </p>
      )}

      <div className="pt-4">
        <button
          type="submit"
          disabled={cargando}
          className="w-full h-14 btn-gradient text-white font-bold rounded-lg ios-shadow active:scale-[0.98] transition-transform text-lg disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {cargando ? 'Ingresando...' : 'Ingresar'}
        </button>
      </div>

      <div className="flex flex-col items-center gap-4 pt-4">
        <Link to="/recuperar" className="text-primary text-sm font-medium hover:underline">
          ¿Olvidó su contraseña?
        </Link>
        <div className="flex items-center gap-2 text-slate-400 py-2">
          <div className="h-px w-12 bg-neutral-border" />
          <span className="text-xs uppercase tracking-widest">o</span>
          <div className="h-px w-12 bg-neutral-border" />
        </div>
        <Link to="/registro" className="text-primary text-sm font-semibold hover:underline">
          Crear cuenta
        </Link>
      </div>
    </form>
  )
}

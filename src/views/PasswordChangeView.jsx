import { useState } from 'react'
import AuthLayout from '../componentes/AuthLayout'
import Campo from '../componentes/Campo'
import { cambiarPassword, mensajeError } from '../service/authService'

function errorPassword(password) {
  if (password.length < 8) return 'La contraseña debe tener al menos 8 caracteres'
  const faltan = []
  if (!/[a-z]/.test(password)) faltan.push('una minúscula')
  if (!/[A-Z]/.test(password)) faltan.push('una mayúscula')
  if (!/\d/.test(password)) faltan.push('un número')
  if (!/[^\w\s]/.test(password)) faltan.push('un símbolo')
  return faltan.length ? `La contraseña debe incluir ${faltan.join(', ')}` : ''
}

export default function PasswordChangeView() {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errores, setErrores] = useState({})
  const [errorServidor, setErrorServidor] = useState('')
  const [cargando, setCargando] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorServidor('')

    const nuevosErrores = {}
    if (!currentPassword) nuevosErrores.currentPassword = 'Ingrese su contraseña actual'
    const errorNueva = errorPassword(newPassword)
    if (errorNueva) nuevosErrores.newPassword = errorNueva
    if (newPassword !== confirmPassword) nuevosErrores.confirmPassword = 'Las contraseñas no coinciden'
    setErrores(nuevosErrores)
    if (Object.keys(nuevosErrores).length > 0) return

    setCargando(true)
    try {
      await cambiarPassword({ currentPassword, newPassword })
      window.location.replace('/panel')
    } catch (err) {
      setErrorServidor(mensajeError(err, 'No se pudo cambiar la contraseña. Intente de nuevo.'))
    } finally {
      setCargando(false)
    }
  }

  return (
    <AuthLayout subtitulo="Actualice su contraseña para continuar">
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <Campo
          id="currentPassword"
          label="Contraseña actual"
          type="password"
          mostrarContrasena
          autoComplete="current-password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          error={errores.currentPassword}
        />
        <Campo
          id="newPassword"
          label="Nueva contraseña"
          type="password"
          mostrarContrasena
          autoComplete="new-password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          error={errores.newPassword}
        />
        <Campo
          id="confirmPassword"
          label="Confirmar nueva contraseña"
          type="password"
          mostrarContrasena
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          error={errores.confirmPassword}
        />
        {errorServidor && (
          <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {errorServidor}
          </p>
        )}
        <button
          type="submit"
          disabled={cargando}
          className="btn-gradient h-12 w-full rounded-lg font-semibold text-white ios-shadow transition-[filter,transform] hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {cargando ? 'Cambiando contraseña...' : 'Cambiar contraseña'}
        </button>
      </form>
    </AuthLayout>
  )
}

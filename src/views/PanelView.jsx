import { useNavigate } from 'react-router-dom'
import { logout, obtenerSesion } from '../service/authService'

// Pantalla provisional: aquí irá el dashboard cuando se diseñe el siguiente módulo
export default function PanelView() {
  const navigate = useNavigate()
  const usuario = obtenerSesion()?.usuario

  const salir = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <main className="min-h-screen bg-background-light flex flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="text-primary text-2xl font-bold">Sesión iniciada</h1>
      <div className="text-slate-500">
        <p className="font-semibold text-slate-700">{usuario?.full_name}</p>
        <p>{usuario?.email}</p>
        <p className="text-sm">Rol: {usuario?.role_name}</p>
      </div>
      <button onClick={salir} className="text-primary font-semibold hover:underline">
        Cerrar sesión
      </button>
    </main>
  )
}

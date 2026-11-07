import { Navigate, Route, Routes } from 'react-router-dom'
import LandingView from '../views/LandingView'
import LoginView from '../views/LoginView'
import PanelView from '../views/PanelView'
import RegistroView from '../views/RegistroView'
import RecuperarView from '../views/RecuperarView'
import PasswordChangeView from '../views/PasswordChangeView'
import { haySesion, obtenerSesion } from '../service/authService'

// Protege las rutas que requieren sesión iniciada
function RutaPrivada({ children, permitirCambioClave = false }) {
  if (!haySesion()) return <Navigate to="/login" replace />
  const sesion = obtenerSesion()
  const debeCambiarClave = Boolean(sesion?.must_change_password || sesion?.usuario?.must_change_password)
  if (debeCambiarClave && !permitirCambioClave) return <Navigate to="/cambiar-clave" replace />
  if (!debeCambiarClave && permitirCambioClave) return <Navigate to="/panel" replace />
  return children
}

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<LandingView />} />
      <Route path="/login" element={<LoginView />} />
      <Route path="/registro" element={<RegistroView />} />
      <Route path="/recuperar" element={<RecuperarView />} />
      <Route
        path="/cambiar-clave"
        element={
          <RutaPrivada permitirCambioClave>
            <PasswordChangeView />
          </RutaPrivada>
        }
      />
      <Route
        path="/panel"
        element={
          <RutaPrivada>
            <PanelView />
          </RutaPrivada>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

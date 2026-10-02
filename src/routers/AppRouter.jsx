import { Navigate, Route, Routes } from 'react-router-dom'
import LandingView from '../views/LandingView'
import LoginView from '../views/LoginView'
import PanelView from '../views/PanelView'
import RegistroView from '../views/RegistroView'
import RecuperarView from '../views/RecuperarView'
import { haySesion } from '../service/authService'

// Protege las rutas que requieren sesión iniciada
function RutaPrivada({ children }) {
  return haySesion() ? children : <Navigate to="/login" replace />
}

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<LandingView />} />
      <Route path="/login" element={<LoginView />} />
      <Route path="/registro" element={<RegistroView />} />
      <Route path="/recuperar" element={<RecuperarView />} />
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

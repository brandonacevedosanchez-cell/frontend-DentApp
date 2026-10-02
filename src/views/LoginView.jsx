import AuthLayout from '../componentes/AuthLayout'
import LoginForm from '../componentes/LoginForm'

export default function LoginView() {
  return (
    <AuthLayout subtitulo="Tu historial médico, siempre contigo">
      <LoginForm />
    </AuthLayout>
  )
}

import Logo from './Logo'

// Estructura común de login, registro y recuperar contraseña
export default function AuthLayout({ subtitulo, children, amplio = false }) {
  return (
    <main className="auth-page bg-background-light">
      <div className={`auth-card ${amplio ? 'auth-card--wide' : ''} shadow-none sm:shadow-2xl`}>
        <div className="absolute top-0 left-0 w-full h-64 gradient-bg pointer-events-none" />
        <div className="absolute bottom-10 -right-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-40 -left-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

        <header className="auth-header">
          <Logo subtitulo={subtitulo} />
        </header>

        <section className="auth-content">{children}</section>

        <footer className="auth-footer">
          <p className="text-slate-400 text-xs">© 2026 Odonty. Todos los derechos reservados.</p>
        </footer>
      </div>
    </main>
  )
}

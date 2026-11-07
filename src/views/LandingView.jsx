import { Link } from 'react-router-dom'

export default function LandingView() {
  return (
    <main className="landing-page bg-background-light">
      <div className="landing-card shadow-none sm:shadow-2xl">
        <header className="landing-header">
          <div className="flex size-16 items-center justify-center rounded-2xl bg-white shadow-xl shadow-primary/5 mb-6">
            <span className="material-symbols-outlined text-primary text-4xl">dentistry</span>
          </div>
          <h2 className="text-primary text-xl font-bold tracking-tight">Odonty</h2>
        </header>

        <section className="landing-content">
          <div className="mb-12">
            <h1 className="text-slate-900 text-4xl font-bold tracking-tight mb-4">Bienvenido</h1>
            <p className="text-slate-500 text-lg leading-relaxed px-2">
              Tu historial clínico dental, digital y siempre a mano. Gestiona tus citas y registros con total seguridad.
            </p>
          </div>

          <div className="flex flex-col gap-4 w-full mb-12">
            <Link
              to="/login"
              className="landing-action btn-gradient w-full h-14 rounded-xl flex items-center justify-center text-white text-base font-semibold shadow-lg shadow-primary/20 active:scale-95 transition-[filter,transform] hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              Iniciar Sesión
            </Link>
            <Link
              to="/registro"
              className="landing-action w-full h-14 rounded-xl flex items-center justify-center border-2 border-primary bg-white text-primary text-base font-semibold active:scale-95 transition-colors hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              Solicitar Acceso
            </Link>
          </div>
        </section>

        <footer className="landing-footer">
          <div className="flex justify-center items-center gap-2 text-slate-400 mb-4">
            <span className="material-symbols-outlined text-sm">mail</span>
            <span className="text-xs">contacto@clinicadental.com</span>
          </div>
          <p className="text-slate-400 text-xs font-medium">© 2026 Odonty. Todos los derechos reservados.</p>
        </footer>
      </div>
    </main>
  )
}

import Logo from './Logo'

// Estructura común de login, registro y recuperar contraseña
export default function AuthLayout({ subtitulo, children }) {
  return (
    <main className="min-h-screen bg-white md:bg-background-light flex items-center justify-center md:p-6">
      <div className="relative w-full max-w-[430px] min-h-screen md:min-h-0 bg-white md:rounded-2xl md:shadow-2xl overflow-hidden flex flex-col">
        <div className="absolute top-0 left-0 w-full h-64 gradient-bg pointer-events-none" />
        <div className="absolute bottom-10 -right-10 w-40 h-40 bg-mint/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-40 -left-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

        <header className="pt-20 md:pt-14 pb-10 px-8 z-10">
          <Logo subtitulo={subtitulo} />
        </header>

        <section className="flex-1 px-8 z-10">{children}</section>

        <footer className="py-10 px-8 text-center z-10">
          <p className="text-slate-400 text-xs">© 2026 Odonty. Todos los derechos reservados.</p>
        </footer>
      </div>
    </main>
  )
}

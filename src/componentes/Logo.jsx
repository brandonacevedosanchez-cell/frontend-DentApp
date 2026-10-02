export default function Logo({ subtitulo }) {
  return (
    <div className="flex flex-col items-center">
      <div className="w-20 h-20 bg-primary rounded-xl flex items-center justify-center ios-shadow mb-6">
        <span className="material-symbols-outlined text-white text-5xl">dentistry</span>
      </div>
      <h1 className="text-primary text-3xl font-bold tracking-tight">Odonty</h1>
      {subtitulo && <p className="text-slate-500 mt-2 text-sm">{subtitulo}</p>}
    </div>
  )
}

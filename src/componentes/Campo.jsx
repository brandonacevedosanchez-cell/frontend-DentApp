import { useState } from 'react'

export default function Campo({ id, label, type = 'text', value, onChange, error, placeholder, autoComplete, inputMode, maxLength, mostrarContrasena = false }) {
  const [verContrasena, setVerContrasena] = useState(false)
  const esContrasena = type === 'password' && mostrarContrasena

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-primary text-sm font-semibold ml-1">
        {label}
      </label>
      <div className={esContrasena ? 'relative flex items-center' : undefined}>
        <input
          id={id}
          type={esContrasena && verContrasena ? 'text' : type}
          autoComplete={autoComplete}
          inputMode={inputMode}
          maxLength={maxLength}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className={`w-full h-14 bg-slate-50 border rounded-lg px-4 ${esContrasena ? 'pr-12' : ''} text-slate-900 placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary transition-all outline-none ${
            error ? 'border-red-400' : 'border-neutral-border'
          }`}
        />
        {esContrasena && (
          <button
            type="button"
            onClick={() => setVerContrasena((visible) => !visible)}
            aria-label={verContrasena ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            className="absolute right-1 inline-flex size-10 items-center justify-center rounded-md text-slate-500 hover:text-primary hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <span className="material-symbols-outlined" aria-hidden="true">
              {verContrasena ? 'visibility_off' : 'visibility'}
            </span>
          </button>
        )}
      </div>
      {error && <p className="text-red-500 text-xs ml-1">{error}</p>}
    </div>
  )
}

export default function Campo({ id, label, type = 'text', value, onChange, error, placeholder, autoComplete, inputMode, maxLength }) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-primary text-sm font-semibold ml-1">
        {label}
      </label>
      <input
        id={id}
        type={type}
        autoComplete={autoComplete}
        inputMode={inputMode}
        maxLength={maxLength}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`w-full h-14 bg-slate-50 border rounded-lg px-4 text-slate-900 placeholder:text-slate-400 focus:ring-1 focus:ring-primary focus:border-primary transition-all outline-none ${
          error ? 'border-red-400' : 'border-neutral-border'
        }`}
      />
      {error && <p className="text-red-500 text-xs ml-1">{error}</p>}
    </div>
  )
}

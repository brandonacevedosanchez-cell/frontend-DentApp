import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthLayout from '../componentes/AuthLayout'
import Campo from '../componentes/Campo'
import { mensajeError, registrarClinica } from '../service/authService'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const TAMANO_MAXIMO_ARCHIVO = 5 * 1024 * 1024
const TIPOS_ARCHIVO_PERMITIDOS = ['application/pdf']

function errorPassword(p) {
  if (p.length < 8) return 'La contraseña debe tener al menos 8 caracteres'
  const faltan = []
  if (!/[a-z]/.test(p)) faltan.push('una minúscula')
  if (!/[A-Z]/.test(p)) faltan.push('una mayúscula')
  if (!/\d/.test(p)) faltan.push('un número')
  if (!/[^\w\s]/.test(p)) faltan.push('un símbolo')
  return faltan.length ? `Falta: ${faltan.join(', ')}` : ''
}

function esImagenOPdf(archivo) {
  return archivo.type.startsWith('image/') || TIPOS_ARCHIVO_PERMITIDOS.includes(archivo.type) ||
    /\.(jpe?g|png|gif|webp|bmp|tiff?|pdf)$/i.test(archivo.name)
}

export default function RegistroView() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    clinic_name: '',
    nit: '',
    nit_dv: '',
    email: '',
    document_number: '',
    full_name: '',
    phone_number: '',
    password: '',
    confirmar: '',
    cedula_file: null,
    rut_file: null,
  })
  const [errores, setErrores] = useState({})
  const [errorServidor, setErrorServidor] = useState('')
  const [cargando, setCargando] = useState(false)

  const cambiar = (campo) => (e) => setForm({ ...form, [campo]: e.target.value })
  const cambiarNumerico = (campo) => (e) => setForm({ ...form, [campo]: e.target.value.replace(/\D/g, '') })
  const cambiarArchivo = (campo) => (e) => setForm({ ...form, [campo]: e.target.files?.[0] || null })

  const validar = () => {
    const n = {}
    if (!form.clinic_name.trim()) n.clinic_name = 'Ingrese el nombre de la clínica'
    if (!form.nit) n.nit = 'Ingrese el NIT'
    if (!form.nit_dv) n.nit_dv = 'Ingrese el dígito de verificación'
    else if (!/^\d$/.test(form.nit_dv)) n.nit_dv = 'El dígito de verificación debe tener un número'
    if (!form.email.trim()) n.email = 'Ingrese su correo electrónico'
    else if (!EMAIL_REGEX.test(form.email.trim())) n.email = 'El correo no tiene un formato válido'
    if (!form.document_number) n.document_number = 'Ingrese el número de documento'
    if (!form.full_name.trim()) n.full_name = 'Ingrese el nombre completo del administrador'
    if (!form.phone_number) n.phone_number = 'Ingrese el teléfono'
    const ep = errorPassword(form.password)
    if (ep) n.password = ep
    if (form.confirmar !== form.password) n.confirmar = 'Las contraseñas no coinciden'
    for (const campo of ['cedula_file', 'rut_file']) {
      const archivo = form[campo]
      if (!archivo) n[campo] = 'Seleccione un archivo'
      else if (!esImagenOPdf(archivo)) n[campo] = 'El archivo debe ser una imagen o un PDF'
      else if (archivo.size > TAMANO_MAXIMO_ARCHIVO) n[campo] = 'El archivo no puede superar 5 MB'
    }
    return n
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorServidor('')
    const n = validar()
    setErrores(n)
    if (Object.keys(n).length > 0) return

    setCargando(true)
    try {
      await registrarClinica({
        clinic_name: form.clinic_name.trim(),
        nit: form.nit,
        nit_dv: form.nit_dv,
        email: form.email.trim(),
        document_number: form.document_number,
        full_name: form.full_name.trim(),
        phone_number: form.phone_number,
        password: form.password,
        cedula_file: form.cedula_file,
        rut_file: form.rut_file,
      })
      navigate('/login', { state: { mensaje: 'Solicitud de acceso enviada correctamente.' } })
    } catch (err) {
      setErrorServidor(mensajeError(err, 'No se pudo enviar la solicitud de acceso. Revise los datos e intente de nuevo.'))
    } finally {
      setCargando(false)
    }
  }

  const campoArchivo = (id, label) => (
    <div className="registration-file flex flex-col gap-2">
      <label htmlFor={id} className="text-primary text-sm font-semibold ml-1">{label}</label>
      <input
        id={id}
        type="file"
        accept="image/*,.pdf,application/pdf"
        required
        aria-invalid={Boolean(errores[id])}
        aria-describedby={errores[id] ? `${id}-error` : undefined}
        onChange={cambiarArchivo(id)}
        className={`w-full min-h-14 bg-slate-50 border rounded-lg px-2 sm:px-4 py-2 text-base text-slate-900 file:mr-2 file:rounded-md file:border-0 file:bg-primary/10 file:px-2 sm:file:px-3 file:py-2 file:text-sm file:font-semibold file:text-primary focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary outline-none ${
          errores[id] ? 'border-red-400' : 'border-neutral-border'
        }`}
      />
      {form[id] && <p className="registration-file-name text-xs text-slate-500 ml-1" title={form[id].name}>{form[id].name}</p>}
      {errores[id] && <p id={`${id}-error`} className="text-red-500 text-xs ml-1">{errores[id]}</p>}
    </div>
  )

  return (
    <AuthLayout subtitulo="Solicite acceso a su clínica" amplio>
      <form onSubmit={handleSubmit} noValidate className="registration-form space-y-7">
        <fieldset className="registration-grid">
          <legend className="mb-4 text-lg font-semibold text-slate-900">Datos de la clínica</legend>
          <div className="field-span"><Campo id="clinic_name" label="Nombre de la clínica" autoComplete="organization" value={form.clinic_name} onChange={cambiar('clinic_name')} error={errores.clinic_name} /></div>
          <Campo id="nit" label="NIT" inputMode="numeric" value={form.nit} onChange={cambiarNumerico('nit')} error={errores.nit} />
          <Campo id="nit_dv" label="Dígito de verificación" inputMode="numeric" maxLength={1} value={form.nit_dv} onChange={(e) => setForm({ ...form, nit_dv: e.target.value.replace(/\D/g, '').slice(0, 1) })} error={errores.nit_dv} />
        </fieldset>

        <fieldset className="registration-grid">
          <legend className="mb-4 text-lg font-semibold text-slate-900">Datos del administrador</legend>
          <Campo id="full_name" label="Nombre completo" autoComplete="name" value={form.full_name} onChange={cambiar('full_name')} error={errores.full_name} />
          <Campo id="document_number" label="Número de documento" inputMode="numeric" value={form.document_number} onChange={cambiarNumerico('document_number')} error={errores.document_number} />
          <Campo id="email" label="Correo electrónico" type="email" autoComplete="email" inputMode="email" placeholder="nombre@ejemplo.com" value={form.email} onChange={cambiar('email')} error={errores.email} />
          <Campo id="phone_number" label="Teléfono" type="tel" autoComplete="tel" inputMode="numeric" value={form.phone_number} onChange={cambiarNumerico('phone_number')} error={errores.phone_number} />
          <Campo id="password" label="Contraseña" type="password" mostrarContrasena autoComplete="new-password" placeholder="Mín. 8 con mayúscula, número y símbolo" value={form.password} onChange={cambiar('password')} error={errores.password} />
          <Campo id="confirmar" label="Confirmar contraseña" type="password" mostrarContrasena autoComplete="new-password" placeholder="Repita la contraseña" value={form.confirmar} onChange={cambiar('confirmar')} error={errores.confirmar} />
        </fieldset>

        <fieldset className="registration-grid">
          <legend className="mb-4 text-lg font-semibold text-slate-900">Documentos</legend>
          {campoArchivo('cedula_file', 'Cédula del administrador')}
          {campoArchivo('rut_file', 'RUT de la clínica')}
          <p className="text-xs text-slate-500 field-span">Formatos permitidos: imagen o PDF. Tamaño máximo: 5 MB por archivo.</p>
        </fieldset>

        {errorServidor && (
          <p role="alert" className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-4 py-3">{errorServidor}</p>
        )}

        <div className="pt-2 md:flex md:justify-center md:pt-3">
          <button type="submit" disabled={cargando} className="form-submit w-full h-12 btn-gradient text-white font-semibold rounded-lg ios-shadow transition-[filter,transform] hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed md:w-72">
            {cargando ? 'Enviando solicitud...' : 'Solicitar acceso'}
          </button>
        </div>

        <p className="text-center text-sm text-slate-500 pt-1">
          ¿Ya tiene cuenta?{' '}
          <Link to="/login" className="text-primary font-semibold hover:underline">Iniciar sesión</Link>
        </p>
      </form>
    </AuthLayout>
  )
}

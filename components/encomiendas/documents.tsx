import { DECLARATION_LINES, formatDate, formatKg, formatUsd } from '@/lib/encomiendas'
import type { ManifestRow, Manifest, ShipmentDocument } from '@/lib/encomiendas-data'

const dash = (v: string | number | null | undefined) => (v === null || v === undefined || v === '' ? '—' : v)

function Sheet({ children, size = 'a4' }: { children: React.ReactNode; size?: 'a4' | 'half' }) {
  return (
    <article
      className={
        size === 'a4'
          ? 'mx-auto my-6 w-full max-w-[210mm] bg-white p-6 text-black shadow-sm sm:p-10 print:my-0 print:max-w-none print:p-0 print:shadow-none'
          : 'mx-auto my-6 w-full max-w-[210mm] break-inside-avoid bg-white p-6 text-black shadow-sm print:my-0 print:h-[148mm] print:max-w-none print:p-4 print:shadow-none'
      }
    >
      {children}
    </article>
  )
}

function Brand({ subtitle }: { subtitle: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b-2 border-black pb-3">
      <div className="flex items-center gap-3">
        <span className="flex size-10 items-center justify-center rounded bg-black text-sm font-bold text-white">FV</span>
        <div>
          <p className="text-lg font-bold leading-tight">FIVIP</p>
          <p className="text-xs">Encomiendas Perú – Venezuela</p>
        </div>
      </div>
      <p className="text-right text-sm font-semibold uppercase tracking-wide">{subtitle}</p>
    </div>
  )
}

function Info({ label, value, mono }: { label: string; value: React.ReactNode; mono?: boolean }) {
  return (
    <div className="flex flex-col">
      <dt className="text-[10px] font-semibold uppercase tracking-wide text-neutral-600">{label}</dt>
      <dd className={mono ? 'font-mono text-sm' : 'text-sm'}>{value}</dd>
    </div>
  )
}

function Parties({ s }: { s: ShipmentDocument['shipment'] }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 print:grid-cols-2">
      <section className="rounded border border-black p-3">
        <h3 className="mb-2 text-xs font-bold uppercase">Remitente</h3>
        <dl className="grid grid-cols-2 gap-2">
          <div className="col-span-2"><Info label="Nombre" value={s.remitente_nombre} /></div>
          <Info label="Documento" value={dash(s.remitente_documento)} />
          <Info label="Teléfono" value={dash(s.remitente_telefono)} />
          <div className="col-span-2"><Info label="Dirección" value={dash([s.remitente_direccion, s.remitente_ciudad, s.remitente_pais].filter(Boolean).join(', '))} /></div>
        </dl>
      </section>
      <section className="rounded border border-black p-3">
        <h3 className="mb-2 text-xs font-bold uppercase">Destinatario</h3>
        <dl className="grid grid-cols-2 gap-2">
          <div className="col-span-2"><Info label="Nombre" value={s.destinatario_nombre} /></div>
          <Info label="Cédula" value={dash(s.destinatario_documento)} />
          <Info label="Teléfono" value={dash(s.destinatario_telefono)} />
          <Info label="Destino" value={dash([s.destinatario_ciudad, s.destinatario_estado].filter(Boolean).join(', '))} />
          <Info label="Agencia ZOOM" value={dash(s.agencia_zoom)} />
        </dl>
      </section>
    </div>
  )
}

export function DeclarationDoc({ doc }: { doc: ShipmentDocument }) {
  const { shipment: s, contenido } = doc
  const lines = Array.from({ length: Math.max(DECLARATION_LINES, contenido.length) }, (_, i) => contenido[i])
  return (
    <Sheet>
      <Brand subtitle="Declaración jurada de contenido" />
      <dl className="my-4 grid grid-cols-3 gap-4">
        <Info label="Código ENV" value={dash(s.codigo_env ?? s.codigo)} mono />
        <Info label="Fecha de recepción" value={formatDate(s.fecha_recepcion)} />
        <Info label="Paquetes" value={s.cantidad_paquetes} />
      </dl>
      <Parties s={s} />
      <table className="mt-4 w-full border-collapse text-sm">
        <thead>
          <tr className="bg-neutral-100">
            <th className="w-12 border border-black px-2 py-1 text-left">N.º</th>
            <th className="border border-black px-2 py-1 text-left">Descripción de la mercadería</th>
            <th className="w-24 border border-black px-2 py-1 text-right">Cantidad</th>
          </tr>
        </thead>
        <tbody>
          {lines.map((l, i) => (
            <tr key={i}>
              <td className="h-7 border border-black px-2 font-mono">{i + 1}</td>
              <td className="border border-black px-2">{l?.descripcion ?? ''}</td>
              <td className="border border-black px-2 text-right tabular-nums">{l?.cantidad ?? ''}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={2} className="border border-black px-2 py-1 text-right font-bold">Total FOB (USD)</td>
            <td className="border border-black px-2 py-1 text-right font-bold tabular-nums">{formatUsd(s.valor_fob)}</td>
          </tr>
        </tfoot>
      </table>
      <p className="mt-4 text-xs leading-relaxed text-pretty">
        Declaro bajo juramento que el contenido detallado corresponde a la mercadería enviada, que no incluye
        artículos prohibidos o restringidos y que la información proporcionada es verdadera.
      </p>
      <div className="mt-16 grid grid-cols-2 gap-10 text-center text-xs">
        <div className="border-t border-black pt-1">Firma del remitente</div>
        <div className="border-t border-black pt-1">Huella / documento</div>
      </div>
    </Sheet>
  )
}

export function LabelDoc({ doc }: { doc: ShipmentDocument }) {
  const { shipment: s, paquetes, guias } = doc
  return (
    <>
      {paquetes.map((p) => {
        const guiasPaquete = guias.filter((g) => g.paquete_numero === p.numero || g.paquete_numero === null)
        return (
          <Sheet key={p.numero} size="half">
            <div className="flex items-start justify-between gap-4 border-b-2 border-black pb-2">
              <div className="flex items-center gap-2">
                <span className="flex size-9 items-center justify-center rounded bg-black text-xs font-bold text-white">FV</span>
                <span className="text-lg font-bold">FIVIP</span>
              </div>
              <div className="text-center">
                <p className="font-mono text-2xl font-bold tracking-wider">{s.codigo_env ?? s.codigo}</p>
                <p className="text-xs">{`Paquete ${p.numero} de ${s.cantidad_paquetes}`}</p>
              </div>
              <span className="rounded border-2 border-black px-2 py-1 text-lg font-black tracking-widest">ZOOM</span>
            </div>
            <div className="my-3">
              <Parties s={s} />
            </div>
            <dl className="grid grid-cols-3 gap-3 rounded border border-black p-3 sm:grid-cols-6 print:grid-cols-6">
              <Info label="Medidas (cm)" value={p.ancho && p.largo && p.alto ? `${p.ancho}×${p.largo}×${p.alto}` : '—'} />
              <Info label="Físico (kg)" value={formatKg(p.peso_fisico)} />
              <Info label="Volumétrico (kg)" value={formatKg(p.peso_volumetrico)} />
              <Info label="Facturable (kg)" value={formatKg(p.peso_facturable)} />
              <Info label="Salida" value={formatDate(s.fecha_salida)} />
              <Info label="Llegada est." value={formatDate(s.fecha_llegada_estimada)} />
            </dl>
            <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
              <Info
                label="Guías ZOOM"
                mono
                value={guiasPaquete.map((g) => g.numero_guia).join(', ') || 'Pendiente de asignar'}
              />
              <div className="flex gap-6 text-xs">
                <span>Control: ☐ Recibido ☐ Verificado ☐ Despachado</span>
              </div>
            </div>
          </Sheet>
        )
      })}
    </>
  )
}

export function GuidesDoc({ doc }: { doc: ShipmentDocument }) {
  const { shipment: s, guias, paquetes } = doc
  return (
    <Sheet>
      <Brand subtitle="Guías ZOOM" />
      <dl className="my-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Info label="Código ENV" value={dash(s.codigo_env ?? s.codigo)} mono />
        <Info label="Destinatario" value={s.destinatario_nombre} />
        <Info label="Agencia ZOOM" value={dash(s.agencia_zoom)} />
        <Info label="Estado" value={s.estado} />
      </dl>
      {guias.length === 0 ? (
        <p className="rounded border border-dashed border-black p-6 text-center text-sm">
          Esta encomienda aún no tiene guías ZOOM asignadas.
        </p>
      ) : (
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-neutral-100">
              {['N.º', 'Número de guía', 'Paquete', 'Peso (kg)', 'Estado'].map((h) => (
                <th key={h} className="border border-black px-2 py-1 text-left">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {guias.map((g, i) => (
              <tr key={g.numero_guia}>
                <td className="border border-black px-2 py-1">{i + 1}</td>
                <td className="border border-black px-2 py-1 font-mono">{g.numero_guia}</td>
                <td className="border border-black px-2 py-1">
                  {g.paquete_numero ? `Paquete ${g.paquete_numero}` : `Todos (${paquetes.length})`}
                </td>
                <td className="border border-black px-2 py-1 tabular-nums">{formatKg(g.peso)}</td>
                <td className="border border-black px-2 py-1">{g.estado}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Sheet>
  )
}

export function ManifestDoc({ manifest }: { manifest: Manifest }) {
  const t = manifest.totales
  return (
    <Sheet>
      <Brand subtitle={`Manifiesto de carga · Salida ${formatDate(manifest.fecha_salida)}`} />
      <table className="mt-4 w-full border-collapse text-[11px]">
        <thead>
          <tr className="bg-neutral-100">
            {['#', 'ENV', 'Remitente', 'Destinatario', 'Destino', 'Guías', 'Paq.', 'Fact. kg', 'FOB'].map((h) => (
              <th key={h} className="border border-black px-1.5 py-1 text-left">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {manifest.rows.map((r: ManifestRow, i) => (
            <tr key={r.id}>
              <td className="border border-black px-1.5 py-1">{i + 1}</td>
              <td className="border border-black px-1.5 py-1 font-mono">{r.codigo_env ?? r.codigo}</td>
              <td className="border border-black px-1.5 py-1">{r.remitente_nombre}</td>
              <td className="border border-black px-1.5 py-1">{r.destinatario_nombre}</td>
              <td className="border border-black px-1.5 py-1">{[r.destinatario_ciudad, r.destinatario_estado].filter(Boolean).join(', ')}</td>
              <td className="border border-black px-1.5 py-1 font-mono">{r.guias.join(', ') || '—'}</td>
              <td className="border border-black px-1.5 py-1 text-right">{r.cantidad_paquetes}</td>
              <td className="border border-black px-1.5 py-1 text-right tabular-nums">{formatKg(r.peso_facturable_total)}</td>
              <td className="border border-black px-1.5 py-1 text-right tabular-nums">{formatUsd(r.valor_fob)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="font-bold">
            <td colSpan={6} className="border border-black px-1.5 py-1 text-right">
              {`Totales · ${t.encomiendas} encomiendas · físico ${formatKg(t.peso_fisico)} kg · volumétrico ${formatKg(t.peso_volumetrico)} kg`}
            </td>
            <td className="border border-black px-1.5 py-1 text-right">{t.paquetes}</td>
            <td className="border border-black px-1.5 py-1 text-right tabular-nums">{formatKg(t.peso_facturable)}</td>
            <td className="border border-black px-1.5 py-1 text-right tabular-nums">{formatUsd(t.fob)}</td>
          </tr>
        </tfoot>
      </table>
    </Sheet>
  )
}

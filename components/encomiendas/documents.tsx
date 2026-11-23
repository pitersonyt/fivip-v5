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

const up = (v: string | null | undefined) => (v ? v.toLocaleUpperCase('es') : '')
const joinUp = (...parts: (string | null | undefined)[]) => up(parts.filter(Boolean).join(', '))
const envCode = (s: ShipmentDocument['shipment']) => up(s.codigo_env ?? s.codigo)

function A4Page({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <article
      className={`mx-auto my-6 flex w-full max-w-[210mm] flex-col bg-white p-6 text-black shadow-sm sm:p-[12mm] print:my-0 print:h-[277mm] print:max-w-none print:break-after-page print:overflow-hidden print:p-0 print:shadow-none print:last:break-after-auto ${className}`}
    >
      {children}
    </article>
  )
}

function Row({ label, value, className = '' }: { label: string; value: React.ReactNode; className?: string }) {
  return (
    <div className={`flex min-h-7 items-stretch border-b border-black last:border-b-0 ${className}`}>
      <span className="flex w-32 shrink-0 items-center border-r border-black bg-neutral-100 px-2 text-[10px] font-bold uppercase">
        {label}
      </span>
      <span className="flex flex-1 items-center px-2 text-[12px] font-semibold uppercase">{value || '\u00A0'}</span>
    </div>
  )
}

function BlockTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="border-b border-black bg-black px-2 py-1 text-[11px] font-bold uppercase tracking-widest text-white">
      {children}
    </h2>
  )
}

export function DeclarationDoc({ doc }: { doc: ShipmentDocument }) {
  const { shipment: s, contenido } = doc
  const lines = Array.from({ length: Math.max(DECLARATION_LINES, contenido.length) }, (_, i) => contenido[i])
  const linesTotal = contenido.some((l) => l.valor_usd != null)
    ? contenido.reduce((sum, l) => sum + (Number(l.valor_usd) || 0), 0)
    : null
  const total = s.valor_fob ?? linesTotal

  return (
    <A4Page className="gap-3 text-[12px]">
      <header className="flex items-center justify-between gap-4 border-2 border-black p-3">
        <div className="flex items-center gap-2">
          <span className="flex size-10 items-center justify-center bg-black text-sm font-bold text-white">FV</span>
          <div className="leading-tight">
            <p className="text-base font-black">FIVIP</p>
            <p className="text-[9px] font-semibold uppercase">Encomiendas Perú – Venezuela</p>
          </div>
        </div>
        <h1 className="text-center text-lg font-black uppercase tracking-wide sm:text-xl">DECLARACION JURADA DE VALOR</h1>
        <dl className="text-right text-[10px] uppercase leading-snug">
          <div>
            <dt className="inline font-bold">ENV: </dt>
            <dd className="inline font-mono text-[13px] font-black">{envCode(s)}</dd>
          </div>
          <div>
            <dt className="inline font-bold">Fecha: </dt>
            <dd className="inline">{formatDate(s.fecha_recepcion ?? s.created_at)}</dd>
          </div>
        </dl>
      </header>

      <div className="grid grid-cols-2 gap-3">
        <section className="border border-black">
          <BlockTitle>Remitente</BlockTitle>
          <Row label="Nombre" value={up(s.remitente_nombre)} />
          <Row label="Documento" value={up(s.remitente_documento)} />
          <Row label="Teléfono" value={s.remitente_telefono} />
          <Row label="Dirección / ciudad" value={joinUp(s.remitente_direccion, s.remitente_ciudad, s.remitente_pais)} />
        </section>
        <section className="border border-black">
          <BlockTitle>Destinatario</BlockTitle>
          <Row label="Nombre" value={up(s.destinatario_nombre)} />
          <Row label="Documento" value={up(s.destinatario_documento)} />
          <Row label="Teléfono" value={s.destinatario_telefono} />
          <Row label="Estado / ciudad" value={joinUp(s.destinatario_estado, s.destinatario_ciudad)} />
          <Row label="Agencia ZOOM" value={up(s.agencia_zoom)} />
          <Row label="Código ENV" value={<span className="font-mono">{envCode(s)}</span>} />
        </section>
      </div>

      <section className="border border-black">
        <BlockTitle>Mercancía</BlockTitle>
        <table className="w-full border-collapse text-[11px]">
          <thead>
            <tr className="bg-neutral-100 text-[10px] uppercase">
              <th className="w-8 border-b border-r border-black px-1 py-1">N.º</th>
              <th className="border-b border-r border-black px-2 py-1 text-left">Descripción y características</th>
              <th className="w-16 border-b border-r border-black px-1 py-1">Cantidad</th>
              <th className="w-28 border-b border-r border-black px-2 py-1 text-left">Marca</th>
              <th className="w-24 border-b border-black px-2 py-1 text-right">Valor USD</th>
            </tr>
          </thead>
          <tbody>
            {lines.map((l, i) => (
              <tr key={i} className="h-7 uppercase">
                <td className="border-b border-r border-black text-center font-mono">{i + 1}</td>
                <td className="border-b border-r border-black px-2">{up(l?.descripcion)}</td>
                <td className="border-b border-r border-black text-center tabular-nums">{l?.cantidad ?? ''}</td>
                <td className="border-b border-r border-black px-2">{up(l?.marca)}</td>
                <td className="border-b border-black px-2 text-right tabular-nums">
                  {l?.valor_usd != null ? formatUsd(l.valor_usd) : ''}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="text-[12px] font-black uppercase">
              <td colSpan={4} className="border-r border-black px-2 py-1.5 text-right">Total FOB / Total USD</td>
              <td className="px-2 py-1.5 text-right tabular-nums">{total != null ? formatUsd(total) : ''}</td>
            </tr>
          </tfoot>
        </table>
      </section>

      <section className="border-2 border-black p-2 text-[10px] leading-snug">
        <p className="font-black uppercase">Aviso importante</p>
        <p className="text-pretty">
          ESTÁ PROHIBIDO EL ENVÍO DE DINERO EN EFECTIVO, ARMAS, MUNICIONES, EXPLOSIVOS, DROGAS, SUSTANCIAS
          PSICOTRÓPICAS, MATERIALES INFLAMABLES O PELIGROSOS, ANIMALES, PERECIBLES Y CUALQUIER MERCANCÍA DE
          PROHIBIDA O RESTRINGIDA CIRCULACIÓN. LA MERCANCÍA PUEDE SER INSPECCIONADA POR LAS AUTORIDADES
          COMPETENTES. EL VALOR DECLARADO ES RESPONSABILIDAD EXCLUSIVA DEL REMITENTE.
        </p>
      </section>

      <section className="text-[11px] leading-relaxed">
        <p className="font-black uppercase">Declaración</p>
        <p className="text-pretty">
          {`YO, ${up(s.remitente_nombre)}${s.remitente_documento ? `, IDENTIFICADO(A) CON DOCUMENTO N.º ${up(s.remitente_documento)}` : ''}, DECLARO BAJO JURAMENTO QUE EL CONTENIDO Y EL VALOR DE LA MERCANCÍA DETALLADA EN EL PRESENTE DOCUMENTO SON VERDADEROS, QUE LA MERCANCÍA ES DE MI PROPIEDAD, QUE NO CONTIENE ARTÍCULOS PROHIBIDOS NI RESTRINGIDOS Y QUE ASUMO TODA RESPONSABILIDAD LEGAL POR CUALQUIER FALSEDAD U OMISIÓN EN LA INFORMACIÓN DECLARADA.`}
        </p>
      </section>

      <div className="mt-auto grid grid-cols-2 gap-12 pt-12 text-center text-[10px] font-bold uppercase">
        <div className="border-t border-black pt-1">
          Firma remitente
          <p className="font-normal">{up(s.remitente_nombre)}</p>
        </div>
        <div className="border-t border-black pt-1">
          Revisado
          <p className="font-normal">FIVIP · {s.revisado ? 'CONFORME' : 'NOMBRE Y FIRMA'}</p>
        </div>
      </div>
    </A4Page>
  )
}

const dims = (p: ShipmentDocument['paquetes'][number]) =>
  p.largo && p.ancho && p.alto ? `${p.largo} x ${p.ancho} x ${p.alto} CM` : '—'

const weight = (n: number | null | undefined) => (n ? `${formatKg(n)} KG` : '—')

function packageGuides(doc: ShipmentDocument, numero: number) {
  const own = doc.guias.filter((g) => g.paquete_numero === numero)
  if (own.length) return own.map((g) => g.numero_guia)
  const shared = doc.guias.filter((g) => g.paquete_numero === null)
  if (shared.length === doc.paquetes.length && doc.paquetes.length > 1) {
    const index = doc.paquetes.findIndex((p) => p.numero === numero)
    return shared[index] ? [shared[index].numero_guia] : []
  }
  return shared.map((g) => g.numero_guia)
}

function LabelHeader({ title }: { title: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b-2 border-black pb-2">
      <div className="flex items-center gap-2">
        <span className="flex size-9 items-center justify-center bg-black text-xs font-bold text-white">FV</span>
        <span className="text-lg font-black">FIVIP</span>
      </div>
      <p className="text-sm font-black uppercase tracking-[0.3em]">{title}</p>
      <span className="border-2 border-black px-2 py-0.5 text-lg font-black italic tracking-widest">ZOOM</span>
    </div>
  )
}

function Cell({ label, value, big }: { label: string; value: React.ReactNode; big?: boolean }) {
  return (
    <div className="flex flex-col border border-black px-2 py-1">
      <span className="text-[9px] font-bold uppercase text-neutral-600">{label}</span>
      <span className={`${big ? 'text-base' : 'text-[12px]'} font-bold uppercase leading-tight`}>{value || '—'}</span>
    </div>
  )
}

export function LabelDoc({ doc }: { doc: ShipmentDocument }) {
  const { shipment: s, paquetes } = doc
  const total = paquetes.length || s.cantidad_paquetes
  const fecha = formatDate(s.fecha_recepcion ?? s.created_at)

  if (paquetes.length === 0) {
    return (
      <A4Page>
        <LabelHeader title="Etiqueta" />
        <p className="mt-6 border border-dashed border-black p-6 text-center text-sm">
          Esta encomienda no tiene paquetes registrados.
        </p>
      </A4Page>
    )
  }

  return (
    <>
      {paquetes.map((p) => {
        const guides = packageGuides(doc, p.numero)
        const showVol = p.peso_volumetrico != null && p.peso_volumetrico > 0
        const showFact = p.peso_facturable != null && p.peso_facturable > 0
        return (
          <A4Page key={p.numero}>
            <section aria-label={`Etiqueta paquete ${p.numero}`} className="flex flex-1 flex-col gap-3 border-2 border-black p-4">
              <LabelHeader title="Etiqueta" />
              <div className="flex flex-col items-center gap-1 py-1 text-center">
                <span className="text-[10px] font-bold uppercase">Código ENV</span>
                <p className="font-mono text-4xl font-black tracking-wider sm:text-5xl">{envCode(s)}</p>
                {total > 1 && (
                  <p className="border-2 border-black px-3 py-0.5 text-sm font-black uppercase">{`Paquete ${p.numero} de ${total}`}</p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-0">
                <div className="col-span-2"><Cell label="Destinatario" value={up(s.destinatario_nombre)} big /></div>
                <Cell label="Documento" value={up(s.destinatario_documento)} />
                <Cell label="Teléfono" value={s.destinatario_telefono} />
                <Cell label="Destino (ciudad / estado)" value={joinUp(s.destinatario_ciudad, s.destinatario_estado)} />
                <Cell label="Fecha" value={fecha} />
                <div className="col-span-2"><Cell label="Agencia ZOOM" value={up(s.agencia_zoom)} big /></div>
              </div>
              <div className="grid grid-cols-2 gap-0 sm:grid-cols-4 print:grid-cols-4">
                <Cell label="Medidas" value={dims(p)} />
                <Cell label="Peso físico" value={weight(p.peso_fisico)} />
                <Cell label="Peso volumétrico" value={showVol ? weight(p.peso_volumetrico) : 'N/A'} />
                <Cell label="Peso facturable" value={showFact ? weight(p.peso_facturable) : 'N/A'} />
              </div>
              <Cell label="Guía ZOOM" value={<span className="font-mono text-lg">{guides.join(' · ') || 'PENDIENTE'}</span>} />
            </section>

            <div className="relative my-3 border-t-2 border-dashed border-black print:my-[4mm]" aria-hidden="true">
              <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-white px-2 text-[9px] font-bold uppercase">
                Cortar aquí
              </span>
            </div>

            <section aria-label={`Control paquete ${p.numero}`} className="flex flex-1 flex-col gap-3 border-2 border-black p-4">
              <LabelHeader title="Control" />
              <div className="grid grid-cols-3 gap-0">
                <Cell label="Código ENV" value={<span className="font-mono">{envCode(s)}</span>} big />
                <Cell label="Fecha" value={fecha} />
                <Cell label="Paquete" value={`${p.numero} de ${total}`} />
                <div className="col-span-2"><Cell label="Remitente" value={up(s.remitente_nombre)} /></div>
                <Cell label="Tel. remitente" value={s.remitente_telefono} />
                <div className="col-span-2"><Cell label="Destinatario" value={up(s.destinatario_nombre)} /></div>
                <Cell label="Documento" value={up(s.destinatario_documento)} />
                <Cell label="Tel. destinatario" value={s.destinatario_telefono} />
                <div className="col-span-2"><Cell label="Destino" value={joinUp(s.destinatario_ciudad, s.destinatario_estado)} /></div>
                <div className="col-span-3"><Cell label="Agencia ZOOM" value={up(s.agencia_zoom)} /></div>
                <Cell label="Medidas" value={dims(p)} />
                <Cell label="Físico / volumétrico" value={`${weight(p.peso_fisico)} / ${showVol ? weight(p.peso_volumetrico) : 'N/A'}`} />
                <Cell label="Facturable" value={showFact ? weight(p.peso_facturable) : 'N/A'} />
                <div className="col-span-3"><Cell label="Guía(s) ZOOM" value={<span className="font-mono">{guides.join(' · ') || 'PENDIENTE'}</span>} /></div>
              </div>
              <div className="mt-auto grid grid-cols-3 gap-6 pt-6 text-center text-[10px] font-bold uppercase">
                <div className="border-t border-black pt-1">Recibido</div>
                <div className="border-t border-black pt-1">Revisado</div>
                <div className="border-t border-black pt-1">Despachado</div>
              </div>
            </section>
          </A4Page>
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

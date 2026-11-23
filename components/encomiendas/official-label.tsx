import { formatDate } from '@/lib/encomiendas'
import type { ShipmentDocument } from '@/lib/encomiendas-data'

// Code 39: nine alternating bars/spaces per symbol; set bits denote wide elements.
const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ-. $/+%*'
const widths = [0x034,0x121,0x061,0x160,0x031,0x130,0x070,0x025,0x124,0x064,0x109,0x049,0x148,0x019,0x118,0x058,0x00d,0x10c,0x04c,0x01c,0x103,0x043,0x142,0x013,0x112,0x052,0x007,0x106,0x046,0x016,0x181,0x0c1,0x1c0,0x091,0x190,0x0d0,0x085,0x184,0x0c4,0x0a8,0x0a2,0x08a,0x02a,0x094]
function Barcode({ code }: { code: string }) {
  let x = 10
  const bars: string[] = []
  if (!code || [...code].some(c => c === '*' || !alphabet.includes(c))) return <p>{code}</p>
  for (const c of `*${code}*`) {
    const pattern = widths[alphabet.indexOf(c)]
    for (let i = 0; i < 9; i++) {
      const w = pattern & (1 << (8-i)) ? 3 : 1
      if (i % 2 === 0) bars.push(`M${x} 0h${w}v60h-${w}z`)
      x += w
    }
    x++
  }
  return <figure className="env-bar"><svg aria-hidden="true" viewBox={`0 0 ${x+9} 60`} preserveAspectRatio="none"><path d={bars.join('')} /></svg><figcaption>{code}</figcaption></figure>
}

function Measures({ p }: { p: ShipmentDocument['paquetes'][number] }) {
  return <table className="measures"><colgroup>{[28.5,28.5,14.3,14.3,14.4].map((w,i) => <col key={i} style={{width:`${w}%`}} />)}</colgroup><thead><tr>{['PESO FÍSICO','PESO VOLUMEN','LARGO','ANCHO','ALTO'].map((v,i) => <th key={v}>{v}<br/>{i < 2 ? '(KG)' : '(CM)'}</th>)}</tr></thead><tbody><tr>{[p.peso_fisico,p.peso_volumetrico,p.largo,p.ancho,p.alto].map((v,i) => <td key={i}>{v != null ? Number(v).toLocaleString('es') : ''}</td>)}</tr></tbody></table>
}
function zoomGuide(guias: ShipmentDocument['guias'], numero: number) {
  const own = guias.filter(g => g.paquete_numero === numero)
  const list = own.length ? own : guias.filter(g => g.paquete_numero === null)
  return list.map(g => g.numero_guia).join(' / ') || 'PENDIENTE'
}

function ZoomGuide({ value }: { value: string }) {
  return <p className="zoom-guide">GUÍA ZOOM: <strong>{value}</strong></p>
}

export function LabelDoc({ doc: { shipment: s, paquetes, guias } }: { doc: ShipmentDocument }) {
  const code = (s.codigo_env ?? s.codigo).toUpperCase()
  const destination = [s.destinatario_ciudad,s.destinatario_estado].filter(Boolean).join(' / ')
  if (!paquetes.length) return <article className="official pair">Esta encomienda no tiene paquetes registrados.</article>
  return <>{paquetes.map(p => <article className="official pair" key={p.numero} aria-label={`Paquete ${p.numero}`}>
    {[false,true].map(control => <section key={String(control)}>
      <h2>{control ? 'CONTROL DEL ENVÍO' : 'ETIQUETA DEL PAQUETE'}</h2>
      <table className="ident"><tbody><tr><td>CÓDIGO<strong>{code}</strong></td><td>FECHA<strong>{formatDate(s.fecha_recepcion ?? s.created_at)}</strong></td></tr></tbody></table>
      <table className="receiver"><colgroup><col style={{width:'43%'}}/><col/></colgroup>{!control && <thead><tr><th colSpan={2}>DESTINATARIO</th></tr></thead>}<tbody>{[[control?'DESTINATARIO':'NOMBRE',s.destinatario_nombre],['CÉDULA / DOCUMENTO',s.destinatario_documento],['TELÉFONO / WHATSAPP',s.destinatario_telefono],...(control ? [['DESTINO',destination],['AGENCIA',s.agencia_zoom]] : [])].map(([k,v]) => <tr key={k}><th scope="row">{k}:</th><td>{v}</td></tr>)}</tbody></table>
      {!control && <table className="dest"><colgroup><col style={{width:'43%'}}/><col/></colgroup><thead><tr><th>DESTINO</th><th>AGENCIA</th></tr></thead><tbody><tr><td>{destination}</td><td>{s.agencia_zoom}</td></tr></tbody></table>}
      <Measures p={p}/>
      {control ? <><table className="observ"><thead><tr><th>OBSERVACIONES</th></tr></thead><tbody><tr><td/></tr></tbody></table><table className="receipt"><tbody><tr><th>RECIBIDO POR:</th><th>FECHA DE RECEPCIÓN:</th></tr><tr><td>________________________</td><td>____ / ____ / ______</td></tr><tr><th>NOMBRE:</th><th>FIRMA:</th></tr><tr><td>________________________</td><td>________________________</td></tr></tbody></table><ZoomGuide value={zoomGuide(guias, p.numero)}/><footer>FIVIP · ETIQUETA V4.42</footer></> : <><Barcode code={code}/><ZoomGuide value={zoomGuide(guias, p.numero)}/></>}
    </section>)}
  </article>)}</>
}

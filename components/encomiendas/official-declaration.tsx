import type { ShipmentDocument } from '@/lib/encomiendas-data'

export function DeclarationDoc({ doc: { shipment: s, contenido } }: { doc: ShipmentDocument }) {
  const rows = Array.from({ length: 10 }, (_, i) => contenido[i])
  const total = s.valor_fob ?? (contenido.some(l => l.valor_usd != null) ? contenido.reduce((n, l) => n + Number(l.valor_usd ?? 0), 0) : null)
  return <article className="official declaration">
    <header><p>AVISO IMPORTANTE: Todas nuestras cajas pasan por rayos X. Los productos no declarados correctamente, ocultos o no visibles pueden generar decomiso.</p><p>El remitente se somete a sanciones administrativas, civiles o penales.</p></header>
    <h1>DECLARACION JURADA DE VALOR</h1>
    <h2>1. DATOS DEL REMITENTE</h2>
    <table><tbody><tr><td>NOMBRE: {s.remitente_nombre}</td><td>CÉDULA: {s.remitente_documento}</td></tr><tr><td>DIRECCIÓN: {s.remitente_direccion}</td><td>TELÉFONO: {s.remitente_telefono}</td></tr></tbody></table>
    <h2>2. DATOS DEL DESTINATARIO</h2>
    <table><tbody><tr><td>NOMBRE: {s.destinatario_nombre}</td><td>CÉDULA: {s.destinatario_documento}</td></tr><tr><td>TELÉFONO: {s.destinatario_telefono}</td><td>DESTINO: {[s.destinatario_ciudad, s.destinatario_estado].filter(Boolean).join(' / ')}</td></tr><tr><td>AGENCIA: {s.agencia_zoom}</td><td>CÓDIGO ENV: {s.codigo_env ?? s.codigo}</td></tr></tbody></table>
    <h2>3. DETALLE DE LA MERCANCÍA DECLARADA</h2>
    <table className="goods"><colgroup>{['5%', '62.5%', '9.5%', '23%'].map(w => <col key={w} style={{ width: w }} />)}</colgroup><thead><tr>{['N°','DESCRIPCIÓN','CANT.','VALOR TOTAL (USD)'].map(t => <th key={t}>{t}</th>)}</tr></thead><tbody>{rows.map((l,i) => <tr key={i}><td>{i+1}</td><td>{l?.descripcion}</td><td>{l?.cantidad}</td><td>{l?.valor_usd != null ? Number(l.valor_usd).toFixed(2) : ''}</td></tr>)}</tbody></table>
    <table className="decl-total"><tbody><tr><th>VALOR TOTAL DECLARADO (USD):</th><td>{total != null ? `$ ${Number(total).toFixed(2)}` : ''}</td></tr></tbody></table>
    <h2>4. DECLARACIÓN</h2>
    <p className="legal">Declaro bajo juramento que la información suministrada es verdadera y corresponde al contenido de la encomienda descrita anteriormente. Asimismo, manifiesto que no he ocultado mercancía ni incluido artículos diferentes a los declarados.</p>
    <table className="sign"><thead><tr><th>FIRMA DEL REMITENTE</th><th>REVISADO POR</th></tr></thead><tbody><tr><td>________________________</td><td>________________________</td></tr><tr><td>NOMBRE: {s.remitente_nombre} | CÉDULA: {s.remitente_documento}</td><td>NOMBRE: __________ | FECHA: ___/___/___</td></tr></tbody></table>
  </article>
}

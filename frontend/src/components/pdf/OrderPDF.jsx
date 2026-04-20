import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

// ─── LOGO: mismo dominio → sin CORS ──────────────────────────────────────────
const LOGO_URL = 'https://pedidos.bonettoconamor.com/logo.png';

const C = {
  indigo:  '#4f46e5',
  green:   '#10b981',
  gray:    '#64748b',
  light:   '#f8fafc',
  border:  '#e2e8f0',
  dark:    '#1e293b',
  white:   '#ffffff',
  accent:  '#818cf8',
};

const styles = StyleSheet.create({
  page: {
    padding: 40,
    backgroundColor: C.white,
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: C.dark,
  },
  // ── Header ────────────────────────────────────────────────────────────────
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 18,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    marginBottom: 22,
  },
  logo: {
    width: 130,
    height: 57,
  },
  orderBlock: {
    alignItems: 'flex-end',
  },
  orderTitle: {
    fontSize: 20,
    fontFamily: 'Helvetica-Bold',
    color: C.dark,
  },
  orderMeta: {
    fontSize: 9,
    color: C.gray,
    marginTop: 3,
  },
  estadoBadge: {
    marginTop: 5,
    paddingVertical: 3,
    paddingHorizontal: 10,
    backgroundColor: C.light,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: C.border,
    alignSelf: 'flex-end',
  },
  estadoText: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: C.indigo,
  },
  // ── Info box ──────────────────────────────────────────────────────────────
  infoBox: {
    backgroundColor: C.light,
    padding: 14,
    borderRadius: 6,
    marginBottom: 22,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: C.border,
  },
  infoGroup: {
    flexDirection: 'column',
  },
  infoLabel: {
    fontSize: 7,
    color: C.gray,
    marginBottom: 3,
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: C.dark,
  },
  // ── Table ─────────────────────────────────────────────────────────────────
  sectionTitle: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: C.gray,
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: C.dark,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 4,
    marginBottom: 2,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 9,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  tableRowAlt: {
    backgroundColor: '#fafafa',
  },
  colSku:   { width: '16%' },
  colName:  { width: '46%' },
  colQty:   { width: '10%', textAlign: 'center' },
  colPrice: { width: '14%', textAlign: 'right' },
  colTotal: { width: '14%', textAlign: 'right' },
  thText: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: C.white,
  },
  tdText: {
    fontSize: 9,
    color: C.dark,
  },
  tdBold: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: C.dark,
  },
  tdMono: {
    fontSize: 8,
    color: C.indigo,
    fontFamily: 'Helvetica-Oblique',
  },
  tdGreen: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: C.green,
    textAlign: 'right',
  },
  // ── Total ─────────────────────────────────────────────────────────────────
  totalSection: {
    marginTop: 16,
    alignItems: 'flex-end',
  },
  totalBox: {
    backgroundColor: C.dark,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  totalLabel: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: C.white,
  },
  totalValue: {
    fontSize: 20,
    fontFamily: 'Helvetica-Bold',
    color: C.green,
  },
  // ── Note ──────────────────────────────────────────────────────────────────
  noteBox: {
    marginTop: 22,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: C.indigo,
    backgroundColor: '#eff6ff',
    borderRadius: 4,
  },
  noteLabel: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    color: C.indigo,
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  noteText: {
    fontSize: 9,
    color: '#1d4ed8',
  },
  // ── Footer ────────────────────────────────────────────────────────────────
  footer: {
    position: 'absolute',
    bottom: 28,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 8,
    color: C.gray,
    borderTopWidth: 1,
    borderTopColor: C.border,
    paddingTop: 8,
  },
});

// ─── Helpers ──────────────────────────────────────────────────────────────────
const safe = (v, fallback = '') => (v !== null && v !== undefined && v !== '' ? String(v) : fallback);
const money = (v) => '$' + (parseFloat(v) || 0).toLocaleString('es-CO', { minimumFractionDigits: 0 });

// ─── Component ────────────────────────────────────────────────────────────────
const OrderPDF = ({ order }) => {
  const items   = Array.isArray(order?.items) ? order.items : [];
  const client  = safe(order?.Cliente_Nombre  || order?.Nombre_Cliente  || order?.clientName,  'No especificado');
  const asesor  = safe(order?.Usuario_Email   || order?.Email_Asesor    || order?.userEmail,   'N/A');
  const orderId = safe(order?.Pedido_ID       || order?.ID_Pedido       || order?.orderId,     'S/N');
  const fecha   = order?.Fecha
    ? new Date(order.Fecha).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })
    : 'Sin fecha';
  const estado  = safe(order?.Estado, 'Pendiente');
  const nota    = safe(order?.Nota || order?.Notas || order?.note);

  const total = items.reduce(
    (sum, i) => sum + (parseFloat(i.Subtotal ?? i.Total_Item ?? i.subtotal ?? 0) || 0),
    0
  );

  return (
    <Document title={`Pedido_${orderId}`}>
      <Page size="A4" style={styles.page}>

        {/* ── Header con logo (mismo dominio → sin CORS) ── */}
        <View style={styles.header}>
          <Image src={LOGO_URL} style={styles.logo} />
          <View style={styles.orderBlock}>
            <Text style={styles.orderTitle}>PEDIDO #{orderId}</Text>
            <Text style={styles.orderMeta}>{fecha}</Text>
            <View style={styles.estadoBadge}>
              <Text style={styles.estadoText}>{estado}</Text>
            </View>
          </View>
        </View>

        {/* ── Info cliente / asesor ── */}
        <View style={styles.infoBox}>
          <View style={styles.infoGroup}>
            <Text style={styles.infoLabel}>CLIENTE</Text>
            <Text style={styles.infoValue}>{client}</Text>
          </View>
          <View style={styles.infoGroup}>
            <Text style={styles.infoLabel}>ASESOR COMERCIAL</Text>
            <Text style={styles.infoValue}>{asesor}</Text>
          </View>
        </View>

        {/* ── Tabla de productos (sin imágenes: CORS bloqueado por WordPress) ── */}
        <Text style={styles.sectionTitle}>DETALLE DEL PEDIDO</Text>

        <View style={styles.tableHeader}>
          <View style={styles.colSku}><Text style={styles.thText}>SKU</Text></View>
          <View style={styles.colName}><Text style={styles.thText}>PRODUCTO</Text></View>
          <View style={styles.colQty}><Text style={styles.thText}>CANT.</Text></View>
          <View style={styles.colPrice}><Text style={styles.thText}>P. UNIT.</Text></View>
          <View style={styles.colTotal}><Text style={styles.thText}>SUBTOTAL</Text></View>
        </View>

        {items.length === 0 ? (
          <View style={styles.tableRow}>
            <Text style={[styles.tdText, { color: C.gray }]}>Sin ítems registrados</Text>
          </View>
        ) : (
          items.map((item, idx) => {
            const name     = safe(item.Producto_Nombre ?? item.name ?? item.Nombre, 'Producto');
            const sku      = safe(item.SKU ?? item.sku, '—');
            const qty      = safe(item.Qty ?? item.Cantidad ?? item.qty, '0');
            const unitP    = parseFloat(item.Precio_Final ?? item.priceFinal ?? 0);
            const subtotal = parseFloat(item.Subtotal ?? item.Total_Item ?? item.subtotal ?? (unitP * parseFloat(qty))) || 0;
            const isAlt    = idx % 2 === 1;

            return (
              <View key={idx} style={[styles.tableRow, isAlt && styles.tableRowAlt]}>
                <View style={styles.colSku}>
                  <Text style={styles.tdMono}>{sku}</Text>
                </View>
                <View style={styles.colName}>
                  <Text style={styles.tdBold}>{name}</Text>
                </View>
                <View style={styles.colQty}>
                  <Text style={[styles.tdText, { textAlign: 'center' }]}>{qty}</Text>
                </View>
                <View style={styles.colPrice}>
                  <Text style={[styles.tdText, { textAlign: 'right' }]}>{money(unitP)}</Text>
                </View>
                <View style={styles.colTotal}>
                  <Text style={styles.tdGreen}>{money(subtotal)}</Text>
                </View>
              </View>
            );
          })
        )}

        {/* ── Total ── */}
        <View style={styles.totalSection}>
          <View style={styles.totalBox}>
            <Text style={styles.totalLabel}>TOTAL DEL PEDIDO</Text>
            <Text style={styles.totalValue}>{money(total)}</Text>
          </View>
        </View>

        {/* ── Nota ── */}
        {nota ? (
          <View style={styles.noteBox}>
            <Text style={styles.noteLabel}>OBSERVACIONES</Text>
            <Text style={styles.noteText}>{nota}</Text>
          </View>
        ) : null}

        {/* ── Footer ── */}
        <Text style={styles.footer}>
          Bonetto con Amor · Comprobante de Pedido · {new Date().getFullYear()}
        </Text>

      </Page>
    </Document>
  );
};

export default OrderPDF;

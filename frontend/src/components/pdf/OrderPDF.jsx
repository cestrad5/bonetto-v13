import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

// ─── NO external fonts, NO external images ───────────────────────────────────
// Using built-in Helvetica to guarantee the PDF always renders, even offline.

const C = {
  indigo: '#4f46e5',
  green:  '#10b981',
  gray:   '#64748b',
  light:  '#f8fafc',
  border: '#e2e8f0',
  dark:   '#1e293b',
  white:  '#ffffff',
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
    alignItems: 'flex-start',
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    marginBottom: 24,
  },
  brandName: {
    fontSize: 22,
    fontFamily: 'Helvetica-Bold',
    color: C.indigo,
  },
  brandSub: {
    fontSize: 9,
    color: C.gray,
    marginTop: 2,
  },
  orderTitle: {
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'right',
    color: C.dark,
  },
  orderMeta: {
    fontSize: 9,
    color: C.gray,
    textAlign: 'right',
    marginTop: 3,
  },
  // ── Info box ──────────────────────────────────────────────────────────────
  infoBox: {
    backgroundColor: C.light,
    padding: 12,
    borderRadius: 6,
    marginBottom: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoLabel: {
    fontSize: 8,
    color: C.gray,
    marginBottom: 3,
    fontFamily: 'Helvetica-Bold',
  },
  infoValue: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: C.dark,
  },
  // ── Table ─────────────────────────────────────────────────────────────────
  sectionTitle: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: C.gray,
    letterSpacing: 1,
    marginBottom: 8,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: C.light,
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: 4,
    marginBottom: 4,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  colSku:    { width: '18%' },
  colName:   { width: '42%' },
  colQty:    { width: '10%', textAlign: 'center' },
  colPrice:  { width: '15%', textAlign: 'right' },
  colTotal:  { width: '15%', textAlign: 'right' },
  thText: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: C.gray,
  },
  tdText: {
    fontSize: 9,
    color: C.dark,
  },
  tdMono: {
    fontSize: 8,
    color: C.indigo,
    fontFamily: 'Helvetica-Oblique',
  },
  // ── Totals ────────────────────────────────────────────────────────────────
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 2,
    borderTopColor: C.dark,
    gap: 10,
  },
  totalLabel: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: C.dark,
  },
  totalValue: {
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
    color: C.green,
  },
  // ── Notes ─────────────────────────────────────────────────────────────────
  noteBox: {
    marginTop: 24,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: C.indigo,
    backgroundColor: '#eff6ff',
  },
  noteLabel: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: C.indigo,
    marginBottom: 4,
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
const safe = (v, fallback = '') => (v !== null && v !== undefined ? String(v) : fallback);
const money = (v) => {
  const n = parseFloat(v) || 0;
  return '$' + n.toLocaleString('es-CO', { minimumFractionDigits: 0 });
};

// ─── Component ────────────────────────────────────────────────────────────────
const OrderPDF = ({ order }) => {
  // Support both naming conventions: Google Sheets fields vs cart fields
  const items  = Array.isArray(order?.items) ? order.items : [];
  const client = safe(order?.Nombre_Cliente || order?.clientName, 'No especificado');
  const asesor = safe(order?.Asesor || order?.Email_Asesor || order?.userEmail, 'N/A');
  const orderId = safe(order?.ID_Pedido || order?.orderId, 'S/N');
  const fecha   = order?.Fecha
    ? new Date(order.Fecha).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })
    : 'Sin fecha';
  const estado  = safe(order?.Estado, 'Pendiente');
  const nota    = safe(order?.Notas || order?.Notas_Pedido || order?.note);

  const total = items.reduce((sum, i) => {
    const v = parseFloat(i.Total_Item ?? i.subtotal ?? (parseFloat(i.priceFinal) * (i.qty || i.Cantidad || 0))) || 0;
    return sum + v;
  }, 0);

  return (
    <Document title={`Pedido_${orderId}`}>
      <Page size="A4" style={styles.page}>

        {/* ── Header ── */}
        <View style={styles.header}>
          <View>
            <Text style={styles.brandName}>BONETTO</Text>
            <Text style={styles.brandSub}>con Amor</Text>
          </View>
          <View>
            <Text style={styles.orderTitle}>PEDIDO #{orderId}</Text>
            <Text style={styles.orderMeta}>{fecha}</Text>
            <Text style={styles.orderMeta}>Estado: {estado}</Text>
          </View>
        </View>

        {/* ── Client info ── */}
        <View style={styles.infoBox}>
          <View>
            <Text style={styles.infoLabel}>CLIENTE</Text>
            <Text style={styles.infoValue}>{client}</Text>
          </View>
          <View>
            <Text style={styles.infoLabel}>ASESOR COMERCIAL</Text>
            <Text style={styles.infoValue}>{asesor}</Text>
          </View>
        </View>

        {/* ── Items table ── */}
        <Text style={styles.sectionTitle}>DETALLE DEL PEDIDO</Text>

        {/* Table header */}
        <View style={styles.tableHeader}>
          <View style={styles.colSku}><Text style={styles.thText}>SKU</Text></View>
          <View style={styles.colName}><Text style={styles.thText}>PRODUCTO</Text></View>
          <View style={styles.colQty}><Text style={styles.thText}>CANT.</Text></View>
          <View style={styles.colPrice}><Text style={styles.thText}>P. UNIT.</Text></View>
          <View style={styles.colTotal}><Text style={styles.thText}>SUBTOTAL</Text></View>
        </View>

        {/* Rows */}
        {items.length === 0 ? (
          <View style={styles.tableRow}>
            <Text style={[styles.tdText, { color: C.gray }]}>Sin ítems registrados</Text>
          </View>
        ) : (
          items.map((item, idx) => {
            const name     = safe(item.Nombre_Producto ?? item.name ?? item.Nombre, 'Producto');
            const sku      = safe(item.SKU ?? item.sku, '—');
            const qty      = safe(item.Cantidad ?? item.qty, '0');
            const unitP    = parseFloat(item.Precio_Unit ?? item.priceFinal ?? 0);
            const subtotal = parseFloat(item.Total_Item ?? item.subtotal ?? (unitP * parseFloat(qty))) || 0;

            return (
              <View key={idx} style={styles.tableRow}>
                <View style={styles.colSku}><Text style={styles.tdMono}>{sku}</Text></View>
                <View style={styles.colName}><Text style={styles.tdText}>{name}</Text></View>
                <View style={styles.colQty}><Text style={styles.tdText}>{qty}</Text></View>
                <View style={styles.colPrice}><Text style={styles.tdText}>{money(unitP)}</Text></View>
                <View style={styles.colTotal}><Text style={[styles.tdText, { fontFamily: 'Helvetica-Bold' }]}>{money(subtotal)}</Text></View>
              </View>
            );
          })
        )}

        {/* ── Total ── */}
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>TOTAL DEL PEDIDO:</Text>
          <Text style={styles.totalValue}>{money(total)}</Text>
        </View>

        {/* ── Note ── */}
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

import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { LOGO_B64 } from './logoB64';

// ─── No external fonts — using built-in Helvetica ────────────────────────────

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
    alignItems: 'center',
    paddingBottom: 18,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    marginBottom: 22,
  },
  logo: {
    width: 120,
    height: 52,
    objectFit: 'contain',
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
    marginBottom: 22,
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
    paddingHorizontal: 8,
    borderRadius: 4,
    marginBottom: 2,
    alignItems: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    alignItems: 'center',
    minHeight: 72,
  },
  colImg:   { width: '16%' },
  colSku:   { width: '14%' },
  colName:  { width: '34%' },
  colQty:   { width: '8%',  textAlign: 'center' },
  colPrice: { width: '14%', textAlign: 'right' },
  colTotal: { width: '14%', textAlign: 'right' },
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
  productImg: {
    width: 56,
    height: 56,
    borderRadius: 4,
    objectFit: 'cover',
  },
  imgPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 4,
    backgroundColor: C.light,
    justifyContent: 'center',
    alignItems: 'center',
    border: `1px solid ${C.border}`,
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
    gap: 12,
  },
  totalLabel: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: C.dark,
  },
  totalValue: {
    fontSize: 20,
    fontFamily: 'Helvetica-Bold',
    color: C.green,
  },
  // ── Notes ─────────────────────────────────────────────────────────────────
  noteBox: {
    marginTop: 22,
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
const money = (v) => '$' + (parseFloat(v) || 0).toLocaleString('es-CO', { minimumFractionDigits: 0 });
const isValidUrl = (url) => {
  if (!url || typeof url !== 'string') return false;
  return url.startsWith('http://') || url.startsWith('https://');
};

// ─── Component ────────────────────────────────────────────────────────────────
const OrderPDF = ({ order }) => {
  const items    = Array.isArray(order?.items) ? order.items : [];
  const client   = safe(order?.Cliente_Nombre  || order?.Nombre_Cliente  || order?.clientName,  'No especificado');
  const asesor   = safe(order?.Usuario_Email   || order?.Email_Asesor    || order?.userEmail,   'N/A');
  const orderId  = safe(order?.Pedido_ID       || order?.ID_Pedido       || order?.orderId,     'S/N');
  const fecha    = order?.Fecha
    ? new Date(order.Fecha).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })
    : 'Sin fecha';
  const estado   = safe(order?.Estado, 'Pendiente');
  const nota     = safe(order?.Nota || order?.Notas || order?.note);

  const total = items.reduce((sum, i) => {
    return sum + (parseFloat(i.Subtotal ?? i.Total_Item ?? i.subtotal ?? 0) || 0);
  }, 0);

  return (
    <Document title={`Pedido_${orderId}`}>
      <Page size="A4" style={styles.page}>

        {/* ── Header con logo ── */}
        <View style={styles.header}>
          <Image src={LOGO_B64} style={styles.logo} />
          <View>
            <Text style={styles.orderTitle}>PEDIDO #{orderId}</Text>
            <Text style={styles.orderMeta}>{fecha}</Text>
            <Text style={styles.orderMeta}>Estado: {estado}</Text>
          </View>
        </View>

        {/* ── Info cliente / asesor ── */}
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

        {/* ── Tabla de productos ── */}
        <Text style={styles.sectionTitle}>DETALLE DEL PEDIDO</Text>

        {/* Cabecera */}
        <View style={styles.tableHeader}>
          <View style={styles.colImg}><Text style={styles.thText}>FOTO</Text></View>
          <View style={styles.colSku}><Text style={styles.thText}>SKU</Text></View>
          <View style={styles.colName}><Text style={styles.thText}>PRODUCTO</Text></View>
          <View style={styles.colQty}><Text style={styles.thText}>CANT.</Text></View>
          <View style={styles.colPrice}><Text style={styles.thText}>P. UNIT.</Text></View>
          <View style={styles.colTotal}><Text style={styles.thText}>SUBTOTAL</Text></View>
        </View>

        {/* Filas */}
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
            const imgUrl   = item.Imagen_URL || item.imageUrl || '';

            return (
              <View key={idx} style={styles.tableRow}>
                {/* Imagen del producto */}
                <View style={styles.colImg}>
                  {isValidUrl(imgUrl) ? (
                    <Image
                      src={imgUrl}
                      style={styles.productImg}
                    />
                  ) : (
                    <View style={styles.imgPlaceholder}>
                      <Text style={{ fontSize: 7, color: C.gray }}>Sin foto</Text>
                    </View>
                  )}
                </View>

                <View style={styles.colSku}>
                  <Text style={styles.tdMono}>{sku}</Text>
                </View>
                <View style={styles.colName}>
                  <Text style={styles.tdText}>{name}</Text>
                </View>
                <View style={styles.colQty}>
                  <Text style={styles.tdText}>{qty}</Text>
                </View>
                <View style={styles.colPrice}>
                  <Text style={styles.tdText}>{money(unitP)}</Text>
                </View>
                <View style={styles.colTotal}>
                  <Text style={[styles.tdText, { fontFamily: 'Helvetica-Bold' }]}>{money(subtotal)}</Text>
                </View>
              </View>
            );
          })
        )}

        {/* ── Total ── */}
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>TOTAL DEL PEDIDO:</Text>
          <Text style={styles.totalValue}>{money(total)}</Text>
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

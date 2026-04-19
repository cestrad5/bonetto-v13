import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image, Font } from '@react-pdf/renderer';

// Register fonts for a more professional look
Font.register({
  family: 'Inter',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hjp-Ek-_EeA.woff' }, // Regular
    { src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuGkyAZ9hjp-Ek-_EeA.woff', fontWeight: 'bold' } // Bold
  ]
});

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Inter',
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
    borderBottom: 1,
    borderBottomColor: '#f1f5f9',
    paddingBottom: 20,
  },
  logo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6366f1',
  },
  orderInfo: {
    textAlign: 'right',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#1e293b',
  },
  subtitle: {
    fontSize: 10,
    color: '#64748b',
    marginBottom: 2,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#1e293b',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  customerSection: {
    marginBottom: 30,
    padding: 15,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
  },
  customerLabel: {
    fontSize: 9,
    color: '#64748b',
    marginBottom: 4,
  },
  customerValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  table: {
    display: 'table',
    width: 'auto',
    marginBottom: 30,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomColor: '#f1f5f9',
    borderBottomWidth: 1,
    alignItems: 'center',
    minHeight: 80,
    paddingVertical: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f8fafc',
    borderBottomColor: '#e2e8f0',
    borderBottomWidth: 2,
    minHeight: 30,
    alignItems: 'center',
  },
  colImg: { width: '20%' },
  colDesc: { width: '40%', paddingRight: 10 },
  colQty: { width: '15%', textAlign: 'center' },
  colPrice: { width: '25%', textAlign: 'right' },
  
  headerText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#475569',
    paddingHorizontal: 5,
  },
  productImg: {
    width: 60,
    height: 60,
    borderRadius: 4,
    objectFit: 'cover',
  },
  productName: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 2,
  },
  productSku: {
    fontSize: 9,
    color: '#64748b',
  },
  cellText: {
    fontSize: 10,
    color: '#1e293b',
  },
  totalSection: {
    marginTop: 20,
    paddingTop: 15,
    borderTop: 2,
    borderTopColor: '#1e293b',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#10b981',
  },
  noteSection: {
    marginTop: 40,
    padding: 15,
    borderLeft: 4,
    borderLeftColor: '#6366f1',
    backgroundColor: '#f5f3ff',
  },
  noteTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#6366f1',
    marginBottom: 5,
  },
  noteText: {
    fontSize: 10,
    color: '#4c1d95',
    lineHeight: 1.5,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    borderTop: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 10,
    fontSize: 8,
    color: '#94a3b8',
  }
});

const OrderPDF = ({ order }) => {
  console.log("Rendering PDF for order:", order?.ID_Pedido, order);
  
  try {
    if (!order) {
      console.warn("OrderPDF: No order data provided");
      return null;
    }

    const items = order.items || [];
    const date = order.Fecha ? new Date(order.Fecha).toLocaleDateString('es-CO', {
      year: 'numeric', month: 'long', day: 'numeric'
    }) : 'Sin fecha';

    // Support both old and new naming conventions
    const calculateTotal = () => {
      return items.reduce((s, i) => {
        const val = i.Total_Item || i.subtotal || (parseFloat(i.priceFinal) * i.qty) || 0;
        return s + parseFloat(val);
      }, 0);
    };

    const totalVal = calculateTotal();

    return (
      <Document title={`Pedido_${order.ID_Pedido || 'S_N'}`}>
        <Page size="A4" style={styles.page}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.logo}>BONETTO</Text>
              <Text style={{ fontSize: 10, color: '#64748b' }}>con Amor</Text>
            </View>
            <View style={styles.orderInfo}>
              <Text style={styles.title}>PEDIDO #{String(order.ID_Pedido || 'S/N').toUpperCase()}</Text>
              <Text style={styles.subtitle}>{date}</Text>
              <Text style={styles.subtitle}>Estado: {order.Estado || 'Pendiente'}</Text>
            </View>
          </View>

          {/* Customer Info */}
          <View style={styles.customerSection}>
            <View style={{ marginBottom: 10 }}>
              <Text style={styles.customerLabel}>CLIENTE</Text>
              <Text style={styles.customerValue}>{order.Nombre_Cliente || order.clientName || 'No especificado'}</Text>
            </View>
            <View>
              <Text style={styles.customerLabel}>ASESOR COMERCIAL</Text>
              <Text style={styles.customerValue}>{order.Asesor || order.userEmail || 'N/A'}</Text>
            </View>
          </View>

          {/* Products Table */}
          <Text style={styles.sectionTitle}>Detalle del Pedido</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <View style={[styles.colDesc, { width: '60%' }]}><Text style={styles.headerText}>Producto</Text></View>
              <View style={styles.colQty}><Text style={styles.headerText}>Cant.</Text></View>
              <View style={styles.colPrice}><Text style={styles.headerText}>Subtotal</Text></View>
            </View>

            {items.map((item, index) => (
              <View key={index} style={styles.tableRow}>
                <View style={[styles.colDesc, { width: '60%' }]}>
                  <Text style={styles.productName}>{item.Nombre_Producto || item.name || item.Nombre || 'Producto'}</Text>
                  <Text style={styles.productSku}>SKU: {item.SKU || item.sku || 'N/A'}</Text>
                </View>
                <View style={styles.colQty}>
                  <Text style={styles.cellText}>{item.Cantidad || item.qty || 0}</Text>
                </View>
                <View style={styles.colPrice}>
                  <Text style={styles.cellText}>
                    ${parseFloat(item.Total_Item || item.subtotal || 0).toLocaleString('es-CO')}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          {/* Totals */}
          <View style={styles.totalSection}>
            <Text style={styles.totalLabel}>VALOR TOTAL</Text>
            <Text style={styles.totalValue}>${totalVal.toLocaleString('es-CO')}</Text>
          </View>

          {/* Notes */}
          {(order.Notas || order.Notas_Pedido || order.note) && (
            <View style={styles.noteSection}>
              <Text style={styles.noteTitle}>OBSERVACIONES</Text>
              <Text style={styles.noteText}>{order.Notas || order.Notas_Pedido || order.note}</Text>
            </View>
          )}

          {/* Footer */}
          <Text style={styles.footer}>
            Bonetto con Amor - Todos los derechos reservados © {new Date().getFullYear()}
          </Text>
        </Page>
      </Document>
    );
  } catch (error) {
    console.error("CRITICAL PDF ERROR:", error);
    return (
      <Document>
        <Page size="A4">
          <View style={{ padding: 40 }}>
            <Text>Error al generar el PDF.</Text>
            <Text style={{ fontSize: 10, marginTop: 10 }}>{error.message}</Text>
          </View>
        </Page>
      </Document>
    );
  }
};

export default OrderPDF;

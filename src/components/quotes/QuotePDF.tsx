// components/QuotePDF.tsx
import { Document, Font, Image, Page, StyleSheet, Text, View } from '@react-pdf/renderer'
import { Quote } from '../../types'
import { formatCurrency } from '../../utils/currency'
import { formatDate } from '../../utils/date'
import { getQuoteID } from '../../utils/strings'

// Registrar fuente Inter
Font.register({
  family: 'Inter',
  fonts: [{ src: `/fonts/inter/Inter-Regular.ttf` }, { src: `/fonts/inter/Inter-SemiBold.ttf`, fontWeight: 'bold' }]
})

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 10, fontFamily: 'Inter' },
  logo: { width: 100, height: 79, marginBottom: 20 },
  header: { marginBottom: 20 },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  section: { marginBottom: 10 },
  row: { flexDirection: 'row' },
  cell: { width: 80, padding: 4 },
  cellQty: { width: 60, padding: 4, marginRight: 4, textAlign: 'right' },
  cellDescription: { flex: 1, padding: 4 },
  padding4: { padding: 4 },
  fontTotal: { fontSize: 11, fontWeight: 'bold' },
  tableHeader: { backgroundColor: '#eee', borderBottom: '1 solid #000' },
  tableRow: { borderBottom: '0.5 solid #ccc' },
  rightAlign: { textAlign: 'right' },
  leftAlign: { textAlign: 'left' },
  centerAlign: { textAlign: 'center', alignSelf: 'center' }
})

export const QuotePDF = ({ quote }: { quote: Quote }) => {
  // Calcular IVA al vuelo
  const ivaRate = 0.16
  const subtotal = quote.total / (1 + ivaRate)
  const taxes = quote.total - subtotal

  return (
    <Document>
      <Page size='LETTER' style={styles.page}>
        {/* ENCABEZADO */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
          <Image style={styles.logo} src='/branding/logo-interdeco-full.png' />

          <View style={(styles.header, { alignItems: 'flex-end' })}>
            <Text style={[styles.title]}>Cotización #{getQuoteID(quote)}</Text>
            {quote.customer_name && <Text>Cliente: {quote.customer_name}</Text>}
            <Text>
              Fecha: {quote.created_at ? formatDate(quote.created_at, { style: 'fullDay' }) : formatDate(new Date(), { style: 'fullDay' })}
            </Text>
          </View>
        </View>

        {/* CUERPO DE PRODUCTOS */}
        <View style={[styles.section, styles.tableHeader, styles.row]}>
          <Text style={[styles.cellQty]}>Cantidad</Text>
          <Text style={styles.cellDescription}>Descripción</Text>
          <Text style={[styles.cell, styles.rightAlign]}>Unitario</Text>
          <Text style={[styles.cell, styles.rightAlign]}>Precio</Text>
        </View>

        {(quote.items ?? []).map((item, index) => {
          if (!item.product) return null // Asegurarse de que el producto exista
          const unitPrice = (item.product.price ?? 0) * (1 + (item.product.utility ?? 0) / 100)
          return (
            <View key={index}>
              <View style={item.discount ? styles.row : [styles.tableRow, styles.row]}>
                <Text style={[styles.cellQty]}>{item.totalQuantity.toFixed(2)}</Text>
                <Text style={styles.cellDescription}>
                  <Text style={{ fontWeight: 'bold' }}>{item.product.sku} </Text>
                  {item.product.spec} {item.product.description}{' '}
                  {item.packagesRequired &&
                    item.packagesRequired > 1 &&
                    item.packagesRequired &&
                    item.packagesRequired != item.requiredQuantity &&
                    `(${item.packagesRequired} paquetes)`}
                </Text>
                <Text style={[styles.cell, styles.rightAlign]}>{formatCurrency(unitPrice)}</Text>
                <Text style={item.discount ? [styles.cell, styles.rightAlign] : [styles.cell, styles.rightAlign, { fontWeight: 'bold' }]}>
                  {formatCurrency(item.discount ? (item.originalSubtotal ?? 0) : (item.subtotal ?? 0))}
                </Text>
              </View>
              {item.discount && (
                <>
                  <View key={`dis-${index}`} style={styles.row}>
                    <Text style={[styles.cellQty, styles.leftAlign]}></Text>
                    <Text style={styles.cellDescription}>Descuento {item.discountType === 'percentage' && `${item.discount}%`}</Text>
                    <Text style={[styles.cell, styles.rightAlign]}></Text>
                    <Text style={[styles.cell, styles.rightAlign]}>
                      -
                      {item.discountType === 'percentage'
                        ? formatCurrency(((item.originalSubtotal ?? 0) * (item.discount ?? 0)) / 100)
                        : formatCurrency(item.discount)}
                    </Text>
                  </View>
                  <View key={index} style={[styles.tableRow, styles.row]}>
                    <Text style={[styles.cell, styles.leftAlign]}></Text>
                    <Text style={styles.cellDescription}></Text>
                    <Text style={[styles.cell, styles.rightAlign]}></Text>
                    <Text style={[styles.cell, styles.rightAlign, { fontWeight: 'bold' }]}>{formatCurrency(item.subtotal)}</Text>
                  </View>
                </>
              )}
            </View>
          )
        })}

        {/* RESUMEN DE TOTALES */}
        <View style={[styles.section, { marginTop: 5, flexDirection: 'row', justifyContent: 'space-between' }]}>
          {/* Columna Izquierda: Texto */}
          <View style={{ marginTop: 10, flex: 2 }}>
            <Text>Quedamos a sus órdenes por cualquier duda o comentario al respecto.</Text>
            <Text>Atentamente · Sandra Briseño</Text>
            <Text>Interdeco · hola@interdeco.mx</Text>
          </View>

          {/* Columna Derecha: Totales */}
          <View style={{ flex: 1, flexGrow: 1 }}>
            <View style={styles.row}>
              <Text style={{ flex: 1 }} />
              <Text style={[styles.rightAlign, styles.padding4]}>Subtotal:</Text>
              <Text style={[styles.cell, styles.rightAlign]}>{formatCurrency(subtotal)}</Text>
            </View>
            <View style={styles.row}>
              <Text style={{ flex: 1 }} />
              <Text style={[styles.cell, styles.rightAlign]}>IVA ({(ivaRate * 100).toFixed(0)}%):</Text>
              <Text style={[styles.cell, styles.rightAlign]}>{formatCurrency(taxes)}</Text>
            </View>
            <View style={styles.row}>
              <Text style={{ flex: 1 }} />
              <Text style={[styles.cell, styles.rightAlign]}>Total:</Text>
              <Text style={[styles.cell, styles.rightAlign, styles.fontTotal]}>{formatCurrency(quote.total)}</Text>
            </View>
          </View>
        </View>

        {/* FOOTER */}
        <View style={{ fontSize: 8 }}>
          <Text style={{ marginBottom: 5, fontSize: 9 }}>
            Todo trabajo requiere de un 60% de anticipo, el cual se podrá pagar en efectivo, mediante depósito o transferencia electrónica a
            la cuenta de Banorte número 0438767692, con Clabe Interbancaria: 072197004387676926 a nombre de Sandra Montserrat Briseño
            Hidalgo.
          </Text>
          <Text>• Vigencia de la cotización 7 días naturales.</Text>
          <Text>• Precios sujetos a cambio sin previo aviso y sujetos a existencia.</Text>
          <Text>• Una vez realizado el pedido no se aceptan cambios de material ni cancelaciones.</Text>
          <Text>• Los tiempos de entrega varían dependiendo del material.</Text>
          <Text>• Mejoramos cualquier presupuesto presentado por escrito.</Text>
          <Text>• Trabajo 100% garantizado.</Text>
        </View>
      </Page>
    </Document>
  )
}

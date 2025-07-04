// components/QuotePDF.tsx
import { Document, Font, Image, Page, StyleSheet, Text, View } from '@react-pdf/renderer'
import { Quote } from '../../types'
import { formatCurrency } from '../../utils/currency'
import { formatDate } from '../../utils/date'

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
        <Image style={styles.logo} src='/branding/logo-interdeco-full.png' />
        <View style={styles.header}>
          <Text style={styles.title}>Cotización #{quote.id}</Text>
          {quote.customer_name && <Text>Cliente: {quote.customer_name}</Text>}
          <Text>Fecha: {quote.created_at ? formatDate(quote.created_at) : formatDate(new Date(), { style: 'fullDay' })}</Text>
        </View>

        {/* CUERPO DE PRODUCTOS */}
        <View style={[styles.section, styles.tableHeader, styles.row]}>
          <Text style={[styles.cell, styles.leftAlign]}>Cantidad</Text>
          <Text style={styles.cellDescription}>Descripción</Text>
          <Text style={[styles.cell, styles.rightAlign]}>Unitario</Text>
          <Text style={[styles.cell, styles.rightAlign]}>Precio</Text>
        </View>

        {(quote.items ?? []).map((item, index) => {
          if (!item.product) return null // Asegurarse de que el producto exista
          const unitPrice = (item.product.price ?? 0) * (1 + (item.product.utility ?? 0) / 100)
          return (
            <View key={index} style={[styles.tableRow, styles.row]}>
              <Text style={[styles.cell, styles.leftAlign]}>{item.totalQuantity.toFixed(2)}</Text>
              <Text style={styles.cellDescription}>
                <Text style={{ fontWeight: 'bold' }}>{item.product.sku} </Text>
                {item.product.description}{' '}
                {item.packagesRequired &&
                  item.packagesRequired > 1 &&
                  item.packagesRequired &&
                  item.packagesRequired != item.requiredQuantity &&
                  `(${item.packagesRequired} paquetes)`}
              </Text>
              <Text style={[styles.cell, styles.rightAlign]}>{formatCurrency(unitPrice)}</Text>
              <Text style={[styles.cell, styles.rightAlign]}>{formatCurrency(item.subtotal)}</Text>
            </View>
          )
        })}

        {/* RESUMEN DE TOTALES */}
        <View style={[styles.section, { marginTop: 20 }]}>
          <View style={styles.row}>
            <Text style={{ flex: 4 }} />
            <Text style={[styles.rightAlign, styles.padding4]}>Subtotal:</Text>
            <Text style={[styles.cell, styles.rightAlign]}>{formatCurrency(subtotal)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={{ flex: 4 }} />
            <Text style={[styles.cell, styles.rightAlign]}>IVA ({(ivaRate * 100).toFixed(0)}%):</Text>
            <Text style={[styles.cell, styles.rightAlign]}>{formatCurrency(taxes)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={{ flex: 4 }} />
            <Text style={[styles.cell, styles.rightAlign]}>Total:</Text>
            <Text style={[styles.cell, styles.rightAlign, styles.fontTotal]}>{formatCurrency(quote.total)}</Text>
          </View>
        </View>

        {/* FOOTER */}
        <View style={{ marginTop: 40 }}>
          <Text>Quedamos a sus órdenes por cualquier duda o comentario al respecto.</Text>
          <Text>Atentamente · Sandra Briseño</Text>
          <Text>Interdeco · hola@interdeco.mx</Text>
        </View>
        <View style={{ marginTop: 20 }}>
          <Text>Vigencia de la cotización 3 días naturales.</Text>
          <Text>
            Todo trabajo requiere de un 60% de anticipo, el cual se podrá pagar en efectivo, mediante depósito o transferencia electrónica a
            la cuenta de Banorte número 0438767692, con Clabe Interbancaria: 072197004387676926 a nombre de Sandra Montserrat Briseño
            Hidalgo.
          </Text>
          <Text>Precios sujetos a cambio sin previo aviso y sujetos a existencia.</Text>
          <Text>Una vez realizado el pedido no se aceptan cambios de material ni cancelaciones.</Text>
          <Text>Los tiempos de entrega varían dependiendo del material.</Text>
          <Text>Mejoramos cualquier presupuesto presentado por escrito.</Text>
          <Text>Trabajo 100% garantizado.</Text>
          <Text>
            ***GARANTÍA DEL MEJOR PRECIO: En INTERDECO estamos tan seguros de ser la mejor opción, que te damos la garantía de que si tienes
            un presupuesto más barato, por escrito, en donde se especifiquen los materiales a utilizar, te igualamos el precio y te
            regalamos la instalación.***
          </Text>
        </View>
      </Page>
    </Document>
  )
}

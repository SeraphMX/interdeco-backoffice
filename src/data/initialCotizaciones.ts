import { Cotizacion } from '../types';

export const initialCotizaciones: Cotizacion[] = [
  {
    id: '1',
    clienteId: '1', // Ana García Martínez
    fecha: '2024-03-15T10:00:00Z',
    items: [
      {
        id: 'item1',
        materialId: '1', // Piso de Madera de Roble
        metrosCuadrados: 25,
        cantidad: 25,
        precioUnitario: 850.00,
        subtotal: 21250.00
      },
      {
        id: 'item2',
        materialId: '3', // Papel Tapiz Floral
        metrosCuadrados: 40,
        cantidad: 40,
        precioUnitario: 320.00,
        subtotal: 12800.00
      }
    ],
    subtotal: 34050.00,
    iva: 5448.00,
    descuento: 2000.00,
    total: 37498.00,
    status: 'aprobada'
  },
  {
    id: '2',
    clienteId: '2', // Carlos Rodríguez López
    fecha: '2024-03-14T15:30:00Z',
    items: [
      {
        id: 'item3',
        materialId: '4', // Mármol Travertino
        metrosCuadrados: 15,
        cantidad: 15,
        precioUnitario: 1200.00,
        subtotal: 18000.00
      }
    ],
    subtotal: 18000.00,
    iva: 2880.00,
    descuento: 0,
    total: 20880.00,
    status: 'pendiente'
  },
  {
    id: '3',
    clienteId: '5', // Laura Méndez Ruiz
    fecha: '2024-03-13T09:15:00Z',
    items: [
      {
        id: 'item4',
        materialId: '2', // Azulejo Cerámico Vintage
        metrosCuadrados: 20,
        cantidad: 8,
        precioUnitario: 450.00,
        subtotal: 3600.00
      },
      {
        id: 'item5',
        materialId: '5', // Loseta Vinílica
        metrosCuadrados: 30,
        cantidad: 10,
        precioUnitario: 580.00,
        subtotal: 5800.00
      }
    ],
    subtotal: 9400.00,
    iva: 1504.00,
    descuento: 500.00,
    total: 10404.00,
    status: 'finalizada'
  }
];
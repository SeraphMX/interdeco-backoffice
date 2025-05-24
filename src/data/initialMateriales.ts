import { Material } from '../types';

export const initialMateriales: Material[] = [
  {
    id: '1',
    nombre: 'Piso de Madera de Roble',
    codigo: 'PM-001',
    precio: 850.00,
    unidadCompra: 'metro',
    unidadVenta: 'metro cuadrado',
    categoria: 'Pisos',
    proveedor: 'Maderas Premium SA'
  },
  {
    id: '2',
    nombre: 'Azulejo Cerámico Vintage',
    codigo: 'AZ-002',
    unidadCompra: 'caja',
    unidadVenta: 'metro cuadrado',
    precio: 450.00,
    metrosPorUnidad: 2.5,
    categoria: 'Paredes',
    proveedor: 'Cerámicas Modernas'
  },
  {
    id: '3',
    nombre: 'Papel Tapiz Floral',
    codigo: 'PT-003',
    precio: 320.00,
    unidadCompra: 'rollo',
    unidadVenta: 'metro cuadrado',
    categoria: 'Paredes',
    metrosPorUnidad: 5.0,
    proveedor: 'Decoración Total'
  },
  {
    id: '4',
    nombre: 'Mármol Travertino',
    codigo: 'MT-004',
    precio: 1200.00,
    unidadCompra: 'metro',
    unidadVenta: 'metro cuadrado',
    categoria: 'Pisos',
    proveedor: 'Mármoles y Granitos SA'
  },
  {
    id: '5',
    nombre: 'Loseta Vinílica',
    codigo: 'LV-005',
    unidadCompra: 'caja',
    unidadVenta: 'metro cuadrado',
    precio: 580.00,
    metrosPorUnidad: 3.0,
    categoria: 'Pisos',
    proveedor: 'Pisos Modernos'
  }
];
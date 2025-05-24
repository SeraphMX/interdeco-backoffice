import { Producto } from '../types';

export const initialProductos: Producto[] = [
  {
    id: '1',
    nombre: 'Kit Sala Moderna',
    descripcion: 'Conjunto completo para renovación de sala incluyendo pisos y acabados',
    precio: 25000.00,
    categoria: 'Sala',
    materiales: [
      { materialId: '1', cantidad: 20 }, // Piso de Madera
      { materialId: '3', cantidad: 30 }  // Papel Tapiz
    ],
    imagen: 'https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: '2',
    nombre: 'Renovación Baño Luxury',
    descripcion: 'Pack completo para renovación de baño con acabados premium',
    precio: 18500.00,
    categoria: 'Baño',
    materiales: [
      { materialId: '2', cantidad: 10 }, // Azulejos
      { materialId: '4', cantidad: 5 }   // Mármol
    ],
    imagen: 'https://images.unsplash.com/photo-1620626011761-996317b8d101?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: '3',
    nombre: 'Kit Cocina Moderna',
    descripcion: 'Conjunto de materiales para renovación de cocina estilo contemporáneo',
    precio: 32000.00,
    categoria: 'Cocina',
    materiales: [
      { materialId: '4', cantidad: 8 },  // Mármol
      { materialId: '5', cantidad: 6 }   // Loseta
    ],
    imagen: 'https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&q=80&w=800'
  }
];
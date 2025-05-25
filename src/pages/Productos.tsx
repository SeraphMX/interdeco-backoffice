import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { addProducto, deleteProducto } from '../store/slices/productosSlice';
import { PlusCircle, Trash2, Edit, Search, Plus, Minus } from 'lucide-react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input, Card, CardBody, CardHeader, Select, SelectItem, Textarea } from "@heroui/react";

const Productos = () => {
  const dispatch = useDispatch();
  const productos = useSelector((state: RootState) => state.productos.items);
  const materiales = useSelector((state: RootState) => state.materiales.items);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    precio: 0,
    categoria: '',
    materiales: [] as { materialId: string; cantidad: number }[],
    imagen: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(addProducto({
      id: crypto.randomUUID(),
      ...formData
    }));
    setFormData({
      nombre: '',
      descripcion: '',
      precio: 0,
      categoria: '',
      materiales: [],
      imagen: ''
    });
    setShowForm(false);
  };

  const addMaterial = () => {
    setFormData({
      ...formData,
      materiales: [...formData.materiales, { materialId: '', cantidad: 1 }]
    });
  };

  const updateMaterial = (index: number, updates: Partial<{ materialId: string; cantidad: number }>) => {
    const newMateriales = [...formData.materiales];
    newMateriales[index] = { ...newMateriales[index], ...updates };
    setFormData({
      ...formData,
      materiales: newMateriales
    });
  };

  const removeMaterial = (index: number) => {
    setFormData({
      ...formData,
      materiales: formData.materiales.filter((_, i) => i !== index)
    });
  };

  const filteredProductos = productos.filter(producto =>
    producto.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    producto.categoria.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const categorias = ['Sala', 'Comedor', 'Recámara', 'Baño', 'Cocina', 'Exterior'];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Paquetes</h1>
        <Button
          onPress={() => setShowForm(true)}
          color="primary"
          endContent={<PlusCircle size={20} />}
        >
          Nuevo Producto
        </Button>
      </div>

      <div className="relative">
        <Input
          type="text"
          placeholder="Buscar productos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          startContent={<Search className="text-gray-400" size={20} />}
          className="w-full"
        />
      </div>

      <Modal 
        isOpen={showForm} 
        onOpenChange={setShowForm}
        size="2xl"
        scrollBehavior="inside"
      >
        <ModalContent>
          {(onClose) => (
            <form onSubmit={handleSubmit}>
              <ModalHeader className="flex flex-col gap-1">Nuevo Producto</ModalHeader>
              <ModalBody>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Nombre"
                    required
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  />
                  <Select
                    label="Categoría"
                    value={formData.categoria}
                    onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                  >
                    {categorias.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </Select>
                </div>

                <Textarea
                  label="Descripción"
                  required
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                />

                <Input
                  type="number"
                  label="Precio"
                  required
                  min={0}
                  step={0.01}
                  value={formData.precio.toString()}
                  onChange={(e) => setFormData({ ...formData, precio: parseFloat(e.target.value) })}
                />

                <Input
                  type="url"
                  label="URL de Imagen"
                  value={formData.imagen}
                  onChange={(e) => setFormData({ ...formData, imagen: e.target.value })}
                  placeholder="https://ejemplo.com/imagen.jpg"
                />

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Materiales</h3>
                    <Button
                      size="sm"
                      color="primary"
                      variant="light"
                      onPress={addMaterial}
                      startContent={<Plus size={18} />}
                    >
                      Agregar Material
                    </Button>
                  </div>

                  {formData.materiales.map((material, index) => (
                    <Card key={index} className="p-4">
                      <CardBody className="flex flex-row items-center gap-4">
                        <Select
                          className="flex-grow"
                          required
                          value={material.materialId}
                          onChange={(e) => updateMaterial(index, { materialId: e.target.value })}
                        >
                          <SelectItem key="empty" value="">Seleccionar material</SelectItem>
                          {materiales.map(m => (
                            <SelectItem key={m.id} value={m.id}>{m.nombre}</SelectItem>
                          ))}
                        </Select>
                        <Input
                          type="number"
                          className="w-32"
                          required
                          min={1}
                          value={material.cantidad.toString()}
                          onChange={(e) => updateMaterial(index, { cantidad: parseInt(e.target.value) })}
                        />
                        <Button
                          isIconOnly
                          color="danger"
                          variant="light"
                          onPress={() => removeMaterial(index)}
                        >
                          <Minus size={18} />
                        </Button>
                      </CardBody>
                    </Card>
                  ))}
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Cancelar
                </Button>
                <Button color="primary" type="submit">
                  Guardar
                </Button>
              </ModalFooter>
            </form>
          )}
        </ModalContent>
      </Modal>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredProductos.map((producto) => (
          <Card key={producto.id} className="bg-white">
            {producto.imagen && (
              <div className="w-full h-48 overflow-hidden">
                <img
                  src={producto.imagen}
                  alt={producto.nombre}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <CardHeader className="flex justify-between items-start pb-0">
              <div>
                <h3 className="text-lg font-semibold">{producto.nombre}</h3>
                <span className="inline-block bg-gray-100 text-gray-600 text-sm px-2 py-1 rounded mt-1">
                  {producto.categoria}
                </span>
              </div>
              <div className="flex gap-2">
                <Button isIconOnly variant="light" color="primary">
                  <Edit size={18} />
                </Button>
                <Button 
                  isIconOnly 
                  variant="light" 
                  color="danger"
                  onClick={() => dispatch(deleteProducto(producto.id))}
                >
                  <Trash2 size={18} />
                </Button>
              </div>
            </CardHeader>
            <CardBody className="text-sm text-gray-600">
              <p className="mb-4">{producto.descripcion}</p>
              <div className="space-y-2">
                <p className="text-lg font-semibold text-gray-900">
                  {producto.precio.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}
                </p>
                <div>
                  <p className="text-sm font-medium text-gray-700">Materiales incluidos:</p>
                  <ul className="mt-1 space-y-1">
                    {producto.materiales.map((mat, index) => {
                      const material = materiales.find(m => m.id === mat.materialId);
                      return (
                        <li key={index} className="text-sm text-gray-600">
                          {material?.nombre} ({mat.cantidad} {material?.tipo === 'metro' ? 'metros' : 'cajas'})
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Productos;
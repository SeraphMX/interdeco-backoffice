import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { addMaterial, deleteMaterial } from '../store/slices/materialesSlice';
import { PlusCircle, Trash2, Edit, Search } from 'lucide-react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input, Card, CardBody, CardHeader, Select, SelectItem, Chip } from "@heroui/react";
import { MaterialCategoria, UnidadCompra, UnidadVenta } from '../types';

const categorias: MaterialCategoria[] = ['Pisos', 'Paredes', 'Techos', 'Cocina', 'Baño', 'Persianas'];
const unidadesCompra: UnidadCompra[] = ['metro', 'caja', 'pieza', 'rollo'];
const unidadesVenta: UnidadVenta[] = ['metro cuadrado', 'metro lineal'];

const categoriasColores: Record<MaterialCategoria, "primary" | "secondary" | "success" | "warning" | "danger"> = {
  'Pisos': 'primary',
  'Paredes': 'secondary',
  'Techos': 'success',
  'Cocina': 'warning',
  'Baño': 'danger',
  'Persianas': 'primary'
};

const Materiales = () => {
  const dispatch = useDispatch();
  const materiales = useSelector((state: RootState) => state.materiales.items);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoriaFilter, setCategoriaFilter] = useState<MaterialCategoria | ''>('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    codigo: '',
    precio: 0,
    unidadCompra: '' as UnidadCompra | '',
    unidadVenta: '' as UnidadVenta | '',
    categoria: '' as MaterialCategoria | '',
    metrosPorUnidad: undefined as number | undefined,
    proveedor: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.categoria || !formData.unidadCompra || !formData.unidadVenta) return;
    
    dispatch(addMaterial({
      id: crypto.randomUUID(),
      ...formData,
      categoria: formData.categoria as MaterialCategoria,
      unidadCompra: formData.unidadCompra as UnidadCompra,
      unidadVenta: formData.unidadVenta as UnidadVenta
    }));
    setFormData({
      nombre: '',
      codigo: '',
      precio: 0,
      unidadCompra: '',
      unidadVenta: '',
      categoria: '',
      metrosPorUnidad: undefined,
      proveedor: ''
    });
    setShowForm(false);
  };

  const filteredMateriales = materiales.filter(material =>
    (material.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    material.codigo.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (!categoriaFilter || material.categoria === categoriaFilter)
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Materiales</h1>
        <Button
          onPress={() => setShowForm(true)}
          color="primary"
          endContent={<PlusCircle size={20} />}
        >
          Nuevo Material
        </Button>
      </div>

      <div className="flex gap-4 items-center">
        <Input
          type="text"
          placeholder="Buscar materiales..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          startContent={<Search className="text-gray-400" size={20} />}
          className="flex-grow"
        />
        <Select
          placeholder="Filtrar por categoría"
          value={categoriaFilter}
          onChange={(e) => setCategoriaFilter(e.target.value as MaterialCategoria | '')}
          className="w-64"
        >
          <SelectItem key="" value="">Todas las categorías</SelectItem>
          {categorias.map(categoria => (
            <SelectItem key={categoria} value={categoria}>{categoria}</SelectItem>
          ))}
        </Select>
      </div>

      <Modal 
        isOpen={showForm} 
        onOpenChange={setShowForm}
        size="lg"
      >
        <ModalContent>
          {(onClose) => (
            <form onSubmit={handleSubmit}>
              <ModalHeader className="flex flex-col gap-1">Nuevo Material</ModalHeader>
              <ModalBody>
                <Input
                  label="Nombre"
                  required
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                />
                <Input
                  label="Código"
                  required
                  value={formData.codigo}
                  onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
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
                <Select
                  label="Categoría"
                  required
                  value={formData.categoria}
                  onChange={(e) => setFormData({ ...formData, categoria: e.target.value as MaterialCategoria })}
                >
                  <SelectItem key="" value="">Seleccionar categoría</SelectItem>
                  {categorias.map(categoria => (
                    <SelectItem key={categoria} value={categoria}>{categoria}</SelectItem>
                  ))}
                </Select>
                <Select
                  label="Unidad de Compra"
                  required
                  value={formData.unidadCompra}
                  onChange={(e) => setFormData({ ...formData, unidadCompra: e.target.value as UnidadCompra })}
                >
                  <SelectItem key="" value="">Seleccionar unidad de compra</SelectItem>
                  {unidadesCompra.map(unidad => (
                    <SelectItem key={unidad} value={unidad}>{unidad}</SelectItem>
                  ))}
                </Select>
                <Select
                  label="Unidad de Venta"
                  required
                  value={formData.unidadVenta}
                  onChange={(e) => setFormData({ ...formData, unidadVenta: e.target.value as UnidadVenta })}
                >
                  <SelectItem key="" value="">Seleccionar unidad de venta</SelectItem>
                  {unidadesVenta.map(unidad => (
                    <SelectItem key={unidad} value={unidad}>{unidad}</SelectItem>
                  ))}
                </Select>
                {formData.unidadCompra === 'caja' || formData.unidadCompra === 'rollo' ? (
                  <Input
                    type="number"
                    label="Metros por Unidad"
                    required
                    min={0}
                    step={0.01}
                    value={formData.metrosPorUnidad?.toString() || ''}
                    onChange={(e) => setFormData({ ...formData, metrosPorUnidad: parseFloat(e.target.value) })}
                  />
                ) : null}
                <Input
                  label="Proveedor"
                  required
                  value={formData.proveedor}
                  onChange={(e) => setFormData({ ...formData, proveedor: e.target.value })}
                />
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
        {filteredMateriales.map((material) => (
          <Card key={material.id} className="bg-white">
            <CardHeader className="flex justify-between items-start pb-0">
              <div>
                <h3 className="text-lg font-semibold">{material.nombre}</h3>
                <Chip
                  className="mt-1"
                  color={categoriasColores[material.categoria]}
                  size="sm"
                  variant="flat"
                >
                  {material.categoria}
                </Chip>
              </div>
              <div className="flex gap-2">
                <Button isIconOnly variant="light" color="primary">
                  <Edit size={18} />
                </Button>
                <Button 
                  isIconOnly 
                  variant="light" 
                  color="danger"
                  onClick={() => dispatch(deleteMaterial(material.id))}
                >
                  <Trash2 size={18} />
                </Button>
              </div>
            </CardHeader>
            <CardBody className="text-sm text-gray-600">
              <div className="space-y-2">
                <p className="flex items-center gap-2">
                  <span className="font-medium">Código:</span>
                  {material.codigo}
                </p>
                <p className="flex items-center gap-2">
                  <span className="font-medium">Precio:</span>
                  {material.precio.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}
                </p>
                <p className="flex items-center gap-2">
                  <span className="font-medium">Unidad de Compra:</span>
                  {material.unidadCompra}
                </p>
                <p className="flex items-center gap-2">
                  <span className="font-medium">Unidad de Venta:</span>
                  {material.unidadVenta}
                </p>
                {material.metrosPorUnidad && (
                  <p className="flex items-center gap-2">
                    <span className="font-medium">Metros por Unidad:</span>
                    {material.metrosPorUnidad}
                  </p>
                )}
                <p className="flex items-center gap-2">
                  <span className="font-medium">Proveedor:</span>
                  {material.proveedor}
                </p>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Materiales;
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { addCliente, deleteCliente } from '../store/slices/clientesSlice';
import { PlusCircle, Trash2, Edit, Search } from 'lucide-react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input, Textarea, Card, CardBody, CardHeader } from "@heroui/react";

const Clientes = () => {
  const dispatch = useDispatch();
  const clientes = useSelector((state: RootState) => state.clientes.items);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    contacto: '',
    direccion: '',
    notas: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(addCliente({
      id: crypto.randomUUID(),
      ...formData
    }));
    setFormData({ nombre: '', contacto: '', direccion: '', notas: '' });
    setShowForm(false);
  };

  const filteredClientes = clientes.filter(cliente =>
    cliente.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.contacto.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Clientes</h1>
        <Button
          onPress={() => setShowForm(true)}
          color="primary"
          endContent={<PlusCircle size={20} />}
        >
          Nuevo Cliente
        </Button>
      </div>

      <div className="relative">
        <Input
          type="text"
          placeholder="Buscar clientes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          startContent={<Search className="text-gray-400" size={20} />}
          className="w-full"
        />
      </div>

      <Modal 
        isOpen={showForm} 
        onOpenChange={setShowForm}
        size="lg"
      >
        <ModalContent>
          {(onClose) => (
            <form onSubmit={handleSubmit}>
              <ModalHeader className="flex flex-col gap-1">Nuevo Cliente</ModalHeader>
              <ModalBody>
                <Input
                  label="Nombre"
                  required
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                />
                <Input
                  label="Contacto"
                  required
                  value={formData.contacto}
                  onChange={(e) => setFormData({ ...formData, contacto: e.target.value })}
                />
                <Input
                  label="Dirección"
                  required
                  value={formData.direccion}
                  onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                />
                <Textarea
                  label="Notas"
                  value={formData.notas}
                  onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
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
        {filteredClientes.map((cliente) => (
          <Card key={cliente.id} className="bg-white">
            <CardHeader className="flex justify-between items-start pb-0">
              <h3 className="text-lg font-semibold">{cliente.nombre}</h3>
              <div className="flex gap-2">
                <Button isIconOnly variant="light" color="primary">
                  <Edit size={18} />
                </Button>
                <Button 
                  isIconOnly 
                  variant="light" 
                  color="danger"
                  onClick={() => dispatch(deleteCliente(cliente.id))}
                >
                  <Trash2 size={18} />
                </Button>
              </div>
            </CardHeader>
            <CardBody className="text-sm text-gray-600">
              <div className="space-y-2">
                <p className="flex items-center gap-2">
                  <span className="font-medium">Contacto:</span>
                  {cliente.contacto}
                </p>
                <p className="flex items-center gap-2">
                  <span className="font-medium">Dirección:</span>
                  {cliente.direccion}
                </p>
                {cliente.notas && (
                  <p className="flex items-center gap-2">
                    <span className="font-medium">Notas:</span>
                    {cliente.notas}
                  </p>
                )}
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Clientes;
import React, { useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '../store';
import { deleteCotizacion } from '../store/slices/cotizacionesSlice';
import { PlusCircle, Trash2, Edit, Search, Eye } from 'lucide-react';
import { 
  Button, 
  Input,
  Table, 
  TableHeader, 
  TableBody, 
  TableColumn, 
  TableRow, 
  TableCell,
  Chip,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Selection,
  SortDescriptor
} from "@nextui-org/react";
import { CotizacionStatus } from '../types';

const statusColorMap: Record<CotizacionStatus, "success" | "warning" | "danger" | "primary"> = {
  finalizada: "success",
  pendiente: "warning",
  rechazada: "danger",
  aprobada: "primary",
};

const statusNames: Record<CotizacionStatus, string> = {
  finalizada: "Finalizada",
  pendiente: "Pendiente",
  rechazada: "Rechazada",
  aprobada: "Aprobada",
};

const Cotizaciones = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const cotizaciones = useSelector((state: RootState) => state.cotizaciones.items);
  const clientes = useSelector((state: RootState) => state.clientes.items);
  
  const [filterValue, setFilterValue] = useState("");
  const [statusFilter, setStatusFilter] = useState<Selection>(new Set([]));
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column: "fecha",
    direction: "descending",
  });

  const hasSearchFilter = Boolean(filterValue);

  const headerColumns = [
    {name: "CLIENTE", uid: "cliente"},
    {name: "FECHA", uid: "fecha"},
    {name: "ITEMS", uid: "items"},
    {name: "TOTAL", uid: "total"},
    {name: "STATUS", uid: "status"},
    {name: "ACCIONES", uid: "acciones"}
  ];

  const filteredItems = useMemo(() => {
    let filteredCotizaciones = [...cotizaciones];

    if (hasSearchFilter) {
      filteredCotizaciones = filteredCotizaciones.filter((cotizacion) => {
        const cliente = clientes.find(c => c.id === cotizacion.clienteId);
        return cliente?.nombre.toLowerCase().includes(filterValue.toLowerCase());
      });
    }

    if (statusFilter && statusFilter.size > 0) {
      filteredCotizaciones = filteredCotizaciones.filter((cotizacion) =>
        statusFilter.has(cotizacion.status)
      );
    }

    return filteredCotizaciones;
  }, [cotizaciones, filterValue, statusFilter]);

  const sortedItems = useMemo(() => {
    return [...filteredItems].sort((a, b) => {
      const first = a[sortDescriptor.column as keyof typeof a];
      const second = b[sortDescriptor.column as keyof typeof b];
      const cmp = first < second ? -1 : first > second ? 1 : 0;

      return sortDescriptor.direction === "descending" ? -cmp : cmp;
    });
  }, [filteredItems, sortDescriptor]);

  const onSearchChange = (value?: string) => {
    if (value) {
      setFilterValue(value);
    } else {
      setFilterValue("");
    }
  };

  const onClear = () => {
    setFilterValue("");
    setStatusFilter(new Set([]));
  };

  const topContent = useMemo(() => {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Cotizaciones</h1>
          <Button
            onPress={() => navigate('/cotizaciones/nueva')}
            color="primary"
            endContent={<PlusCircle size={20} />}
          >
            Nueva Cotización
          </Button>
        </div>
        <div className="flex justify-between gap-3 items-end">
          <Input
            isClearable
            className="w-full sm:max-w-[44%]"
            placeholder="Buscar por cliente..."
            startContent={<Search className="text-gray-400" size={20} />}
            value={filterValue}
            onClear={() => onClear()}
            onValueChange={onSearchChange}
          />
          <Dropdown>
            <DropdownTrigger>
              <Button
                variant="flat"
                className="capitalize"
              >
                Status
              </Button>
            </DropdownTrigger>
            <DropdownMenu
              disallowEmptySelection
              aria-label="Filtrar por status"
              closeOnSelect={false}
              selectedKeys={statusFilter}
              selectionMode="multiple"
              onSelectionChange={setStatusFilter}
            >
              <DropdownItem key="pendiente">Pendiente</DropdownItem>
              <DropdownItem key="aprobada">Aprobada</DropdownItem>
              <DropdownItem key="rechazada">Rechazada</DropdownItem>
              <DropdownItem key="finalizada">Finalizada</DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>
      </div>
    );
  }, [filterValue, statusFilter]);

  return (
    <div className="space-y-6">
      <Table
        aria-label="Tabla de cotizaciones"
        isHeaderSticky
        topContent={topContent}
        topContentPlacement="outside"
        sortDescriptor={sortDescriptor}
        onSortChange={setSortDescriptor}
      >
        <TableHeader columns={headerColumns}>
          {(column) => (
            <TableColumn 
              key={column.uid}
              align={column.uid === "acciones" ? "center" : "start"}
              allowsSorting={column.uid !== "acciones"}
            >
              {column.name}
            </TableColumn>
          )}
        </TableHeader>
        <TableBody items={sortedItems}>
          {(cotizacion) => {
            const cliente = clientes.find(c => c.id === cotizacion.clienteId);
            return (
              <TableRow key={cotizacion.id}>
                <TableCell>{cliente?.nombre}</TableCell>
                <TableCell>{new Date(cotizacion.fecha).toLocaleDateString('es-MX')}</TableCell>
                <TableCell>{cotizacion.items.length}</TableCell>
                <TableCell>
                  {cotizacion.total.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}
                </TableCell>
                <TableCell>
                  <Chip
                    className="capitalize"
                    color={statusColorMap[cotizacion.status]}
                    size="sm"
                    variant="flat"
                  >
                    {statusNames[cotizacion.status]}
                  </Chip>
                </TableCell>
                <TableCell>
                  <div className="flex justify-center gap-2">
                    <Button isIconOnly variant="light" color="primary">
                      <Eye size={18} />
                    </Button>
                    <Button isIconOnly variant="light" color="primary">
                      <Edit size={18} />
                    </Button>
                    <Button 
                      isIconOnly 
                      variant="light" 
                      color="danger"
                      onClick={() => dispatch(deleteCotizacion(cotizacion.id))}
                    >
                      <Trash2 size={18} />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          }}
        </TableBody>
      </Table>
    </div>
  );
};

export default Cotizaciones;
import React, { useState, useMemo, useEffect } from 'react';
import { Search } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { 
  Input,
  Table, 
  TableHeader, 
  TableBody, 
  TableColumn, 
  TableRow, 
  TableCell,
  Chip,
  SortDescriptor,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Button,
  Selection,
  Spinner
} from "@nextui-org/react";

interface ProductDetails {
  id: string;
  created_at: string;
  sku: string;
  description: string;
  provider: string;
  package_unit: string;
  measurement_unit: string;
  wholesale_price: number;
  public_price: number;
  category: string;
  spec: string;
  price: number;
  provider_name: string;
  category_description: string;
}

const Catalogo = () => {
  const [products, setProducts] = useState<ProductDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterValue, setFilterValue] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<Selection>(new Set([]));
  const [selectedProviders, setSelectedProviders] = useState<Selection>(new Set([]));
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column: "sku",
    direction: "ascending",
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('product_details_view')
        .select('*');

      if (error) throw error;

      setProducts(data);
      setError(null);
    } catch (err) {
      setError('Error al cargar los productos');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Get unique categories and providers
  const categories = useMemo(() => 
    Array.from(new Set(products.map(p => p.category_description))),
    [products]
  );
  
  const providers = useMemo(() => 
    Array.from(new Set(products.map(p => p.provider_name))),
    [products]
  );

  const headerColumns = [
    {name: "SKU", uid: "sku", sortable: true},
    {name: "DESCRIPCIÓN", uid: "description", sortable: true},
    {name: "PRECIO PÚBLICO", uid: "public_price", sortable: true},
    {name: "PRECIO MAYOREO", uid: "wholesale_price", sortable: true},
    {name: "CATEGORÍA", uid: "category_description", sortable: true},
    {name: "PROVEEDOR", uid: "provider_name", sortable: true}
  ];

  const filteredItems = useMemo(() => {
    return products.filter(item => {
      const matchesSearch = 
        item.description.toLowerCase().includes(filterValue.toLowerCase()) ||
        item.sku.toLowerCase().includes(filterValue.toLowerCase()) ||
        item.category_description.toLowerCase().includes(filterValue.toLowerCase()) ||
        item.provider_name.toLowerCase().includes(filterValue.toLowerCase());

      const matchesCategories = 
        selectedCategories.size === 0 || 
        selectedCategories.has(item.category_description);

      const matchesProviders = 
        selectedProviders.size === 0 || 
        selectedProviders.has(item.provider_name);

      const matchesPriceRange = 
        (!priceRange.min || item.public_price >= parseFloat(priceRange.min)) &&
        (!priceRange.max || item.public_price <= parseFloat(priceRange.max));

      return matchesSearch && matchesCategories && matchesProviders && matchesPriceRange;
    });
  }, [products, filterValue, selectedCategories, selectedProviders, priceRange]);

  const sortedItems = [...filteredItems].sort((a, b) => {
    const first = a[sortDescriptor.column as keyof typeof a];
    const second = b[sortDescriptor.column as keyof typeof b];
    const cmp = first < second ? -1 : first > second ? 1 : 0;

    return sortDescriptor.direction === "descending" ? -cmp : cmp;
  });

  const clearFilters = () => {
    setFilterValue("");
    setSelectedCategories(new Set([]));
    setSelectedProviders(new Set([]));
    setPriceRange({ min: '', max: '' });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-danger p-4">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Catálogo</h1>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-4 items-end">
          <Input
            isClearable
            className="w-full sm:max-w-[300px]"
            placeholder="Buscar en catálogo..."
            startContent={<Search className="text-gray-400" size={20} />}
            value={filterValue}
            onClear={() => setFilterValue("")}
            onValueChange={setFilterValue}
          />

          <Dropdown>
            <DropdownTrigger>
              <Button 
                variant="flat"
                className="capitalize"
              >
                Categorías ({selectedCategories.size})
              </Button>
            </DropdownTrigger>
            <DropdownMenu
              disallowEmptySelection
              aria-label="Filtrar por categorías"
              closeOnSelect={false}
              selectedKeys={selectedCategories}
              selectionMode="multiple"
              onSelectionChange={setSelectedCategories}
            >
              {categories.map((category) => (
                <DropdownItem key={category}>{category}</DropdownItem>
              ))}
            </DropdownMenu>
          </Dropdown>

          <Dropdown>
            <DropdownTrigger>
              <Button 
                variant="flat"
                className="capitalize"
              >
                Proveedores ({selectedProviders.size})
              </Button>
            </DropdownTrigger>
            <DropdownMenu
              disallowEmptySelection
              aria-label="Filtrar por proveedores"
              closeOnSelect={false}
              selectedKeys={selectedProviders}
              selectionMode="multiple"
              onSelectionChange={setSelectedProviders}
            >
              {providers.map((provider) => (
                <DropdownItem key={provider}>{provider}</DropdownItem>
              ))}
            </DropdownMenu>
          </Dropdown>

          <div className="flex gap-2 items-center">
            <Input
              type="number"
              placeholder="Precio min"
              className="w-28"
              value={priceRange.min}
              onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
            />
            <span>-</span>
            <Input
              type="number"
              placeholder="Precio max"
              className="w-28"
              value={priceRange.max}
              onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
            />
          </div>

          <Button
            color="primary"
            variant="light"
            onPress={clearFilters}
          >
            Limpiar filtros
          </Button>
        </div>

        <div className="text-sm text-gray-500">
          {filteredItems.length} resultados encontrados
        </div>
      </div>

      <Table
        aria-label="Tabla de catálogo"
        isHeaderSticky
        sortDescriptor={sortDescriptor}
        onSortChange={setSortDescriptor}
      >
        <TableHeader columns={headerColumns}>
          {(column) => (
            <TableColumn 
              key={column.uid}
              allowsSorting={column.sortable}
            >
              {column.name}
            </TableColumn>
          )}
        </TableHeader>
        <TableBody items={sortedItems}>
          {(item) => (
            <TableRow key={item.id}>
              <TableCell>{item.sku}</TableCell>
              <TableCell>{item.description}</TableCell>
              <TableCell>
                {item.public_price.toLocaleString('es-MX', { 
                  style: 'currency', 
                  currency: 'MXN' 
                })}
              </TableCell>
              <TableCell>
                {item.wholesale_price.toLocaleString('es-MX', { 
                  style: 'currency', 
                  currency: 'MXN' 
                })}
              </TableCell>
              <TableCell>
                <Chip
                  className="capitalize"
                  color="primary"
                  size="sm"
                  variant="flat"
                >
                  {item.category_description}
                </Chip>
              </TableCell>
              <TableCell>{item.provider_name}</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default Catalogo;
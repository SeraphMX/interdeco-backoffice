import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Users, Package, FileText, ShoppingBag, Menu, X } from 'lucide-react';
import { Button } from '@nextui-org/react';

const Navbar = () => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isActive = (path: string) => {
    return location.pathname === path ? 'bg-teal-600' : '';
  };

  const navItems = [
    { path: '/clientes', icon: Users, label: 'Clientes' },
    { path: '/materiales', icon: Package, label: 'Materiales' },
    { path: '/productos', icon: ShoppingBag, label: 'Paquetes' },
    { path: '/cotizaciones', icon: FileText, label: 'Cotizaciones' },
  ];

  return (
    <nav className="bg-teal-500 text-white">
      <div className="container mx-auto px-4">
        <div className="relative flex items-center justify-between h-16">
          {/* Logo - always visible */}
          <Link to="/" className="flex items-center space-x-2 font-semibold">
            <Home size={24} />
            <span>InterDeco</span>
          </Link>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              isIconOnly
              variant="light"
              onPress={() => setIsMenuOpen(!isMenuOpen)}
              className="text-white"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </Button>
          </div>

          {/* Desktop navigation */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 hover:bg-teal-700 ${isActive(
                  item.path
                )}`}
              >
                <item.icon size={20} />
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Mobile navigation */}
        <div
          className={`${
            isMenuOpen ? 'block' : 'hidden'
          } md:hidden absolute left-0 right-0 bg-teal-600 z-50 shadow-lg border-t border-teal-700`}
        >
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 px-3 py-2 rounded-md text-base font-medium transition-colors duration-150 hover:bg-teal-600 ${isActive(
                  item.path
                )}`}
                onClick={() => setIsMenuOpen(false)}
              >
                <item.icon size={20} />
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
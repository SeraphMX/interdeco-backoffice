import { User } from '../types';

export const initialUsers: User[] = [
  {
    id: '1',
    email: 'admin@example.com',
    password: 'admin123',
    name: 'Administrador',
    role: 'admin'
  },
  {
    id: '2',
    email: 'staff@example.com',
    password: 'staff123',
    name: 'Staff',
    role: 'staff'
  }
];
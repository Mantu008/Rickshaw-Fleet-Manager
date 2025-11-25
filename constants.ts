import { Vehicle, VehicleStatus, Transaction } from './types';

export const MOCK_VEHICLES: Vehicle[] = [
  {
    id: 'r1',
    name: 'Rickshaw 01',
    driverName: 'Raju',
    plateNumber: 'KA-01-AB-1001',
    status: VehicleStatus.ACTIVE,
    targetDaily: 250
  },
  {
    id: 'r2',
    name: 'Rickshaw 02',
    driverName: 'Babu',
    plateNumber: 'KA-01-XY-2002',
    status: VehicleStatus.ACTIVE,
    targetDaily: 300
  }
];

export const MOCK_TRANSACTIONS: Transaction[] = [];
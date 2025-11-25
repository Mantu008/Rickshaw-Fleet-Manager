export enum VehicleStatus {
  ACTIVE = 'Active',
  MAINTENANCE = 'Maintenance',
  INACTIVE = 'Inactive'
}

export enum TransactionType {
  INCOME = 'Income',
  EXPENSE = 'Expense'
}

export enum ExpenseCategory {
  FUEL = 'Fuel',
  REPAIR = 'Repair',
  SALARY = 'Salary',
  MISC = 'Miscellaneous'
}

export interface Vehicle {
  id: string;
  name: string; // e.g., "Rickshaw 01"
  driverName: string;
  plateNumber: string;
  status: VehicleStatus;
  targetDaily: number;
}

export interface Transaction {
  id: string;
  vehicleId: string;
  amount: number;
  type: TransactionType;
  date: string; // ISO date string
  notes?: string;
  category?: ExpenseCategory; // Only for expenses
}

export interface DashboardStats {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  collectionRate: number; // Percentage of target met
}
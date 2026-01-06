export interface Category {
  id: string;
  name: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Application {
  id: string;
  categoryId: string;
  name: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Outage {
  id: string;
  applicationId: string;
  year: number;
  month: number; // 1-12
  day: number; // 1-31
  status: OutageStatus;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum OutageStatus {
  NONE = 'none',
  PARTIAL = 'partial', // Yellow - partial outage
  FULL = 'full' // Red - full outage
}

export interface MonthData {
  year: number;
  month: number;
  daysInMonth: number;
  outages: Map<string, Outage>; // key: `${applicationId}-${day}`
}

export interface CategoryWithApplications extends Category {
  applications: Application[];
}


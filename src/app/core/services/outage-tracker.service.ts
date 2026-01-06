import { Injectable, inject, signal, computed } from '@angular/core';
import { FirebaseService } from './firebase.service';
import {
  Category,
  Application,
  Outage,
  OutageStatus,
  CategoryWithApplications
} from '../models/outage.model';
import { combineLatest, map, tap } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';

@Injectable({
  providedIn: 'root'
})
export class OutageTrackerService {
  private firebaseService = inject(FirebaseService);

  // Current date tracking
  private currentDate = signal(new Date());
  selectedYear = signal(new Date().getFullYear());
  selectedMonth = signal(new Date().getMonth() + 1); // 1-12

  // Data signals
  private categoriesData = toSignal(this.firebaseService.getCategories(), {
    initialValue: []
  });
  private applicationsData = toSignal(this.firebaseService.getApplications(), {
    initialValue: []
  });

  // Outages for current month
  outages = signal<Outage[]>([]);

  // Computed: Categories with their applications
  categoriesWithApps = computed<CategoryWithApplications[]>(() => {
    const categories = this.categoriesData();
    const applications = this.applicationsData();

    return categories.map(category => ({
      ...category,
      applications: applications
        .filter(app => app.categoryId === category.id)
        .sort((a, b) => a.order - b.order)
    }));
  });

  // Computed: Days in selected month
  daysInMonth = computed(() => {
    return new Date(this.selectedYear(), this.selectedMonth(), 0).getDate();
  });

  // Computed: Array of day numbers for the grid
  daysArray = computed(() => {
    return Array.from({ length: this.daysInMonth() }, (_, i) => i + 1);
  });

  // Computed: Outage lookup map for quick access
  outageMap = computed(() => {
    const map = new Map<string, Outage>();
    this.outages().forEach(outage => {
      const key = `${outage.applicationId}-${outage.day}`;
      map.set(key, outage);
    });
    return map;
  });

  // Month names for tabs
  readonly monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  constructor() {
    // Load outages when month/year changes
    this.loadOutages();
  }

  loadOutages(): void {
    this.firebaseService
      .getOutages(this.selectedYear(), this.selectedMonth())
      .subscribe(outages => {
        this.outages.set(outages);
      });
  }

  selectMonth(month: number): void {
    this.selectedMonth.set(month);
    this.loadOutages();
  }

  selectYear(year: number): void {
    this.selectedYear.set(year);
    this.loadOutages();
  }

  navigateMonth(direction: 'prev' | 'next'): void {
    let month = this.selectedMonth();
    let year = this.selectedYear();

    if (direction === 'next') {
      if (month === 12) {
        month = 1;
        year++;
      } else {
        month++;
      }
    } else {
      if (month === 1) {
        month = 12;
        year--;
      } else {
        month--;
      }
    }

    this.selectedMonth.set(month);
    this.selectedYear.set(year);
    this.loadOutages();
  }

  // Get outage status for a specific app and day
  getOutageStatus(applicationId: string, day: number): OutageStatus {
    const outage = this.outageMap().get(`${applicationId}-${day}`);
    return outage?.status || OutageStatus.NONE;
  }

  // Get outage for a specific app and day
  getOutage(applicationId: string, day: number): Outage | undefined {
    return this.outageMap().get(`${applicationId}-${day}`);
  }

  // Toggle outage status (cycles: none -> partial -> full -> none)
  async toggleOutageStatus(applicationId: string, day: number): Promise<void> {
    const existingOutage = this.getOutage(applicationId, day);
    
    if (!existingOutage) {
      // Create new partial outage
      await this.firebaseService.setOutage({
        applicationId,
        year: this.selectedYear(),
        month: this.selectedMonth(),
        day,
        status: OutageStatus.PARTIAL
      });
    } else if (existingOutage.status === OutageStatus.PARTIAL) {
      // Upgrade to full outage
      await this.firebaseService.updateOutage(existingOutage.id, {
        status: OutageStatus.FULL
      });
    } else {
      // Remove outage
      await this.firebaseService.deleteOutage(existingOutage.id);
    }
    
    this.loadOutages();
  }

  // Set specific outage status
  async setOutageStatus(
    applicationId: string,
    day: number,
    status: OutageStatus,
    notes?: string
  ): Promise<void> {
    const existingOutage = this.getOutage(applicationId, day);

    if (status === OutageStatus.NONE) {
      if (existingOutage) {
        await this.firebaseService.deleteOutage(existingOutage.id);
      }
    } else if (existingOutage) {
      await this.firebaseService.updateOutage(existingOutage.id, { status, notes });
    } else {
      await this.firebaseService.setOutage({
        applicationId,
        year: this.selectedYear(),
        month: this.selectedMonth(),
        day,
        status,
        notes
      });
    }
    
    this.loadOutages();
  }

  // Category management
  async addCategory(name: string): Promise<void> {
    const categories = this.categoriesData();
    const maxOrder = categories.length > 0 
      ? Math.max(...categories.map(c => c.order)) 
      : -1;
    
    await this.firebaseService.addCategory({
      name,
      order: maxOrder + 1
    });
  }

  async updateCategory(id: string, name: string): Promise<void> {
    await this.firebaseService.updateCategory(id, { name });
  }

  async deleteCategory(id: string): Promise<void> {
    await this.firebaseService.deleteCategory(id);
  }

  // Application management
  async addApplication(categoryId: string, name: string): Promise<void> {
    const apps = this.applicationsData().filter(a => a.categoryId === categoryId);
    const maxOrder = apps.length > 0 
      ? Math.max(...apps.map(a => a.order)) 
      : -1;
    
    await this.firebaseService.addApplication({
      categoryId,
      name,
      order: maxOrder + 1
    });
  }

  async updateApplication(id: string, name: string): Promise<void> {
    await this.firebaseService.updateApplication(id, { name });
  }

  async deleteApplication(id: string): Promise<void> {
    await this.firebaseService.deleteApplication(id);
  }
}


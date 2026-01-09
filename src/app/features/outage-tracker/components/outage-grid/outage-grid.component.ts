import { Component, inject, signal, computed, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OutageTrackerService } from '../../../../core/services/outage-tracker.service';
import { OutageStatus, CategoryWithApplications } from '../../../../core/models/outage.model';

// PrimeNG Imports
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { ContextMenuModule } from 'primeng/contextmenu';
import { MenuItem } from 'primeng/api';
import { TextareaModule } from 'primeng/textarea';
import { RippleModule } from 'primeng/ripple';
import { ToastModule } from 'primeng/toast';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToggleSwitchModule } from 'primeng/toggleswitch';

@Component({
  selector: 'app-outage-grid',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    TooltipModule,
    DialogModule,
    InputTextModule,
    SelectModule,
    ContextMenuModule,
    TextareaModule,
    RippleModule,
    ToastModule,
    ConfirmDialogModule,
    ToggleSwitchModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './outage-grid.component.html',
  styleUrl: './outage-grid.component.scss'
})
export class OutageGridComponent implements OnInit {
  trackerService = inject(OutageTrackerService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  private platformId = inject(PLATFORM_ID);

  // Theme
  isDarkMode = true;

  // Year selection
  selectedYear = new Date().getFullYear();

  ngOnInit(): void {
    // Sync selectedYear with service
    this.selectedYear = this.trackerService.selectedYear();
    if (isPlatformBrowser(this.platformId)) {
      // Check localStorage for saved preference, default to dark
      const savedTheme = localStorage.getItem('theme');
      this.isDarkMode = savedTheme ? savedTheme === 'dark' : true;
      this.applyTheme();
    }
  }

  toggleTheme(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.applyTheme();
      localStorage.setItem('theme', this.isDarkMode ? 'dark' : 'light');
    }
  }

  onYearChange(event: { value: number }): void {
    this.trackerService.selectYear(event.value);
  }

  private applyTheme(): void {
    if (this.isDarkMode) {
      document.documentElement.classList.add('dark-mode');
      document.documentElement.classList.remove('light-mode');
    } else {
      document.documentElement.classList.remove('dark-mode');
      document.documentElement.classList.add('light-mode');
    }
  }

  // Dialog states
  showAddCategoryDialog = signal(false);
  showAddAppDialog = signal(false);
  showEditCategoryDialog = signal(false);
  showEditAppDialog = signal(false);
  showOutageDialog = signal(false);

  // Form data
  newCategoryName = signal('');
  newAppName = signal('');
  selectedCategoryId = signal('');
  editCategoryId = signal('');
  editCategoryName = signal('');
  editAppId = signal('');
  editAppName = signal('');

  // Outage dialog data
  outageDialogAppId = signal('');
  outageDialogDay = signal(0);
  outageDialogStatus = signal<OutageStatus>(OutageStatus.NONE);
  outageDialogNotes = signal('');

  // Context menu
  contextMenuItems: MenuItem[] = [];
  selectedAppId = '';
  selectedDay = 0;

  // Outage status options for dropdown
  outageStatusOptions = [
    { label: 'No Outage', value: OutageStatus.NONE },
    { label: 'Partial Outage', value: OutageStatus.PARTIAL },
    { label: 'Full Outage', value: OutageStatus.FULL }
  ];

  getOutageClass(applicationId: string, day: number): string {
    const status = this.trackerService.getOutageStatus(applicationId, day);
    switch (status) {
      case OutageStatus.PARTIAL:
        return 'outage-partial';
      case OutageStatus.FULL:
        return 'outage-full';
      default:
        return '';
    }
  }

  getOutageTooltip(applicationId: string, day: number): string {
    const outage = this.trackerService.getOutage(applicationId, day);
    if (!outage) return 'Click to add outage';
    
    const statusText = outage.status === OutageStatus.PARTIAL ? 'Partial Outage' : 'Full Outage';
    return outage.notes ? `${statusText}: ${outage.notes}` : statusText;
  }

  onCellClick(applicationId: string, day: number, event: MouseEvent): void {
    if (event.ctrlKey || event.metaKey) {
      // Ctrl+Click opens dialog for editing
      this.openOutageDialog(applicationId, day);
    } else {
      // Regular click toggles status
      this.trackerService.toggleOutageStatus(applicationId, day);
    }
  }

  onCellRightClick(event: MouseEvent, applicationId: string, day: number): void {
    event.preventDefault();
    this.selectedAppId = applicationId;
    this.selectedDay = day;
    
    const currentStatus = this.trackerService.getOutageStatus(applicationId, day);
    
    this.contextMenuItems = [
      {
        label: 'No Outage',
        icon: 'pi pi-check',
        command: () => this.setOutageStatus(OutageStatus.NONE)
      },
      {
        label: 'Partial Outage',
        icon: 'pi pi-exclamation-triangle',
        command: () => this.setOutageStatus(OutageStatus.PARTIAL)
      },
      {
        label: 'Full Outage',
        icon: 'pi pi-times-circle',
        command: () => this.setOutageStatus(OutageStatus.FULL)
      },
      { separator: true },
      {
        label: 'Add Notes...',
        icon: 'pi pi-pencil',
        command: () => this.openOutageDialog(applicationId, day)
      }
    ];
  }

  private setOutageStatus(status: OutageStatus): void {
    this.trackerService.setOutageStatus(this.selectedAppId, this.selectedDay, status);
  }

  openOutageDialog(applicationId: string, day: number): void {
    this.outageDialogAppId.set(applicationId);
    this.outageDialogDay.set(day);
    
    const outage = this.trackerService.getOutage(applicationId, day);
    this.outageDialogStatus.set(outage?.status || OutageStatus.NONE);
    this.outageDialogNotes.set(outage?.notes || '');
    
    this.showOutageDialog.set(true);
  }

  saveOutageDialog(): void {
    this.trackerService.setOutageStatus(
      this.outageDialogAppId(),
      this.outageDialogDay(),
      this.outageDialogStatus(),
      this.outageDialogNotes()
    );
    this.showOutageDialog.set(false);
    this.messageService.add({
      severity: 'success',
      summary: 'Saved',
      detail: 'Outage status updated'
    });
  }

  // Category Management
  openAddCategoryDialog(): void {
    this.newCategoryName.set('');
    this.showAddCategoryDialog.set(true);
  }

  async addCategory(): Promise<void> {
    const name = this.newCategoryName().trim();
    if (name) {
      await this.trackerService.addCategory(name);
      this.showAddCategoryDialog.set(false);
      this.messageService.add({
        severity: 'success',
        summary: 'Success',
        detail: `Category "${name}" added`
      });
    }
  }

  openEditCategoryDialog(category: CategoryWithApplications, event: Event): void {
    event.stopPropagation();
    this.editCategoryId.set(category.id);
    this.editCategoryName.set(category.name);
    this.showEditCategoryDialog.set(true);
  }

  async saveCategory(): Promise<void> {
    const name = this.editCategoryName().trim();
    if (name) {
      await this.trackerService.updateCategory(this.editCategoryId(), name);
      this.showEditCategoryDialog.set(false);
      this.messageService.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Category updated'
      });
    }
  }

  confirmDeleteCategory(category: CategoryWithApplications, event: Event): void {
    event.stopPropagation();
    this.confirmationService.confirm({
      message: `Are you sure you want to delete "${category.name}"? All applications in this category will also be deleted.`,
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      accept: async () => {
        await this.trackerService.deleteCategory(category.id);
        this.messageService.add({
          severity: 'success',
          summary: 'Deleted',
          detail: `Category "${category.name}" deleted`
        });
      }
    });
  }

  // Application Management
  openAddAppDialog(categoryId: string, event: Event): void {
    event.stopPropagation();
    this.selectedCategoryId.set(categoryId);
    this.newAppName.set('');
    this.showAddAppDialog.set(true);
  }

  async addApplication(): Promise<void> {
    const name = this.newAppName().trim();
    if (name) {
      await this.trackerService.addApplication(this.selectedCategoryId(), name);
      this.showAddAppDialog.set(false);
      this.messageService.add({
        severity: 'success',
        summary: 'Success',
        detail: `Application "${name}" added`
      });
    }
  }

  openEditAppDialog(appId: string, appName: string, event: Event): void {
    event.stopPropagation();
    this.editAppId.set(appId);
    this.editAppName.set(appName);
    this.showEditAppDialog.set(true);
  }

  async saveApplication(): Promise<void> {
    const name = this.editAppName().trim();
    if (name) {
      await this.trackerService.updateApplication(this.editAppId(), name);
      this.showEditAppDialog.set(false);
      this.messageService.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Application updated'
      });
    }
  }

  confirmDeleteApp(appId: string, appName: string, event: Event): void {
    event.stopPropagation();
    this.confirmationService.confirm({
      message: `Are you sure you want to delete "${appName}"?`,
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      accept: async () => {
        await this.trackerService.deleteApplication(appId);
        this.messageService.add({
          severity: 'success',
          summary: 'Deleted',
          detail: `Application "${appName}" deleted`
        });
      }
    });
  }

  trackByDay(index: number, day: number): number {
    return day;
  }

  trackByCategory(index: number, category: CategoryWithApplications): string {
    return category.id;
  }
}


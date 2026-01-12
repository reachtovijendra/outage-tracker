import { Component, inject, signal, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { MessageService, ConfirmationService } from 'primeng/api';
import { FirebaseService } from '../../../../core/services/firebase.service';
import { Release } from '../../../../core/models/release.model';

@Component({
  selector: 'app-release-grid',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    TableModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    TextareaModule,
    ToastModule,
    ConfirmDialogModule,
    TooltipModule,
    ToggleSwitchModule,
    DatePipe
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './release-grid.component.html',
  styleUrl: './release-grid.component.scss'
})
export class ReleaseGridComponent implements OnInit {
  private firebaseService = inject(FirebaseService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  private platformId = inject(PLATFORM_ID);

  releases = signal<Release[]>([]);
  loading = signal(true);
  expandedRows = signal<Set<string>>(new Set());

  // Dialog state
  showAddDialog = false;
  showEditDialog = false;
  
  // Form data
  newRelease = {
    changeSummary: '',
    screenshotFile: null as File | null
  };
  
  editingRelease: Release | null = null;
  editForm = {
    changeSummary: '',
    screenshotFile: null as File | null,
    existingScreenshotUrl: ''
  };
  
  uploading = signal(false);

  // Theme
  isDarkMode = true;

  ngOnInit(): void {
    this.loadReleases();
    this.initTheme();
  }

  private initTheme(): void {
    if (isPlatformBrowser(this.platformId)) {
      const savedTheme = localStorage.getItem('theme');
      this.isDarkMode = savedTheme !== 'light';
      this.applyTheme();
    }
  }

  private applyTheme(): void {
    if (isPlatformBrowser(this.platformId)) {
      document.body.classList.toggle('light-mode', !this.isDarkMode);
    }
  }

  toggleTheme(): void {
    this.isDarkMode = !this.isDarkMode;
    if (isPlatformBrowser(this.platformId)) {
      this.applyTheme();
      localStorage.setItem('theme', this.isDarkMode ? 'dark' : 'light');
    }
  }

  toggleRowExpansion(releaseId: string): void {
    const expanded = this.expandedRows();
    const newExpanded = new Set(expanded);
    
    if (newExpanded.has(releaseId)) {
      newExpanded.delete(releaseId);
    } else {
      newExpanded.add(releaseId);
    }
    
    this.expandedRows.set(newExpanded);
  }

  isRowExpanded(releaseId: string): boolean {
    return this.expandedRows().has(releaseId);
  }

  private getDefaultSDLCPhases() {
    return [
      { name: 'Prompt Understanding', completed: true },
      { name: 'Coding', completed: true },
      { name: 'Testing', completed: true },
      { name: 'Code Review', completed: true },
      { name: 'Deployment Initiated', completed: true }
    ];
  }

  private loadReleases(): void {
    this.firebaseService.getReleases().subscribe({
      next: (releases) => {
        // Add default SDLC phases if not present
        const releasesWithPhases = releases.map(release => ({
          ...release,
          sdlcPhases: release.sdlcPhases || this.getDefaultSDLCPhases()
        }));
        this.releases.set(releasesWithPhases);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading releases:', err);
        this.loading.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load releases'
        });
      }
    });
  }

  openAddDialog(): void {
    this.newRelease = { changeSummary: '', screenshotFile: null };
    this.showAddDialog = true;
  }

  onScreenshotSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.newRelease.screenshotFile = input.files[0];
    }
  }

  onEditScreenshotSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.editForm.screenshotFile = input.files[0];
    }
  }

  async addRelease(): Promise<void> {
    if (!this.newRelease.changeSummary.trim()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validation',
        detail: 'Please enter a change summary'
      });
      return;
    }

    try {
      this.uploading.set(true);
      
      let screenshotUrl: string | undefined;
      if (this.newRelease.screenshotFile) {
        // Use local assets path instead of Firebase Storage
        screenshotUrl = `/assets/screenshots/${this.newRelease.screenshotFile.name}`;
      }

      await this.firebaseService.addRelease({
        changeSummary: this.newRelease.changeSummary.trim(),
        deploymentTime: new Date(),
        screenshotUrl
      });
      
      this.showAddDialog = false;
      this.uploading.set(false);
      this.messageService.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Release added successfully'
      });
    } catch (err) {
      console.error('Error adding release:', err);
      this.uploading.set(false);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to add release'
      });
    }
  }

  openEditDialog(release: Release): void {
    this.editingRelease = release;
    this.editForm = {
      changeSummary: release.changeSummary,
      screenshotFile: null,
      existingScreenshotUrl: release.screenshotUrl || ''
    };
    this.showEditDialog = true;
  }

  async updateRelease(): Promise<void> {
    if (!this.editingRelease || !this.editForm.changeSummary.trim()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validation',
        detail: 'Please enter a change summary'
      });
      return;
    }

    try {
      this.uploading.set(true);
      
      let screenshotUrl = this.editForm.existingScreenshotUrl || undefined;
      if (this.editForm.screenshotFile) {
        // Use local assets path instead of Firebase Storage
        screenshotUrl = `/assets/screenshots/${this.editForm.screenshotFile.name}`;
      }

      await this.firebaseService.updateRelease(this.editingRelease.id!, {
        changeSummary: this.editForm.changeSummary.trim(),
        screenshotUrl
      });
      
      this.showEditDialog = false;
      this.editingRelease = null;
      this.uploading.set(false);
      this.messageService.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Release updated successfully'
      });
    } catch (err) {
      console.error('Error updating release:', err);
      this.uploading.set(false);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to update release'
      });
    }
  }

  confirmDelete(release: Release): void {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete this release entry?',
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      accept: () => this.deleteRelease(release)
    });
  }

  private async deleteRelease(release: Release): Promise<void> {
    try {
      await this.firebaseService.deleteRelease(release.id!);
      this.messageService.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Release deleted successfully'
      });
    } catch (err) {
      console.error('Error deleting release:', err);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to delete release'
      });
    }
  }

  openScreenshot(url: string): void {
    if (isPlatformBrowser(this.platformId)) {
      window.open(url, '_blank');
    }
  }
}


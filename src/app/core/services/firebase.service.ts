import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  doc,
  docData,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  where,
  writeBatch,
  Timestamp
} from '@angular/fire/firestore';
import { Observable, map, from } from 'rxjs';
import {
  Category,
  Application,
  Outage,
  OutageStatus
} from '../models/outage.model';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  private firestore = inject(Firestore);

  // Categories
  getCategories(): Observable<Category[]> {
    const categoriesRef = collection(this.firestore, 'categories');
    const q = query(categoriesRef, orderBy('order', 'asc'));
    return collectionData(q, { idField: 'id' }).pipe(
      map((categories: any[]) =>
        categories.map(cat => ({
          ...cat,
          createdAt: cat.createdAt?.toDate() || new Date(),
          updatedAt: cat.updatedAt?.toDate() || new Date()
        }))
      )
    );
  }

  async addCategory(category: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const categoriesRef = collection(this.firestore, 'categories');
    const docRef = await addDoc(categoriesRef, {
      ...category,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    return docRef.id;
  }

  async updateCategory(id: string, updates: Partial<Category>): Promise<void> {
    const categoryRef = doc(this.firestore, 'categories', id);
    await updateDoc(categoryRef, {
      ...updates,
      updatedAt: Timestamp.now()
    });
  }

  async deleteCategory(id: string): Promise<void> {
    const categoryRef = doc(this.firestore, 'categories', id);
    await deleteDoc(categoryRef);
  }

  // Applications
  getApplications(): Observable<Application[]> {
    const appsRef = collection(this.firestore, 'applications');
    const q = query(appsRef, orderBy('order', 'asc'));
    return collectionData(q, { idField: 'id' }).pipe(
      map((apps: any[]) =>
        apps.map(app => ({
          ...app,
          createdAt: app.createdAt?.toDate() || new Date(),
          updatedAt: app.updatedAt?.toDate() || new Date()
        }))
      )
    );
  }

  getApplicationsByCategory(categoryId: string): Observable<Application[]> {
    const appsRef = collection(this.firestore, 'applications');
    const q = query(
      appsRef,
      where('categoryId', '==', categoryId),
      orderBy('order', 'asc')
    );
    return collectionData(q, { idField: 'id' }).pipe(
      map((apps: any[]) =>
        apps.map(app => ({
          ...app,
          createdAt: app.createdAt?.toDate() || new Date(),
          updatedAt: app.updatedAt?.toDate() || new Date()
        }))
      )
    );
  }

  async addApplication(application: Omit<Application, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const appsRef = collection(this.firestore, 'applications');
    const docRef = await addDoc(appsRef, {
      ...application,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    return docRef.id;
  }

  async updateApplication(id: string, updates: Partial<Application>): Promise<void> {
    const appRef = doc(this.firestore, 'applications', id);
    await updateDoc(appRef, {
      ...updates,
      updatedAt: Timestamp.now()
    });
  }

  async deleteApplication(id: string): Promise<void> {
    const appRef = doc(this.firestore, 'applications', id);
    await deleteDoc(appRef);
  }

  // Outages
  getOutages(year: number, month: number): Observable<Outage[]> {
    const outagesRef = collection(this.firestore, 'outages');
    const q = query(
      outagesRef,
      where('year', '==', year),
      where('month', '==', month)
    );
    return collectionData(q, { idField: 'id' }).pipe(
      map((outages: any[]) =>
        outages.map(outage => ({
          ...outage,
          createdAt: outage.createdAt?.toDate() || new Date(),
          updatedAt: outage.updatedAt?.toDate() || new Date()
        }))
      )
    );
  }

  async setOutage(outage: Omit<Outage, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const outagesRef = collection(this.firestore, 'outages');
    
    // Check if outage already exists for this app/date
    const existingQuery = query(
      outagesRef,
      where('applicationId', '==', outage.applicationId),
      where('year', '==', outage.year),
      where('month', '==', outage.month),
      where('day', '==', outage.day)
    );
    
    const docRef = await addDoc(outagesRef, {
      ...outage,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    return docRef.id;
  }

  async updateOutage(id: string, updates: Partial<Outage>): Promise<void> {
    const outageRef = doc(this.firestore, 'outages', id);
    await updateDoc(outageRef, {
      ...updates,
      updatedAt: Timestamp.now()
    });
  }

  async deleteOutage(id: string): Promise<void> {
    const outageRef = doc(this.firestore, 'outages', id);
    await deleteDoc(outageRef);
  }

  // Batch operations for reordering
  async reorderCategories(categories: { id: string; order: number }[]): Promise<void> {
    const batch = writeBatch(this.firestore);
    categories.forEach(cat => {
      const ref = doc(this.firestore, 'categories', cat.id);
      batch.update(ref, { order: cat.order, updatedAt: Timestamp.now() });
    });
    await batch.commit();
  }

  async reorderApplications(applications: { id: string; order: number }[]): Promise<void> {
    const batch = writeBatch(this.firestore);
    applications.forEach(app => {
      const ref = doc(this.firestore, 'applications', app.id);
      batch.update(ref, { order: app.order, updatedAt: Timestamp.now() });
    });
    await batch.commit();
  }
}


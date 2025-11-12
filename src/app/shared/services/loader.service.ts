import { Injectable, signal } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class LoaderService {
  public isLoading = signal(false);

  showLoader() {
    this.isLoading.set(true);
  }

  hideLoader() {
    this.isLoading.set(false);
  }

  automaticallyHandleLoader<T>(observable: Observable<T>): Observable<T> {
    this.isLoading.set(true);
    return observable.pipe(finalize(() => this.isLoading.set(false)));
  }
}
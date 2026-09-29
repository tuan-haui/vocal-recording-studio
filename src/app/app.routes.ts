import { Routes } from '@angular/router';
import { StudioComponent } from './pages/studio/studio.component';
import { ListenComponent } from './pages/listen/listen.component';

export const routes: Routes = [
  { path: '', component: StudioComponent },
  { path: 'listen', component: ListenComponent },
  { path: '**', redirectTo: '' }
];

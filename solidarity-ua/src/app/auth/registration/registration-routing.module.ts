import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthComponent } from '../auth.component';
import { RegistrationComponent } from './registration.component';


const routes: Routes = [
  {
    path: '', component: AuthComponent, children: [
      { path: '', component: RegistrationComponent },
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RegistrationRoutingModule { }

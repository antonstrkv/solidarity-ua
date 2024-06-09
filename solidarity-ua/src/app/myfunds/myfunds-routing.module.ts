import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MyfundsComponent } from './myfunds.component';
import { AuthGuard } from '../auth/auth.guard';



const routes: Routes = [
  {
    path: '', canActivate: [AuthGuard],
    component: MyfundsComponent,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MyfundsRoutingModule { }

import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { FundsComponent } from './funds.component';
import { FundComponent } from './gathering/fund.component';
import { NewFundComponent } from './new-fund/new-fund.component';
import { AuthGuard } from '../auth/auth.guard';


const routes: Routes = [
  {
    path: '',
    component: FundsComponent, pathMatch: "full"
  },
  {
    path: 'new',
    component: NewFundComponent, pathMatch: "full", canActivate: [AuthGuard]
  },
  {
    path: ':id',
    component: FundComponent, pathMatch: "full"
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FundsRoutingModule { }

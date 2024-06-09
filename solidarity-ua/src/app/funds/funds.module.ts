import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FundsComponent } from './funds.component';
import { FundsRoutingModule } from './funds-routing.module';
import { SharedModule } from '../shared/shared.module';
import { FundComponent } from './gathering/fund.component';
import { FormsModule } from '@angular/forms';
import { NewFundComponent } from './new-fund/new-fund.component';





@NgModule({
  declarations: [FundsComponent, FundComponent, NewFundComponent],
  imports: [
    CommonModule,
    FundsRoutingModule,
    SharedModule,
    FormsModule
  ]
})
export class FundsModule { }

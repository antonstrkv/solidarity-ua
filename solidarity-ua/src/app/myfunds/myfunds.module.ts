import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MyfundsComponent } from './myfunds.component';
import { MyfundsRoutingModule } from './myfunds-routing.module';
import { SharedModule } from "../shared/shared.module";



@NgModule({
    declarations: [MyfundsComponent],
    imports: [
        CommonModule,
        MyfundsRoutingModule,
        SharedModule
    ]
})
export class MyfundsModule { }

import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { FundsService, fundPaymentType } from '../funds.service';
import { AuthService } from 'src/app/auth/auth.service';

@Component({
  selector: 'app-new-fund',
  templateUrl: './new-fund.component.html',
  styleUrls: ['./new-fund.component.css']
})
export class NewFundComponent {
  paymentType: any = fundPaymentType;

  constructor(private router: Router, private authService: AuthService, private fundsService: FundsService) { }

  onSubmit(form: NgForm) {
    if (!form.valid) return;

    const fund = {
      user_id: this.authService.userSaved?.userData?.Id,
      name: form.value.title,
      description: form.value.description,
      city: form.value.direction,
      required_amount: form.value.goal,
      photo: form.value.videoLink,
      date: new Date(form.value.expireOn).getTime(),
      type: form.value.fundType,
      payment_type: form.value.fundPaymentType,
      public_key: form.value.publicKey,
      private_key: form.value.privateKey
    }

    console.log(fund)


    let authObs: Observable<any>;
    authObs = this.fundsService.addFund(fund);

    authObs.subscribe({
      next: (resData) => {
        console.log(resData);
        this.router.navigate(['./main']);
      },
    });

    form.reset();

  }

}

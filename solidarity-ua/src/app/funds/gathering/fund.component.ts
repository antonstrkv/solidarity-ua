import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Fund, FundsService } from '../funds.service';
import { AuthService } from 'src/app/auth/auth.service';
import { NgForm } from '@angular/forms';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-fund',
  templateUrl: './fund.component.html',
  styleUrls: ['./fund.component.css']
})
export class FundComponent implements OnInit {
  Sub: Subscription;
  fundItem: Fund | null;
  id: string;
  isSaved: boolean = false;
  isCopied: boolean = false;
  url: any = ''

  sum: number;
  data: string = 'yourData';
  signature: string = 'yourSignature';

  constructor(private route: ActivatedRoute, private fundService: FundsService, private authService: AuthService, private router: Router) { }

  ngOnInit(): void {
    this.route.params.subscribe(
      (params: Params) => {
        this.id = params['id'];
      }
    );

    this.Sub = this.fundService.fundsList$.subscribe((funds: Fund[]) => {
      this.fundItem = funds.slice().find(gathering => gathering.Id === this.id) || null;
      this.checkIfSaved();
      this.url = this.fundItem?.imagePath
    })

  }

  ngOnDestroy(): void {
    this.Sub.unsubscribe();
  }

  paymentFund() {



    const paymentData = {
      version: 3,
      fund_id: this.fundItem?.Id,
      action: 'pay',
      amount: this.sum.toString(),
      currency: 'UAH',
      description: "payment",
    }

    this.fundService.paymentFund(paymentData).subscribe({
      next: (resData) => {
        this.data = resData.data;
        this.signature = resData.signature;
        setTimeout(() => {
          const form = document.getElementById('paymentForm') as HTMLFormElement;
          form.submit();
        }, 100);

      },
      error: (errorMessage) => {
        console.log(errorMessage);
      }
    });
  }

  checkIfSaved(): void {
    if (this.fundItem) {
      const favoriteFunds = this.authService.getFavoriteFunds();
      this.isSaved = favoriteFunds.includes(this.convertStringToNumber(this.fundItem.Id));
    } else {
      this.isSaved = false;
    }
  }

  convertStringToNumber(str: string): any {
    const num = Number(str);
    return isNaN(num) ? null : num;
  }

  toggleSave(): void {
    if (!this.authService.user.value) {
      this.router.navigate(['/auth']);
      return;
    }

    if (this.fundItem) {
      if (this.isSaved) {
        this.authService.removeFavoriteFund(this.convertStringToNumber(this.fundItem.Id));
      } else {
        this.authService.addFavoriteFund(this.convertStringToNumber(this.fundItem.Id));
      }
      this.isSaved = !this.isSaved;
    }
  }


  formatReceived() {
    return this.fundItem?.received.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
  }

  formatGoal() {
    return this.fundItem?.goal.toLocaleString('uk-UA');
  }

  getDaysLeft(): number {
    if (!this.fundItem) return 0;
    const today = new Date().getTime();
    const timeDifference = this.fundItem!.expireOn - today;
    const daysDifference = Math.ceil(timeDifference / (1000 * 3600 * 24));
    return daysDifference;
  }


  calculatePercentage() {
    if (!this.fundItem) return;
    const percentage = (this.fundItem!.received / this.fundItem!.goal) * 100;
    return (Math.floor(percentage) >= 100 ? 100 : Math.floor(percentage)) + '%';
  }


  copyCurrentUrlToClipboard() {
    const currentUrl = window.location.href;
    navigator.clipboard.writeText(currentUrl).then(() => {
      this.isCopied = true;
      setTimeout(() => {
        this.isCopied = false;
      }, 15000);
    }).catch(err => {
      console.error('Failed to copy URL: ', err);
    });
  }

}

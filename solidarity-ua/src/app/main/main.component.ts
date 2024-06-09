import { Component, ElementRef, OnInit } from '@angular/core';
import { Fund, FundsService } from '../funds/funds.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {
  totalReceived: string;
  totalProcessFunds: string;
  totalFunds: string;
  Sub: Subscription;
  constructor(private elementRef: ElementRef, public fundsService: FundsService) { }



  ngOnInit(): void {
    this.Sub = this.fundsService.fundsList$.subscribe((funds: Fund[]) => {
      this.getTotalReceivedFormatted(funds);
      this.calculateProcessFunds(funds);
      this.calculateAllFunds(funds)
    })
  }

  ngOnDestroy(): void {
    this.Sub.unsubscribe();
  }


  calculateAllFunds(funds: Fund[]): void {
    const total = funds.length;
    this.totalFunds = total.toLocaleString('en-US');
  }

  calculateProcessFunds(funds: Fund[]): void {
    const currentDate = Date.now(); // поточна дата у мілісекундах
    const processFunds = funds.filter(fund => fund.received < fund.goal && fund.expireOn > currentDate);
    const total = processFunds.length;
    this.totalProcessFunds = total.toLocaleString('en-US');
  }

  getTotalReceivedFormatted(funds: Fund[]): void {
    const totalReceived = funds.reduce((total, fund) => total + fund.received, 0);
    this.totalReceived = totalReceived.toFixed(0).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,') + '₴';
  }

  ngAfterViewInit() {
    const showAnswerButtons = this.elementRef.nativeElement.querySelectorAll(".faq__button");
    const answers = this.elementRef.nativeElement.querySelectorAll(".faq__answer");

    showAnswerButtons.forEach((button: any, index: any) => {
      button.addEventListener("click", function () {
        console.log("click");
        const answer = answers[index];
        if (answer.style.display === "none") {
          answer.style.display = "block";
        } else {
          answer.style.display = "none";
        }
      });
    });

  }

}

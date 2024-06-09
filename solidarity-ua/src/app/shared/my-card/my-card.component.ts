import { Component, Input, OnInit } from '@angular/core';
import { Fund, FundsService } from 'src/app/funds/funds.service';

@Component({
  selector: 'app-my-card',
  templateUrl: './my-card.component.html',
  styleUrls: ['./my-card.component.css']
})
export class MyCardComponent implements OnInit {
  @Input() fundItem: Fund;
  @Input() index: number;
  url: any = '';

  ngOnInit(): void {
    this.url = this.fundItem.imagePath;
  }

  deleteFund() {
    this.fundsService.deleteFund(this.fundItem.Id).subscribe(() => { });
  }

  convertStringToNumber(str: string): any {
    const num = Number(str);
    return isNaN(num) ? null : num;
  }

  calculatePercentage() {
    const percentage = (this.fundItem.received / this.fundItem.goal) * 100;
    return (Math.floor(percentage) >= 100 ? 100 : Math.floor(percentage)) + '%';
  }

  truncateTitle() {
    if (this.fundItem.title.length > 20) {
      return this.fundItem.title.substring(0, 20) + '...';
    }
    return this.fundItem.title;
  }

  truncateDesc() {
    if (this.fundItem.description.length > 140) {
      return this.fundItem.description.substring(0, 140) + '...';
    }
    return this.fundItem.description;
  }

  truncateUserFullName() {
    if (this.fundItem.user.userFullName.length > 15) {
      return this.fundItem.user.userFullName.substring(0, 15) + '...';
    }
    return this.fundItem.user.userFullName;
  }

  formatGoal() {
    return this.fundItem.goal.toLocaleString('uk-UA') + ' грн';
  }

  isExpired(): boolean {
    const today = new Date();
    const expireDate = new Date(this.fundItem.expireOn);
    return today > expireDate;
  }

  constructor(private fundsService: FundsService) { }
}

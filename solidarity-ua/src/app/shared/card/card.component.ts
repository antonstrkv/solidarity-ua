import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/auth/auth.service';
import { Fund } from 'src/app/funds/funds.service';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.css']
})
export class CardComponent implements OnInit {
  @Input() fundItem: Fund;
  @Input() index: number;
  isSaved: boolean = false;
   url: any = '';

  constructor(private authService: AuthService, private router: Router) { }

  ngOnInit(): void {
    this.checkIfSaved();
    this.url = this.fundItem.imagePath;
  }

  checkIfSaved() {
    const favoriteFunds = this.authService.getFavoriteFunds();
    this.isSaved = favoriteFunds.includes(this.convertStringToNumber(this.fundItem.Id));
  }

  convertStringToNumber(str: string): any {
    const num = Number(str);
    return isNaN(num) ? null : num;
  }

  toggleSave() {
    if (!this.authService.user.value) {
      this.router.navigate(['/auth']);
      return;
    }


    if (this.isSaved) {
      this.authService.removeFavoriteFund(this.convertStringToNumber(this.fundItem.Id));
    } else {
      this.authService.addFavoriteFund(this.convertStringToNumber(this.fundItem.Id));
    }
    this.isSaved = !this.isSaved;
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
}

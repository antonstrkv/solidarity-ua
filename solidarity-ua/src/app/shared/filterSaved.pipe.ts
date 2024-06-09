import { Pipe, PipeTransform } from '@angular/core';
import { Fund } from 'src/app/funds/funds.service';
import { AuthService } from 'src/app/auth/auth.service';

@Pipe({
  name: 'filterSaved'
})
export class FilterSavedPipe implements PipeTransform {
  constructor(private authService: AuthService) { }

  transform(funds: Fund[], shouldFilter: boolean): Fund[] {
    if (!shouldFilter) {
      return funds;
    }
    function convertStringToNumber(str: string): any {
      const num = Number(str);
      return isNaN(num) ? null : num;
    }

    const favoriteFunds = this.authService.getFavoriteFunds();
    return funds.filter(gathering => favoriteFunds.includes(convertStringToNumber(gathering.Id)));
  }

}

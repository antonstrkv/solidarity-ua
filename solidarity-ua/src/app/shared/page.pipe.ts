import { Pipe, PipeTransform } from '@angular/core';
import { Fund } from '../funds/funds.service';

@Pipe({
  name: 'page'
})
export class PagePipe implements PipeTransform {

  transform(gatheringList: Fund[], currentPage: number, pageSize: number): Fund[] {

    return gatheringList.slice(0, (pageSize * (currentPage + 1)));
  }

}

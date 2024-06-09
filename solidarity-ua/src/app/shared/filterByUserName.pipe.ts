import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filterByUserName'
})
export class FilterByUserNamePipe implements PipeTransform {

  transform(records: any[], userName: string, includeCompleted?: boolean): any[] {
    if (!records || !userName) {
      return records;
    }

    return records.filter(record => {
      return record.user.userName === userName &&
        (includeCompleted || record.received < record.goal);
    });
  }
}

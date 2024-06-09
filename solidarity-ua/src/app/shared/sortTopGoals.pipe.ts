// topGoals.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'sortTopGoals'
})
export class TopGoalsPipe implements PipeTransform {

  transform(items: any[], order: string, isSortByGoal: boolean, limit?: number): any[] {
    if (!items || !items.length) return [];
    if (isSortByGoal == false) return items.slice(0, limit);


    // Сортування масиву за ключем
    items.sort((a, b) => {
      if (a.goal > b.goal) {
        return order === 'asc' ? 1 : -1;
      } else if (a.goal < b.goal) {
        return order === 'asc' ? -1 : 1;
      } else {
        return 0;
      }
    });

    // Повернення обмеженої кількості записів
    return items.slice(0, limit);
  }
}

import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filterByTypes',
})
export class FilterByTypesPipe implements PipeTransform {
  transform(
    items: any[],
    selectedTypes: string[],
    isVerified: boolean,
    isCompleted: boolean,
    isExpired: boolean,
    isInProgress: boolean,
    sortOrderDesc: boolean,// Додано параметр для сортування
    isSortByGoal: boolean
  ): any[] {
    if (!items) return [];

    let filteredItems = items;

    // Фільтрація за типом збору
    if (selectedTypes.length > 0) {
      filteredItems = filteredItems.filter(item => selectedTypes.includes(item.fundType));
    }

    // Перевірка на наявність хоча б одного встановленого флага для фільтрації
    const isAnyFlagSelected = isVerified || isCompleted || isExpired || isInProgress;

    // Фільтрація за статусом збору, якщо хоча б один флаг встановлено на true
    if (isAnyFlagSelected) {
      const today = new Date();
      filteredItems = filteredItems.filter(item => {
        if (isVerified && item.user.isVerified) {
          if (isCompleted && item.goal >= item.received) {
            return true; // Верифіковано і завершено
          } else if (isExpired && item.expireOn < today) {
            return true; // Верифіковано і термін дії вийшов
          } else if (isInProgress && item.goal !== item.received && item.expireOn > today) {
            return true; // Верифіковано і в процесі
          } else if (!isCompleted && !isExpired && !isInProgress) {
            return true; // Лише верифіковано
          } else {
            return false;
          }
        } else if (!isVerified) {
          if (isCompleted && item.goal <= item.received) {
            return true; // Завершено
          } else if (isExpired && item.expireOn < today) {
            return true; // Термін дії вийшов
          } else if (isInProgress && !(item.goal <= item.received) && item.expireOn > today) {
            return true; // В процесі
          } else if (!isCompleted && !isExpired && !isInProgress) {
            return true; // Без умов
          } else {
            return false;
          }
        } else {
          return false;
        }
      });
    }

    if (!isSortByGoal) {
      // Сортування за датою expireOn
      filteredItems.sort((a, b) => {
        const dateA = new Date(a.expireOn).getTime();
        const dateB = new Date(b.expireOn).getTime();
        if (!sortOrderDesc) {
          return dateA - dateB;
        } else {
          return dateB - dateA;
        }
      });
    }


    return filteredItems;
  }
}

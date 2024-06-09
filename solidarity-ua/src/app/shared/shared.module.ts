import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { AlertComponent } from "./alert/alert.component";
import { PlaceholderDirective } from "./alert/placeholder/placeholder.directive";
import { CardComponent } from './card/card.component';
import { PagePipe } from "./page.pipe";
import { FilterByTypesPipe } from "./filter.pipe";
import { FilterByUserNamePipe } from "./filterByUserName.pipe";
import { TopGoalsPipe } from "./sortTopGoals.pipe";
import { RouterModule } from "@angular/router";
import { FilterSavedPipe } from "./filterSaved.pipe";
import { MyCardComponent } from './my-card/my-card.component';
import { SafePipe } from './safe.pipe';


@NgModule({
  declarations: [
    AlertComponent,
    PlaceholderDirective,
    CardComponent,
    PagePipe,
    FilterByTypesPipe,
    FilterByUserNamePipe,
    TopGoalsPipe,
    FilterSavedPipe,
    MyCardComponent,
    SafePipe
  ],
  imports: [CommonModule,RouterModule],
  exports: [
    AlertComponent,
    PlaceholderDirective,
    CommonModule,
    CardComponent,
    PagePipe,
    FilterByTypesPipe,
    FilterByUserNamePipe,
    TopGoalsPipe,
    FilterSavedPipe,
    MyCardComponent,
    SafePipe
  ]
})

export class SharedModule {

}

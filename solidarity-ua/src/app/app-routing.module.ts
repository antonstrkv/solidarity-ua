import { NgModule } from "@angular/core";
import { PreloadAllModules, RouterModule, Routes } from "@angular/router";
import { ProfileComponent } from "./profile/profile.component";


const appRoutes: Routes = [
  { path: '', redirectTo: '/main', pathMatch: "full" },
  { path: 'main', loadChildren: () => import('./main/main.module').then(m => m.MainModule) },
  { path: 'all-funds', loadChildren: () => import('./funds/funds.module').then(m => m.FundsModule) },
  { path: 'my-funds', loadChildren: () => import('./myfunds/myfunds.module').then(m => m.MyfundsModule) },
  { path: 'auth', loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule) },
  { path: 'signup', loadChildren: () => import('./auth/registration/registration.module').then(m => m.RegistrationModule) },
  { path: 'profile/:id', component: ProfileComponent },
  { path: '**', redirectTo: '/' }
];

@NgModule({
  imports: [RouterModule.forRoot(appRoutes, { preloadingStrategy: PreloadAllModules, scrollPositionRestoration: 'enabled' })],
  exports: [RouterModule]
})
export class AppRoutingModule {

}

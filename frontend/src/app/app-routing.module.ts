import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BookFormComponent } from './components/book-form/book-form.component';
import { BookListComponent } from './components/book-list/book-list.component';
import { HomeComponent } from './components/home/home.component';
import { UserFormComponent } from './components/user-form/user-form.component';
import { LoginFormComponent } from './components/login-form/login-form.component';
import { AuthGuard } from './guards/auth.guard';

const routes: Routes = [
  { path: 'home', component: HomeComponent, canActivate: [AuthGuard]},
  { path: 'add-book', component: BookFormComponent },
  { path: 'books', component: BookListComponent, canActivate: [AuthGuard]},
  { path: 'sign-up', component: UserFormComponent},
  { path: 'login', component: LoginFormComponent},
  { path: '', redirectTo: 'home', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

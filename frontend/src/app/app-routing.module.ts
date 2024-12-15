import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BookFormComponent } from './components/book-form/book-form.component';
import { BookListComponent } from './components/book-list/book-list.component';


const routes: Routes = [
  { path: 'add-book', component: BookFormComponent },
  { path: 'book-list', component: BookListComponent}
  // { path: '', redirectTo: '/book-form', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

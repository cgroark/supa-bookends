import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ItemFormComponent } from './components/item-form/item-form.component';


const routes: Routes = [
  { path: 'add-item', component: ItemFormComponent }, // Add the route for ItemFormComponent
  // { path: '', redirectTo: '/add-item', pathMatch: 'full' }, // Redirect default route to the item form (optional)
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

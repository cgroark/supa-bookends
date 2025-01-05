import { Component} from '@angular/core';
import { ReactiveFormsModule, FormsModule, FormControl, FormGroup, Validators, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

import { UserService } from 'src/app/services/user.service';
import { SupabaseService } from 'src/app/services/supabase.service';
import { Router, RouterModule } from '@angular/router';
import { HeaderComponent } from '../header/header.component';

export function passwordsMatchValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const password = control.get('password')?.value;
    const passwordConfirm = control.get('passwordConfirm')?.value;

    return password === passwordConfirm ? null : { passwordsMismatch: true };
  };
}

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [HeaderComponent, ReactiveFormsModule, FormsModule, RouterModule],
  templateUrl: './user-form.component.html',
  styleUrl: './user-form.component.scss',
  providers: [SupabaseService],
})
export class UserFormComponent {
  protected form: FormGroup = new FormGroup({
    first: new FormControl<string>('',{
        validators: [Validators.required]}),
    last: new FormControl<string>('',{
      validators: [Validators.required]}),
    email: new FormControl<string>('', {
      validators: [Validators.required, Validators.email]
    }),
    goal: new FormControl<number | null>(null),
    username: new FormControl<string>('',{
      validators: [Validators.required]}),
    password: new FormControl<string>('',{
      validators: [Validators.required, Validators.minLength(8)]}),
    passwordConfirm: new FormControl<string>('',{
      validators: [Validators.required]}),
  },
    { validators: passwordsMatchValidator() }
  );

  protected isLoading = false;

  protected toggleType(event: any, target: HTMLInputElement) {
    event.preventDefault();
    target.type = target.type === 'password' ? 'text' : 'password';
  }

  constructor(private userService: UserService, private supabaseService: SupabaseService, private router: Router){}

  onSubmit(): void {
    console.warn('submit', this.form);
    if (this.form.invalid) {
      console.warn('Form is invalid');
      return;
    }
    this.isLoading = true;

    const { email, first, last, username, password } = this.form.value;

    const supabaseUser = {
      email,
      password,
    };

    this.supabaseService.createUser(supabaseUser.email, supabaseUser.password)
    .then((authUser) => {
      console.log('Supabase user created successfully:', authUser);

      // Prepare data for your backend
      const backendUser = {
        id: authUser.id, // Pass the Supabase user ID
        created_at: authUser.created_at, // Pass the creation timestamp
        first,
        last,
        username,
      };
      console.log('backend user to create', backendUser)
      // Call your backend API to store user profile information
      this.userService.createUser(backendUser).subscribe({
        next: (user) => {
          console.log('Backend user created successfully:', user);
          this.isLoading = false;
          this.router.navigate(['/login'], { queryParams: { from: 'signup' } });
        },
        error: (error) => {
          console.error('Error creating user in backend:', error);
          this.isLoading = false;
        },
      });
    })
    .catch((error) => {
      console.error('Error creating user in Supabase:', error.message);
      this.isLoading = false;
    });


  }

}

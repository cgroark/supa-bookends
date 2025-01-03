import { Component } from '@angular/core';
import { ReactiveFormsModule, FormsModule, FormControl, FormGroup, Validators, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

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
  imports: [ReactiveFormsModule, FormsModule],
  templateUrl: './user-form.component.html',
  styleUrl: './user-form.component.scss'
})
export class UserFormComponent {
  protected form: FormGroup = new FormGroup({
    first: new FormControl<string>('',{
        validators: [Validators.required]}),
    last: new FormControl<string>('',{
      validators: [Validators.required]}),
    goal: new FormControl<number | null>(null),
    username: new FormControl<string>('',{
      validators: [Validators.required]}),
    password: new FormControl<string>('',{
      validators: [Validators.required, Validators.minLength(8)]}),
    passwordConfirm: new FormControl<string>('',{
      validators: [Validators.required]}),
  },
  { validators: passwordsMatchValidator() }
)
  protected toggleType(event: any, target: HTMLInputElement) {
    event.preventDefault();
    target.type = target.type === 'password' ? 'text' : 'password';
  }

  onSubmit(): void {
    console.warn('submit', this.form);
  }
}

import { Component, OnInit, Input } from '@angular/core';
import { jwtDecode}  from 'jwt-decode';
import { ReactiveFormsModule, FormsModule, FormControl, FormGroup, Validators } from '@angular/forms';
import { UserService } from 'src/app/services/user.service';
import { User } from 'src/app/models/user.model';

@Component({
  selector: 'app-user-stats',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule],
  templateUrl: './user-stats.component.html',
  styleUrl: './user-stats.component.scss'
})
export class UserStatsComponent implements OnInit {
  @Input() currentBookCount: number = 0;
  protected currentYear: number = 0;
  protected user: any;
  protected goalForCurrentYear: any;
  protected showForm = false;
  protected isSubmitting = false;
  protected isLoading = true;
  protected form: FormGroup = new FormGroup({
    goal: new FormControl<number | null>(null,{
      validators: [Validators.required]}),
  });
  protected userId: string = '';

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    // Retrieve the token from localStorage
    const token = localStorage.getItem('auth_token_bookends');
    const decodedToken: any = token ? jwtDecode(token) : null;

    if(decodedToken) {
      const userId = decodedToken.sub;
      this.userId = userId;
      this.currentYear = new Date().getFullYear();
      console.log('Decoded user ID:', userId, this.currentYear);
      this.fetchGoal();
    }
  }

  fetchGoal(): void {
    this.userService.getUserById(this.userId).subscribe({
      next: (response: User) => {
        console.warn('got user', response);
        this.user = response;
        this.goalForCurrentYear = this.user.goals.find((goal: any) => goal?.year === this.currentYear)
          && this.user.goals.find((goal: any) => goal?.year === this.currentYear).goal;
        console.warn('user set', this.user, this.goalForCurrentYear);
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error('Error fetching user:', err);
      }
    })
  }

  toggleGoalForm(): void {
    this.showForm = !this.showForm;
    this.goalForCurrentYear
      ? this.form.patchValue({goal: this.goalForCurrentYear})
      :this.form.reset();
  }

  onSubmit(): void {
    if (this.form.invalid) {
      console.warn('Form is invalid');
      return;
    }
    console.warn('form', this.form);
    this.isSubmitting = this.isLoading = true;
    const goal = {
      year: this.currentYear,
      goal: this.form.value.goal
    };

    const updatedGoals = this.user.goals.map((g:any) => g.year === goal.year ? goal : g);
    console.warn('updated', updatedGoals)
    if (!updatedGoals.some((g: any) => g.year === goal.year)) {
      updatedGoals.push(goal);
    }
    console.warn('updated push', updatedGoals)

    const updatedUser = { goals: updatedGoals };

    this.userService.updateUser(this.userId, updatedUser).subscribe({
      next: (response) => {
        console.warn('res', response);
        this.isSubmitting = false;
        this.showForm = !this.showForm;
        this.fetchGoal();
      },
      error: (error) => {
        console.error('Error updating user in backend:', error);
        this.isSubmitting = this.isLoading = false;
      },
    })

    }

  }


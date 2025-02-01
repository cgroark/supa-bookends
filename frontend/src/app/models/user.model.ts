export interface Goal {
  year: number;
  goal: number;
}

export class User {
  id: string;
  created_at: string;
  first: string;
  last: string;
  goals: Goal[];
  connections: string[];
  username: string;

  constructor(data: Partial<User>) {
    this.id = data.id || '';
    this.created_at = data.created_at || new Date().toISOString();
    this.first = data.first || '';
    this.last = data.last || '';
    this.goals = data.goals ? data.goals.map(goal => goal) : [];
    this.connections = data.connections || [];
    this.username = data.username || '';
  }

  get fullName(): string {
    return `${this.first} ${this.last}`.trim();
  }

  static fromApiResponse(response: any): User {
    return new User({
      id: response.id,
      created_at: response.created_at,
      first: response.first,
      last: response.last,
      goals: response.goals ? response.goals.map((goal: any) => ({
        year: goal.year,
        goal: goal.goal
      })) : [],
      connections: response.connections || [],
      username: response.username,
    });
  }
}

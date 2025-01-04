export class User {
  id: string;
  created_at: string;
  first: string;
  last: string;
  goal: number;
  connections: string[];
  username: string;

  constructor(data: Partial<User>) {
    this.id = data.id || '';
    this.created_at = data.created_at || new Date().toISOString();
    this.first = data.first || '';
    this.last = data.last || '';
    this.goal = data.goal || 0;
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
      connections: response.connections || [],
      username: response.username,
    });
  }
}

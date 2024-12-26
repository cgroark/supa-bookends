export class Book {
  id: number;
  title: string;
  author: string;
  overview: string | null;
  format: number | null;
  status: number | null;
  rating: number | null;
  start_date: Date | null;
  end_date: Date | null;
  comments: string | null;
  image_url: string | null;

  constructor(
    id: number,
    title: string,
    author: string,
    overview: string | null = null,
    format: number | null = null,
    status: number | null = null,
    rating: number | null = null,
    start_date: Date | null = null,
    end_date: Date | null = null,
    comments: string | null = null,
    image_url: string | null = null
  ) {
    this.id = id;
    this.title = title;
    this.author = author;
    this.overview = overview;
    this.format = format;
    this.status = status;
    this.rating = rating;
    this.start_date = start_date;
    this.end_date = end_date;
    this.comments = comments;
    this.image_url = image_url;
  }

  // Example method for displaying book info
  // getSummary(): string {
  //   return `${this.title} by ${this.author}`;
  // }
}

export class Book {
  id: number;
  title: string;
  author: string;
  overview: string | null;
  format: number | null;
  status: number | null;
  rating: number | null;
  startDate: Date | null;
  endDate: Date | null;
  comments: string | null;
  imageUrl: string | null;

  constructor(
    id: number,
    title: string,
    author: string,
    overview: string | null = null,
    format: number | null = null,
    status: number | null = null,
    rating: number | null = null,
    startDate: Date | null = null,
    endDate: Date | null = null,
    comments: string | null = null,
    imageUrl: string | null = null
  ) {
    this.id = id;
    this.title = title;
    this.author = author;
    this.overview = overview;
    this.format = format;
    this.status = status;
    this.rating = rating;
    this.startDate = startDate;
    this.endDate = endDate;
    this.comments = comments;
    this.imageUrl = imageUrl;
  }

  // Example method for displaying book info
  // getSummary(): string {
  //   return `${this.title} by ${this.author}`;
  // }
}

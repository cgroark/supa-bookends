export class Book {
  id: string;
  title: string;
  author: string;
  overview: string | null;
  format: number | null;
  status: number | null;
  rating: number | null;
  end_date: Date | null;
  comments: string | null;
  image_url: string | null;
  user_id: string | null;

  constructor(data: Partial<Book>) {
    this.id = data.id || '';
    this.title = data.title || '';
    this.author = data.author || '';
    this.overview = data.overview || '';
    this.format = data.format || null;
    this.status = data.status || null;
    this.rating = data.rating || null;
    this.end_date = data.end_date || null;
    this.comments = data.comments || '';
    this.image_url = data.image_url || '';
    this.user_id = data.user_id || '';
  }

  static fromApiResponse(response: any): Book {
    return new Book({
      id: response.id,
      title: response.title,
      author: response.author,
      overview: response.overview,
      format: response.format,
      status: response.status,
      rating: response.rating,
      end_date: response.end_date,
      comments: response.comments,
      image_url: response.image_url,
      user_id: response.user_id,
    });
  }
}

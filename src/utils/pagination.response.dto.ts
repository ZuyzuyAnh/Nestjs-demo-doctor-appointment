export class PaginationResponseDto {
  data: any[];
  total: number;
  page: number;
  limit: number;

  constructor(page: number, limit: number, data: any[], total: number) {
    this.data = data;
    this.total = total;
    this.page = page;
    this.limit = limit;
  }
}

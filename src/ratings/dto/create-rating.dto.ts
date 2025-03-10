import { IsInt, IsNotEmpty, IsOptional, Max, Min } from 'class-validator';

export class CreateRatingDto {
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @IsOptional()
  @IsNotEmpty()
  comment?: string;
}

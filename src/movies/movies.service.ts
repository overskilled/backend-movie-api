import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Movie } from '../schemas/movies.schema';
import { PaginationDto, PaginatedResponse } from '../common/dto/pagination.dto';

@Injectable()
export class MoviesService {
    constructor(@InjectModel(Movie.name) private movieModel: Model<Movie>) { }

    private async paginatedQuery(
        query: any,
        { page, limit }: PaginationDto
    ): Promise<PaginatedResponse<Movie>> {
        const [data, total] = await Promise.all([
            this.movieModel
                .find(query)
                .skip((page - 1) * limit)
                .limit(limit)
                .lean()
                .exec(),
            this.movieModel.countDocuments(query).exec()
        ]);

        return new PaginatedResponse(data, total, { page, limit });
    }
    

    async findAll(pagination: PaginationDto): Promise<PaginatedResponse<Movie>> {
        return this.paginatedQuery({}, pagination);
    }

    async filterByField(
        query: any,
        pagination: PaginationDto
    ): Promise<PaginatedResponse<Movie>> {
        return this.paginatedQuery(query, pagination);
    }

    async searchByTitle(
        title: string,
        pagination: PaginationDto
    ): Promise<PaginatedResponse<Movie>> {
        return this.paginatedQuery(
            { title: new RegExp(title, 'i') },
            pagination
        );
    }

    async getMoviesByYear(
        year: number,
        pagination: PaginationDto
    ): Promise<PaginatedResponse<Movie>> {
        return this.paginatedQuery({ year }, pagination);
    }

    async getTopRated(
        pagination: PaginationDto
    ): Promise<PaginatedResponse<Movie>> {
        return this.paginatedQuery(
            { 'imdb.rating': { $exists: true, $ne: null } },
            {
                ...pagination,
            }
        );
    }
}
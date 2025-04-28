import { Controller, Get, Query, ParseIntPipe, Param } from '@nestjs/common';
import { PaginationDto, PaginatedResponse } from '../common/dto/pagination.dto';
import { ApiQuery, ApiResponse } from '@nestjs/swagger';
import { Movie } from '../schemas/movies.schema';
import { MoviesService } from './movies.service';

@Controller('movies')
export class MoviesController {
    constructor(private readonly moviesService: MoviesService) { }

    @Get()
    @ApiQuery({ name: 'page', type: Number, example: 1 })
    @ApiQuery({ name: 'limit', type: Number, example: 10 })
    @ApiResponse({ type: PaginatedResponse })
    async findAll(
        @Query('page', ParseIntPipe) page: number = 1,
        @Query('limit', ParseIntPipe) limit: number = 10
    ): Promise<PaginatedResponse<Movie>> {
        return this.moviesService.findAll({ page, limit });
    }

    @Get('filter')
    async filterByField(
        @Query('column') column: string,
        @Query('value') value: string,
        @Query('page', ParseIntPipe) page: number = 1,
        @Query('limit', ParseIntPipe) limit: number = 10
    ): Promise<PaginatedResponse<Movie>> {
        // Handle array values (comma-separated)
        const isArrayQuery = value.includes(',');
        const parsedValue = isArrayQuery
            ? value.split(',')
            : !isNaN(Number(value))
                ? Number(value)
                : value;

        const query = isArrayQuery
            ? { [column]: { $all: parsedValue } }  // Array exact match
            : typeof parsedValue === 'number'
                ? { [column]: parsedValue }          // Numeric exact match
                : typeof parsedValue === 'string'
                    ? { [column]: { $regex: new RegExp(parsedValue, 'i') } } // Text search
                    : {}; // Fallback for invalid types

        return this.moviesService.filterByField(query, { page, limit });
    }

    @Get('search')
    @ApiQuery({ name: 'title', example: 'matrix' })
    async searchByTitle(
        @Query('title') title: string,
        @Query('page', ParseIntPipe) page: number,
        @Query('limit', ParseIntPipe) limit: number
    ): Promise<PaginatedResponse<Movie>> {
        return this.moviesService.searchByTitle(title, { page, limit });
    }

    @Get('year/:year')
    async getMoviesByYear(
        @Param('year', ParseIntPipe) year: number,
        @Query('page', ParseIntPipe) page: number,
        @Query('limit', ParseIntPipe) limit: number
    ): Promise<PaginatedResponse<Movie>> {
        return this.moviesService.getMoviesByYear(year, { page, limit });
    }

    @Get('top-rated')
    async getTopRated(
        @Query('page', ParseIntPipe) page: number,
        @Query('limit', ParseIntPipe) limit: number
    ): Promise<PaginatedResponse<Movie>> {
        return this.moviesService.getTopRated({ page, limit });
    }
}
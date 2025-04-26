// movies/movies.controller.ts
import { Controller, Get, Param, Query } from '@nestjs/common';
import { MoviesService } from './movies.service';
import { Movie } from './schemas/movies.schema';

@Controller('movies')
export class MoviesController {
    constructor(private readonly moviesService: MoviesService) { }

    @Get()
    async findAll(): Promise<Movie[]> {
        return this.moviesService.findAll();
    }

    @Get('search')
    async search(@Query('title') title: string): Promise<Movie[]> {
        return this.moviesService.searchByTitle(title);
    }

    @Get('year/:year')
    async findByYear(@Param('year') year: number): Promise<Movie[]> {
        return this.moviesService.getMoviesByYear(year);
    }

    @Get('top-rated')
    async getTopRated(@Query('limit') limit = 10): Promise<Movie[]> {
        return this.moviesService.getTopRated(limit);
    }

    @Get('paginated')
    async findAllPaginated(
        @Query('page') page = 1,
        @Query('limit') limit = 10,
    ) {
        return this.moviesService.findAllPaginated(page, limit);
    }

    // @Get(':id')
    // async findOne(@Param('id') id: string): Promise<Movie> {
    //     return this.moviesService.findById(id);
    // }
}
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Movie } from './schemas/movies.schema';

@Injectable()
export class MoviesService {
    constructor(@InjectModel(Movie.name) private movieModel: Model<Movie>) { }

    async findAll(): Promise<Movie[]> {
        return this.movieModel.find().exec();
    }

    // async findById(id: string): Promise<Movie> {
    //     return this.movieModel.findById(id).exec();
    // }

    async searchByTitle(title: string): Promise<Movie[]> {
        return this.movieModel.find({ title: new RegExp(title, 'i') }).exec();
    }

    async getMoviesByYear(year: number): Promise<Movie[]> {
        return this.movieModel.find({ year }).exec();
    }

    async findAllPaginated(page = 1, limit = 10): Promise<{ data: Movie[]; total: number }> {
        const [data, total] = await Promise.all([
            this.movieModel
                .find()
                .skip((page - 1) * limit)
                .limit(limit)
                .exec(),
            this.movieModel.countDocuments().exec(),
        ]);

        return { data, total };
    }

    async getTopRated(limit = 10): Promise<Movie[]> {
        return this.movieModel
            .find({ 'imdb.rating': { $ne: '' } })
            .sort({ 'imdb.rating': -1 })
            .limit(limit)
            .exec();
    }
}
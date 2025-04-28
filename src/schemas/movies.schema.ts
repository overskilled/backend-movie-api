import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ collection: 'movies' })
export class Movie extends Document {
    @Prop()
    plot: string;

    @Prop([String])
    genres: string[];

    @Prop()
    runtime: number;

    @Prop([String])
    cast: string[];

    @Prop()
    num_mflix_comments: number;

    @Prop()
    title: string;

    @Prop()
    fullplot: string;

    @Prop([String])
    countries: string[];

    @Prop()
    released: Date;

    @Prop([String])
    directors: string[];

    @Prop()
    rated: string;

    @Prop({
        type: {
            wins: Number,
            nominations: Number,
            text: String
        }
    })
    awards: {
        wins: number;
        nominations: number;
        text: string;
    };

    @Prop()
    lastupdated: string;

    @Prop()
    year: number;

    @Prop({
        type: {
            rating: Number,
            votes: Number,
            id: Number
        }
    })
    imdb: {
        rating: number;
        votes: number;
        id: number;
    };

    @Prop()
    type: string;

    @Prop({
        type: {
            viewer: {
                rating: Number,
                numReviews: Number,
                meter: Number
            },
            fresh: Number,
            critic: {
                rating: Number,
                numReviews: Number,
                meter: Number
            },
            rotten: Number,
            lastUpdated: Date
        }
    })
    tomatoes: {
        viewer: {
            rating: number;
            numReviews: number;
            meter: number;
        };
        fresh: number;
        critic: {
            rating: number;
            numReviews: number;
            meter: number;
        };
        rotten: number;
        lastUpdated: Date;
    };
}

export const MovieSchema = SchemaFactory.createForClass(Movie);
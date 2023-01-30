import { Schema, model } from 'mongoose';

export interface IAnswer {
    tag: string,
    text: Map<string,string>
}

const answerSchema = new Schema<IAnswer>({
    tag: {type: String, required: true},
    text: {type: Map, required: true}
})

export const Answer = model<IAnswer>('Answer', answerSchema);
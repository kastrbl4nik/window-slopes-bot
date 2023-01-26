import { ObjectId, Document, WithId } from "mongodb";

export default class User implements WithId<Document> {
    constructor(
        public username: string,
        public firstName: number,
        public lastName: string,
        public _id: ObjectId) {}
}
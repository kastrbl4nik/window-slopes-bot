import { ObjectId, Document, WithId } from "mongodb";

export default class User {
    constructor(
        public _id: ObjectId,
        public username?: string,
        public firstName?: string,
        public lastName?: string,
    ) {}
}
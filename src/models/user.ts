import { ObjectId, Document, WithId } from "mongodb";
import TelegramBot from "node-telegram-bot-api";

export default class User implements TelegramBot.User {
    constructor(
        public id: number,
        public is_bot: boolean,
        public first_name: string,
        public last_name?: string | undefined,
        public username?: string | undefined,
        public language_code?: string | undefined,
        public _id?: ObjectId
    ) {}
}
import { MongoClient, Collection } from "mongodb";
import User from "../models/user";

export const collections: { users?: Collection<User> } = {}

export async function connectToDatabase() {
    const client = new MongoClient(process.env.MONGODB_CONNECTION_STRING as string);
    await client.connect();

    const db = client.db(process.env.DB_NAME);
    collections.users = db.collection<User>(process.env.USERS_COLLECTION_NAME as string);

    console.log(`Successfully connected to database: ${db.databaseName} and collection: ${collections.users.collectionName}`);
}
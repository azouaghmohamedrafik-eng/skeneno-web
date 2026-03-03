// appwriteConfig.js
import { Client, Databases, Storage, Account } from 'appwrite';

const client = new Client()
    .setEndpoint('https://fra.cloud.appwrite.io/v1')
    .setProject('69a5b79700310daf30ec');

export const databases = new Databases(client);
export const storage = new Storage(client); // Esto elimina el error "no exported member 'storage'"
export const account = new Account(client);
export const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || '69a5ba710004207bb5a9';
export { client };
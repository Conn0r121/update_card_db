import mongoose from 'mongoose';
import cardModel from './models/card.js';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

async function main() {
    const BULK_DATA_API = "https://api.scryfall.com/bulk-data";

    // grab download uri
    const bulkDataResponse = await fetch(BULK_DATA_API);
    const bulkDataBodyStr = await bulkDataResponse.text();
    const bulkDataBody = JSON.parse(bulkDataBodyStr);
    // this line grabs the download uri for the oracle cards metadata object
    // in the future when there is a need for more than just oracle data, this can be expanded
    const oracleCardsDownloadURI = bulkDataBody.data.find(metadata => metadata.name === 'Oracle Cards').download_uri;
   
    // grab card list
    const oracleCardsResponse = await fetch(oracleCardsDownloadURI);
    const oracleCardsBodyStr = await oracleCardsResponse.text();
    const oracleCards = JSON.parse(oracleCardsBodyStr);

    // connect to db
    const databasePath = `${process.env.DATABASE_URI}/cards`;
    mongoose.connect(databasePath, {useNewUrlParser: true, useUnifiedTopology: true});
    const db = mongoose.connection;
    
    db.on('error', console.error.bind(console, 'MongoDB connection error:'));

    // add cards to db
    db.once('open', async () => {
        console.log('connected');
    
        oracleCards.forEach(async (cardJson) => {
            const query = {name: cardJson.name};
            const params = {
                upsert: true,
                new: true
            }

            const doc = await cardModel.findOneAndUpdate(query, cardJson, params);
            console.log(doc.name, ' added');
        });
    });
}

main();
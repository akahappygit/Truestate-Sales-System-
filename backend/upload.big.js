const mongoose = require('mongoose');
const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');

// --- USER CREDENTIALS ---
const username = "kumarayushanand2003";  // From your screenshot
const password = "Ayush2003";           // Your password with the @ symbol
const cluster  = "cluster0.ofklt18.mongodb.net";

// WE FIX THE LINK AUTOMATICALLY HERE:
const dbLink = `mongodb+srv://${username}:${encodeURIComponent(password)}@${cluster}/?retryWrites=true&w=majority&appName=Cluster0`;

console.log("🚀 Connecting to DB...");

mongoose.connect(dbLink)
    .then(() => console.log('✅ Connected to MongoDB! (Password accepted)'))
    .catch(err => {
        console.error('❌ Connection Failed. Check if your IP is whitelisted in Network Access.');
        console.error(err);
        process.exit(1);
    });

// Simple Schema
const Transaction = mongoose.model('Transaction', new mongoose.Schema({}, { strict: false }));

const uploadBigFile = async () => {
    console.log("📂 Reading file...");
    const filePath = path.join(__dirname, 'truestate_assignment_dataset.csv');
    
    if (!fs.existsSync(filePath)) {
        console.error("❌ File not found! Make sure 'truestate_assignment_dataset.csv' is in the backend folder.");
        process.exit(1);
    }

    try {
        await Transaction.deleteMany({});
        console.log("🗑️  Old data cleared.");
    } catch (e) { console.log("⚠️  Could not clear old data yet."); }

    let batch = [];
    let totalCount = 0;
    const stream = fs.createReadStream(filePath).pipe(csv());

    console.log("⏳ Uploading 1 MILLION records... (This takes ~2 mins)");

    for await (const row of stream) {
        // Fix numbers
        if(row['Total Amount']) row['Total Amount'] = parseFloat(row['Total Amount']);
        if(row['Quantity']) row['Quantity'] = parseInt(row['Quantity']);
        
        batch.push(row);
        
        if (batch.length >= 2000) {
            await Transaction.insertMany(batch);
            totalCount += batch.length;
            process.stdout.write(`\r✅ Uploaded ${totalCount} records...`); 
            batch = [];
        }
    }

    if (batch.length > 0) {
        await Transaction.insertMany(batch);
        totalCount += batch.length;
    }

    console.log(`\n\n🎉 DONE! Successfully uploaded ${totalCount} records.`);
    process.exit();
};

uploadBigFile();
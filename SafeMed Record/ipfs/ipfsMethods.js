const fs = require('fs');
const axios = require('axios');
const path = require('path');
const { ThirdwebStorage } = require('@thirdweb-dev/storage');
const storage = new ThirdwebStorage({
    secretKey: process.env.THIRDWEB_KEY
});

async function uploadDoc(doc) {
    const uri = await storage.upload(doc);
    return uri;
}
module.exports = uploadDoc;

module.exports.createTicketStorage = async () => {
    try {
        const doc = fs.readFileSync(path.join(__dirname, 'metadata.json'));
        const uri = await uploadDoc(doc);
        return uri;
    } catch (error) {
        console.log("Error during upload: ", error);
    }
}

module.exports.createRecordStorage = async () => {
    try {
        const doc = fs.readFileSync(path.join(__dirname, 'record.json'));
        const uri = await uploadDoc(doc);
        return uri;
    } catch (error) {
        console.log("Error during upload: ", error);
    }
}

module.exports.uploadUserDoc = async (uri, doc, docname, user) => {
    try {
        const data = await storage.downloadJSON(`ipfs://${uri}`);
        const file = fs.readFileSync(doc);
        const docurl = await storage.upload(file);
        if (user === 'patient') data.root.patient.push({ name: docname, hash: docurl });
        else if (user === 'doctor') data.root.doctor.push({ name: docname, hash: docurl });
        else if (user === 'hospital') data.root.hospital.push({ name: docname, hash: docurl });
        else if (user === 'diagnostic') data.root.diagnostic.push({ name: docname, hash: docurl });
        else throw new Error("Invalid user");
        const url = await uploadDoc(data);
        return url;
    } catch (error) {
        console.error('Error during upload: ', error);
    }
}

module.exports.uploadUserRecord = async (uri, doc, docname) => {
    try {
        const data = await storage.downloadJSON(`ipfs://${uri}`)
        const file = fs.readFileSync(doc);
        const docurl = await storage.upload(file);
        data.files.push({
            name: docname,
            hash: docurl
        })
        const url = await uploadDoc(data);
        return url;
    } catch (error) {
        console.error('Error during upload: ', err);
    }
}

module.exports.getUserDocs = async (uri) => {
    try {
        const response = await axios.get(`https://ipfs.io/ipfs/${uri}`);
        return response.data;
    } catch (error) {
        console.log(error);
    }
}
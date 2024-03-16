const { Web3 } = require('web3');
const Provider = require('@truffle/hdwallet-provider');
const MyContract = require('./../builds/contracts/VaultContract.json');
const populateNames = require('./../utils/idToName');
const ipfsMethods = require('./../ipfs/ipfsMethods')
const { getNames } = require('./../utils/idToName');
const Patient = require('../models/Patient');

const provider = new Provider(process.env.PRIVATE_KEY, process.env.INFURA_API_KEY);
const web3 = new Web3(provider);

const myContractPromise = (async () => {
    const networkId = await web3.eth.net.getId();
    return new web3.eth.Contract(MyContract.abi, MyContract.networks[networkId].address);
})();

async function processRecords(decodedData) {
    const response = [];

    for (const record of decodedData?.records || []) {
        const [recordId, patientAadhar, description, date, file, viewers] = record;
        const patient = await Patient.findOne({ aadhar: patientAadhar.toString() }).select("name");
        const viewersNames = await getNames(viewers);
        let viewersArray = [];
        for (let i = 0; i < viewers.length; i++) {
            viewersArray.push({
                aadhar: viewers[i].toString(),
                name: viewersNames[i]
            })
        }
        response.push({
            recordId: recordId.toString(),
            patientName: patient.name,
            description: description,
            date: new Date(Number(date) * 1000).toLocaleDateString(),
            file: file.substring(7),
            viewers: viewersArray
        });
    }

    return response;
}

module.exports.createRecordMethod = async function ({ patientAadhar, description, date, file }) {
    const dateParts = date.split('/');
    const formattedDate = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;
    date = Math.floor(new Date(formattedDate).getTime() / 1000);
    const myContract = await myContractPromise;
    try {
        const accounts = await web3.eth.getAccounts(); // Get available accounts
        const receipt = await myContract.methods.createRecord(web3.utils.toBigInt(patientAadhar), description, date, file)
            .send({ from: accounts[0], gas: '2000000' });
        return receipt.transactionHash;
    } catch (error) {
        console.error("Error:", error);
        throw error;
    }
}

module.exports.addFilesToRecord = async function ({ recordId, file }) {
    const myContract = await myContractPromise;
    try {
        const accounts = await web3.eth.getAccounts(); // Get available accounts
        const receipt = await myContract.methods.addFilesToRecord(recordId, file)
            .send({ from: accounts[0], gas: '2000000' });
        return receipt.transactionHash;
    } catch (error) {
        console.error("Error:", error);
        throw error;
    }
}

module.exports.grantAccess = async function ({ recordId, doctorAadhar }) {
    const myContract = await myContractPromise;
    try {
        const accounts = await web3.eth.getAccounts(); // Get available accounts
        const receipt = await myContract.methods.grantAccess(recordId, doctorAadhar)
            .send({ from: accounts[0], gas: '2000000' });
        return receipt.transactionHash;
    } catch (error) {
        console.error("Error:", error);
        throw error;
    }
}

module.exports.revokeAccess = async function ({ recordId, doctorAadhar }) {
    const myContract = await myContractPromise;
    try {
        const accounts = await web3.eth.getAccounts(); // Get available accounts
        const receipt = await myContract.methods.revokeAccess(recordId, doctorAadhar)
            .send({ from: accounts[0], gas: '2000000' });
        return receipt.transactionHash;
    } catch (error) {
        console.error("Error:", error);
        throw error;
    }
}

module.exports.getRecords = async function ({ aadhar, role }) {
    const myContract = await myContractPromise;
    try {
        const accounts = await web3.eth.getAccounts(); // Get available accounts
        let receipt;
        if (role === 'doctor') {
            receipt = await myContract.methods.getRecordsDoctor(aadhar)
                .send({ from: accounts[0], gas: '2000000' });
        }
        else {
            receipt = await myContract.methods.getRecordsPatient(aadhar)
                .send({ from: accounts[0], gas: '2000000' });
        }
        if (receipt.status.toString() != 1) throw new Error(receipt);
        const eventAbi = MyContract.abi.find(element => element.type === 'event' && element.name === 'GetRecords');
        let decodedData = web3.eth.abi.decodeLog(eventAbi.inputs, receipt.logs[0]?.data, receipt.logs[0].topics.slice(1));
        const response = await processRecords(decodedData);
        return response;
    } catch (error) {
        console.error("Error:", error);
        throw error;
    }
}
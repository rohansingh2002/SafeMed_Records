// const { Web3 } = require('web3');
// const web3 = new Web3('http://127.0.0.1:7545'); // Replace with your Ganache URL

// const Provider = require('@truffle/hdwallet-provider');
// const MyContract = require('./../builds/contracts/TicketContract.json');
// const populateNames = require('./../utils/idToName');

// const privateKeys = ['0x7dad109b7ce662d176883a6433997677f26abcae2846a9cce61a039ca3526144'];
// const account = web3.eth.accounts.privateKeyToAccount(privateKeys[0]);
// web3.eth.accounts.wallet.add(account);

// const myContractPromise = (async () => {
//     console.log("Executed");
//     const networkId = await web3.eth.net.getId();
//     return new web3.eth.Contract(MyContract.abi, MyContract.networks[networkId].address);
// })();

// module.exports.createTicketMethod = async function ({ _patientAadhar, _doctorAadhar, _diagnosticId, _hospitalId, _ipfsHash }) {
//     const myContract = await myContractPromise;
//     try {
//         const accounts = await web3.eth.getAccounts(); // Get available accounts
//         const receipt = await myContract.methods.createTicket(_patientAadhar, _doctorAadhar, _diagnosticId, _hospitalId, _ipfsHash)
//             .send({ from: accounts[0], gas: '1000000' });
//         return receipt.transactionHash;
//     } catch (error) {
//         console.error("Error:", error);
//         throw error;
//     }
// };

// module.exports.getAllTicketsMethod = async function ({ id, role }) {
//     const myContract = await myContractPromise;
//     const accounts = await web3.eth.getAccounts();
//     let receipt = 0;

//     if (role === 'hospital') receipt = await myContract.methods.getAllTicketsHospital(id).send({ from: accounts[0], gas: '1000000' });
//     else if (role === 'patient') receipt = await myContract.methods.getAllTicketsPatient(id).send({ from: accounts[0], gas: '1000000' });
//     else if (role === 'diagnostic') receipt = await myContract.methods.getAllTicketsDiagnostic(id).send({ from: accounts[0], gas: '1000000' });
//     else receipt = await myContract.methods.getAllTicketsDoctor(id).send({ from: accounts[0], gas: '1000000' });
//     // console.log(receipt)

//     if (receipt === 0) return "Something went wrong";

//     const response = [];

//     if (receipt.logs.length == 0) return response;

//     const eventAbi = MyContract.abi.find(element => element.type === 'event' && element.name === 'GetData');
//     let decodedData = web3.eth.abi.decodeLog(eventAbi.inputs, receipt.logs[0]?.data, receipt.logs[0].topics.slice(1));
//     decodedData?.tickets?.forEach(ticketData => {
//         const [ticketId, patientAadhar, doctorAadhar, diagnosticId, hospitalId, creationTimestamp, hash] = ticketData;
//         response.push({
//             ticketId: ticketId.toString(),
//             patientAadhar: patientAadhar.toString(),
//             doctorAadhar: doctorAadhar.toString(),
//             diagnosticId: diagnosticId.toString(),
//             hospitalId: hospitalId.toString(),
//             date: new Date(Number(creationTimestamp) * 1000).toLocaleDateString(),
//             hash: hash.toString()
//         });
//     });

//     return await populateNames(response);
// }

// module.exports.uploadDataMethod = async function ({ ticketId, newHash }) {
//     console.log(ticketId, newHash);
//     const myContract = await myContractPromise;
//     try {
//         const accounts = await web3.eth.getAccounts();
//         let receipt = 0;

//         receipt = await myContract.methods.updateTicketData(ticketId, newHash).send({ from: accounts[0], gas: '1000000' })
//         console.log(receipt);
//         return receipt.transactionHash;
//     } catch (error) {
//         console.log(error);
//         throw error;
//     }
// }



const { Web3 } = require('web3');
const Provider = require('@truffle/hdwallet-provider');
const MyContract = require('./../builds/contracts/TicketContract.json');
const { populateNames } = require('./../utils/idToName');


const provider = new Provider(process.env.PRIVATE_KEY, process.env.INFURA_API_KEY);
const web3 = new Web3(provider);

const myContractPromise = (async () => {
    const networkId = await web3.eth.net.getId();
    return new web3.eth.Contract(MyContract.abi, MyContract.networks[networkId].address);
})();

module.exports.createTicketMethod = async function ({ _patientAadhar, _doctorAadhar, _diagnosticId, _hospitalId, _description, _ipfsHash }) {
    const myContract = await myContractPromise;
    try {
        const accounts = await web3.eth.getAccounts(); // Get available accounts
        const receipt = await myContract.methods.createTicket(web3.utils.toBigInt(_patientAadhar), web3.utils.toBigInt(_doctorAadhar), _diagnosticId, _hospitalId, _description, _ipfsHash)
            .send({ from: accounts[0], gas: '2000000' });
        return receipt.transactionHash;
    } catch (error) {
        console.error("Error:", error);
        throw error;
    }
};

module.exports.getAllTicketsMethod = async function ({ id, role }) {
    const myContract = await myContractPromise;
    const accounts = await web3.eth.getAccounts();
    console.log(accounts);
    let receipt = 0;
    if (role === 'hospital') receipt = await myContract.methods.getAllTicketsHospital(id).send({ from: accounts[0], gas: '2000000' });
    else if (role === 'patient') receipt = await myContract.methods.getAllTicketsPatient(id).send({ from: accounts[0], gas: '2000000' });
    else if (role === 'diagnostic') receipt = await myContract.methods.getAllTicketsDiagnostic(id).send({ from: accounts[0], gas: '2000000' });
    else receipt = await myContract.methods.getAllTicketsDoctor(id).send({ from: accounts[0], gas: '2000000' });
    // console.log(receipt)
    if (receipt === 0) return "Something went wrong";

    const response = [];

    if (receipt.logs.length == 0) return response;

    const eventAbi = MyContract.abi.find(element => element.type === 'event' && element.name === 'GetData');
    let decodedData = web3.eth.abi.decodeLog(eventAbi.inputs, receipt.logs[0]?.data, receipt.logs[0].topics.slice(1));
    decodedData?.tickets?.forEach(ticketData => {
        const [ticketId, patientAadhar, doctorAadhar, diagnosticId, hospitalId, creationTimestamp, description, hash] = ticketData;
        console.log(ticketData);
        response.push({
            ticketId: ticketId.toString(),
            patientAadhar: patientAadhar.toString(),
            doctorAadhar: doctorAadhar.toString(),
            diagnosticId: diagnosticId.toString(),
            hospitalId: hospitalId.toString(),
            date: new Date(Number(creationTimestamp) * 1000).toLocaleDateString(),
            description: description,
            hash: hash.toString()
        });
    });

    return await populateNames(response);
}

module.exports.uploadDataMethod = async function ({ ticketId, newHash }) {
    const myContract = await myContractPromise;
    try {
        const accounts = await web3.eth.getAccounts();
        let receipt = 0;
        receipt = await myContract.methods.updateTicketData(ticketId, newHash).send({ from: accounts[0], gas: '2000000' })
        return receipt.transactionHash;
    } catch (error) {
        throw error;
    }
}
const TicketContract = artifacts.require("TicketContract");
const VaultContract = artifacts.require("VaultContract");
module.exports = function (deployer) {
    deployer.deploy(TicketContract).then(function () {
        console.log("Contract deployed successfully.");
    })

    deployer.deploy(VaultContract).then(function () {
        console.log("Contract deployed successfully.");
    })
};

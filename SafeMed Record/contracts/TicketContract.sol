// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

contract TicketContract {
    struct Ticket {
        bytes32 ticketId;
        uint64 patientAadhar;
        uint64 doctorAadhar;
        string diagnosticId;
        string hospitalId;
        uint256 creationTimestamp;
        string description;
        string ipfsHash;
    }

    mapping(bytes32 => Ticket) private Tickets;
    mapping(string => bytes32[]) private Hospitals;
    mapping(uint64 => bytes32[]) private Patients;
    mapping(string => bytes32[]) private Diagnostics;
    mapping(uint64 => bytes32[]) private Doctors;

    // Create new ticket for patient.
    event TicketCreated(bytes32 ticketId);

    function createTicket(
        uint64 _patientAadhar,
        uint64 _doctorAadhar,
        string calldata _diagnosticId,
        string calldata _hospitalId,
        string calldata _description,
        string calldata _ipfsHash
    ) external {
        bytes32 randomHash = keccak256(
            abi.encodePacked(block.timestamp, blockhash(block.number - 1))
        );
        bytes32 ticketId = keccak256(
            abi.encodePacked(
                _patientAadhar,
                _doctorAadhar,
                _diagnosticId,
                _hospitalId,
                randomHash
            )
        );
        Tickets[ticketId] = Ticket(
            ticketId,
            _patientAadhar,
            _doctorAadhar,
            _diagnosticId,
            _hospitalId,
            block.timestamp, // Set the creation timestamp
            _description,
            _ipfsHash
        );
        Hospitals[_hospitalId].push(ticketId);
        Patients[_patientAadhar].push(ticketId);
        Diagnostics[_diagnosticId].push(ticketId);
        Doctors[_doctorAadhar].push(ticketId);
        emit TicketCreated(ticketId);
    }

    // Get contract
    function getTicketData(
        bytes32 _ticketId
    ) public view returns (Ticket memory) {
        require(Tickets[_ticketId].patientAadhar > 0, "Invalid ticket ID");
        return Tickets[_ticketId];
    }

    event GetData(Ticket[] tickets);

    function getAllTicketsPatient(uint64 _patientAadhar) external {
        bytes32[] memory patientTickets = Patients[_patientAadhar];
        Ticket[] memory patientTicketData = new Ticket[](patientTickets.length);
        for (uint256 i = 0; i < patientTickets.length; i++) {
            patientTicketData[i] = getTicketData(patientTickets[i]);
        }
        emit GetData(patientTicketData);
    }

    function getAllTicketsDoctor(uint64 _doctorAadhar) external {
        bytes32[] memory doctorTickets = Doctors[_doctorAadhar];
        Ticket[] memory doctorTicketData = new Ticket[](doctorTickets.length);
        for (uint256 i = 0; i < doctorTickets.length; i++) {
            doctorTicketData[i] = getTicketData(doctorTickets[i]);
        }
        emit GetData(doctorTicketData);
    }

    function getAllTicketsHospital(string calldata _hospitalId) external {
        bytes32[] memory hospitalTickets = Hospitals[_hospitalId];
        Ticket[] memory hospitalTicketData = new Ticket[](
            hospitalTickets.length
        );
        for (uint256 i = 0; i < hospitalTickets.length; i++) {
            hospitalTicketData[i] = getTicketData(hospitalTickets[i]);
        }
        emit GetData(hospitalTicketData);
    }

    function getAllTicketsDiagnostic(string calldata _diagnosticId) external {
        bytes32[] memory diagnosticTickets = Diagnostics[_diagnosticId];
        Ticket[] memory diagnosticTicketData = new Ticket[](
            diagnosticTickets.length
        );
        for (uint256 i = 0; i < diagnosticTickets.length; i++) {
            diagnosticTicketData[i] = getTicketData(diagnosticTickets[i]);
        }
        emit GetData(diagnosticTicketData);
    }

    function updateTicketDiagnostic(
        bytes32 _ticketId,
        string calldata _diagnosticId
    ) external returns (bytes32) {
        Tickets[_ticketId].diagnosticId = _diagnosticId;
        return _ticketId;
    }

    function updateTicketData(
        bytes32 _ticketId,
        string calldata _newHash
    ) external returns (bytes32) {
        Tickets[_ticketId].ipfsHash = _newHash;
        return _ticketId;
    }
}

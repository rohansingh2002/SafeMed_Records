const catchAsync = require('./catchAsync');
const moment = require('moment'); // Import the moment library for date manipulation

module.exports = function (tickets, queryStr) {
    console.log(queryStr);

    // Copy tickets array to avoid modifying the original array
    let filteredTickets = [...tickets];

    if (queryStr.patientName) {
        const patientNameFilter = queryStr.patientName.toLowerCase();
        filteredTickets = filteredTickets.filter(ticket =>
            ticket.patientName.toLowerCase().includes(patientNameFilter)
        );
    }

    if (queryStr.doctorName) {
        const doctorNameFilter = queryStr.doctorName.toLowerCase();
        filteredTickets = filteredTickets.filter(ticket =>
            ticket.doctorName.toLowerCase().includes(doctorNameFilter)
        );
    }

    if (queryStr.diagnosticName) {
        const diagnosticNameFilter = queryStr.diagnosticName.toLowerCase();
        filteredTickets = filteredTickets.filter(ticket =>
            ticket.diagnosticName.toLowerCase().includes(diagnosticNameFilter)
        );
    }

    if (queryStr.hospitalName) {
        const hospitalNameFilter = queryStr.hospitalName.toLowerCase();
        filteredTickets = filteredTickets.filter(ticket =>
            ticket.hospitalName.toLowerCase().includes(hospitalNameFilter)
        );
    }

    if (queryStr.date) {
        const dateFilter = queryStr.date;
        filteredTickets = filteredTickets.filter(ticket =>
            moment(ticket.date, 'DD/MM/YYYY').format('DD/MM/YYYY') === dateFilter
        );
    }

    return filteredTickets;
};

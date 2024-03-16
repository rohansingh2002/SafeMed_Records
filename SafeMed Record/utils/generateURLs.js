module.exports = async function (data) {
    const patientFiles = data.root.patient;
    const doctorFiles = data.root.doctor;
    const hospitalFiles = data.root.hospital;
    const diagnosticFiles = data.root.diagnostic;
    const patient = patientFiles.map(item => ({
        name: item.name,
        hash: "https://ipfs.io/ipfs/" + item.hash.substring(7)
    }));
    const doctor = doctorFiles.map(item => ({
        name: item.name,
        hash: "https://ipfs.io/ipfs/" + item.hash.substring(7)
    }));
    const hospital = hospitalFiles.map(item => ({
        name: item.name,
        hash: "https://ipfs.io/ipfs/" + item.hash.substring(7)
    }));
    const diagnostic = diagnosticFiles.map(item => ({
        name: item.name,
        hash: "https://ipfs.io/ipfs/" + item.hash.substring(7)
    }));
    return { patient, doctor, hospital, diagnostic };
}
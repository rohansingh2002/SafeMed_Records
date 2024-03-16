// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

contract VaultContract {
    struct Record {
        bytes32 recordId;
        uint64 patientAadhar;
        string description;
        uint256 date;
        string file;
        uint64[] viewers;
    }

    mapping(bytes32 => Record) private Records;
    mapping(uint64 => bytes32[]) private PatientRecords;
    mapping(uint64 => bytes32[]) private DoctorRecords;

    function createRecord(
        uint64 _patientAadhar,
        string calldata _description,
        uint256 _date,
        string calldata _file
    ) public {
        bytes32 randomHash = keccak256(
            abi.encodePacked(block.timestamp, blockhash(block.number - 1))
        );
        bytes32 recordId = keccak256(
            abi.encodePacked(_patientAadhar, _date, randomHash)
        );
        Records[recordId] = Record(
            recordId,
            _patientAadhar,
            _description,
            _date,
            _file,
            new uint64[](0)
        );
        PatientRecords[_patientAadhar].push(recordId);
    }

    function addFilesToRecord(bytes32 _recordId, string calldata file) public {
        Records[_recordId].file = file;
    }

    function grantAccess(bytes32 _recordId, uint64 _doctorAadhar) public {
        DoctorRecords[_doctorAadhar].push(_recordId);
        Records[_recordId].viewers.push(_doctorAadhar);
    }

    function revokeAccess(bytes32 _recordId, uint64 _doctorAadhar) public {
        bytes32[] memory doctorRecords = DoctorRecords[_doctorAadhar];
        bytes32[] memory newRecords = new bytes32[](doctorRecords.length - 1);
        uint idx = 0;
        for (uint256 i = 0; i < DoctorRecords[_doctorAadhar].length; i++) {
            if (doctorRecords[i] != _recordId) {
                newRecords[idx] = doctorRecords[i];
                idx += 1;
            }
        }
        DoctorRecords[_doctorAadhar] = newRecords;

        Record memory record = Records[_recordId];
        uint64[] memory viewers = record.viewers;
        uint64[] memory newViewers = new uint64[](viewers.length - 1);
        idx = 0;
        for (uint64 i = 0; i < viewers.length; i++) {
            if (viewers[i] != _doctorAadhar) {
                newViewers[idx] = viewers[i];
                idx += 1;
            }
        }
        record.viewers = newViewers;
        Records[_recordId] = record;
    }

    event GetRecords(Record[] records);

    function getRecordsDoctor(uint64 _doctorAadhar) public {
        bytes32[] memory doctorRecords = DoctorRecords[_doctorAadhar];
        Record[] memory records = new Record[](doctorRecords.length);
        for (uint256 i = 0; i < doctorRecords.length; i++) {
            records[i] = Records[doctorRecords[i]];
        }
        emit GetRecords(records);
    }

    function getRecordsPatient(uint64 _patientAadhar) public {
        bytes32[] memory patientRecords = PatientRecords[_patientAadhar];
        Record[] memory records = new Record[](patientRecords.length);
        for (uint256 i = 0; i < patientRecords.length; i++) {
            records[i] = Records[patientRecords[i]];
        }
        emit GetRecords(records);
    }
}

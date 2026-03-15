// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Certificate {
    struct Cert {
        string studentName;
        string course;
        string issuedDate;
        string ipfsHash;
        address issuer;
        address receiver;
        string verificationCode;
    }

    mapping(uint256 => Cert) public certificates;
    uint256 public certificateCount;
    mapping(string => uint256) public codeToCertificateId;

    event CertificateIssued(
        uint256 indexed certificateId,
        string studentName,
        string course,
        string issuedDate,
        string ipfsHash,
        address indexed issuer,
        address indexed receiver,
        string verificationCode
    );

    function issueCertificate(
        string memory studentName,
        string memory course,
        string memory issuedDate,
        string memory ipfsHash,
        address receiver,
        string memory verificationCode
    ) public returns (uint256) {
        certificateCount++;
        certificates[certificateCount] = Cert({
            studentName: studentName,
            course: course,
            issuedDate: issuedDate,
            ipfsHash: ipfsHash,
            issuer: msg.sender,
            receiver: receiver,
            verificationCode: verificationCode
        });
        codeToCertificateId[verificationCode] = certificateCount;
        emit CertificateIssued(
            certificateCount,
            studentName,
            course,
            issuedDate,
            ipfsHash,
            msg.sender,
            receiver,
            verificationCode
        );
        return certificateCount;
    }

    function getCertificate(uint256 certificateId) public view returns (
        string memory studentName,
        string memory course,
        string memory issuedDate,
        string memory ipfsHash,
        address issuer,
        address receiver,
        string memory verificationCode
    ) {
        Cert memory cert = certificates[certificateId];
        return (
            cert.studentName,
            cert.course,
            cert.issuedDate,
            cert.ipfsHash,
            cert.issuer,
            cert.receiver,
            cert.verificationCode
        );
    }

    function getCertificateIdByCode(string memory verificationCode) public view returns (uint256) {
        return codeToCertificateId[verificationCode];
    }
}



function getUserDetails(firstName, lastName, email, phoneNumber) {
 return {
    uid:phoneNumber,
    firstName: firstName || "",
    lastName: lastName || "",
    email: email || "",
    phoneNumber: phoneNumber || "",
    updateAt: new Date(),
 }
}

module.exports = {
    getUserDetails
}
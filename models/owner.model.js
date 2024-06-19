

function getOwnerDetails(firstName, lastName, email, phoneNumber, hotelslist, address, bankDetails) {
    return {
       firstName: firstName || "",
       lastName: lastName || "",
       email: email || "",
       phoneNumber: phoneNumber || "",
       address: address || {},
    //    city:city,
    //    state: state,
    //    addressline1: addressline1,
    //    addressline2: addressline2,
    //    zipcode: zipcode,
       bankDetails: bankDetails,
       hotelslist: hotelslist && hotelslist.length > 0 ?  hotelslist : [],
       updateAt: new Date(),
    }
   }
   
   module.exports = {
       getOwnerDetails
   }
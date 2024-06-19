const axios = require('axios');
const apiBaseUrl = 'https://api.stayflexi.com/core/api/v1/beservice';
const authToken = '4CoO9ZylJ9iKzzSiLoQ';
const groupId = '26837';

async function getRequestToStayFlexi(url, requestParams) {
  try {
    const response = await axios.get(url, {
      headers: {
        'X-SF-API-KEY': authToken,
      },
      params: requestParams
    });
    return response.data;
  } catch (err) {
    console.error('Error making API request:', err.message);
    throw err;
  }
}

async function postRequestToStayFlexi(url, requestBody) {
  try {
    const response = await axios.post(url, requestBody, {
      headers: {
        'X-SF-API-KEY': authToken,
      },
    });
    return response.data;
  } catch (err) {
    console.error('Error making API request:', err.message);
    throw err;
  }
}


async function getGroupLocations() {
  const apiUrl = `${apiBaseUrl}/grouplocations`;

  try {
    const data = await getRequestToStayFlexi(apiUrl, { groupId: groupId })
    return data;
  } catch (error) {
    console.error('Error making API request:', error.message);
    throw error;
  }
}

async function getGroupHotelsByLocation(location) {
  const apiUrl = `${apiBaseUrl}/grouphotelsbylocation`;

  try {
    const data = await getRequestToStayFlexi(apiUrl, {
      groupId: groupId,
      location: location,
    })
    return data;
  } catch (error) {
    console.error('Error making API request:', error.message);
    throw error;
  }
}

async function getGroupHotels() {
  const apiUrl = `${apiBaseUrl}/grouphotels`;

  try {
    const data = await getRequestToStayFlexi(apiUrl, { groupId: groupId })
    return data;
  } catch (error) {
    console.error('Error making API request:', error.message);
    throw error;
  }
}

async function cancelBooking(bookingId) {
  const apiUrl = `${apiBaseUrl}/bookingcancellation`;

  try {
    const data = await getRequestToStayFlexi(apiUrl, { bookingId: bookingId })
    return data;
  } catch (error) {
    console.error('Error making API request:', error.message);
    throw error;
  }
}

async function getHotelContent(hotelId) {
  const apiUrl = `${apiBaseUrl}/hotelcontent`;
  try {
    const data = await getRequestToStayFlexi(apiUrl, { hotelId: hotelId })
    return data;
  } catch (error) {
    console.error('Error making API request:', error.message);
    throw error;
  }
}

async function getHotelDetailAdvanced(hotelId, checkIn, checkOut, discount) {
  const apiUrl = `${apiBaseUrl}/hoteldetailadvanced`;
  try {
    const data = await getRequestToStayFlexi(apiUrl, { hotelId: hotelId, checkin: checkIn, checkout: checkOut, discount: discount })
    return data;
  } catch (error) {
    console.error('Error making API request:', error.message);
    throw error;
  }
}

async function performBooking(details){
  const apiUrl = `${apiBaseUrl}/perform-booking`;
  try {
    const data = await postRequestToStayFlexi(apiUrl, details)
    return data;
  } catch (error) {
    console.error('Error making API request:', error.message);
    throw error;
  }
}

async function modifyBooking(bookingId, details){
  const apiUrl = `${apiBaseUrl}/modify-booking/?bookingId=${bookingId}`;
  try {
    const data = await postRequestToStayFlexi(apiUrl, details)
    return data;
  } catch (error) {
    console.error('Error making API request:', error.message);
    throw error;
  }
}

async function getBookinginfo(bookingId){
  const apiUrl = `${apiBaseUrl}/bookinginfo`;
  try {
    const data = await getRequestToStayFlexi(apiUrl, {bookingId: bookingId})
    return data;
  } catch (error) {
    console.error('Error making API request:', error.message);
    throw error;
  }
}

async function getCheckInTimes(hotelId, date){
  const apiUrl = `${apiBaseUrl}/hotelcheckin`;
  try {
    const data = await getRequestToStayFlexi(apiUrl, {hotelId: hotelId, date:date})
    return data;
  } catch (error) {
    console.error('Error making API request:', error.message);
    throw error;
  }
}

async function getCheckoutTimes(hotelId, date){
  const apiUrl = `${apiBaseUrl}/hotelcheckout`;
  try {
    const data = await getRequestToStayFlexi(apiUrl, {hotelId: hotelId, date:date})
    return data;
  } catch (error) {
    console.error('Error making API request:', error.message);
    throw error;
  }
}

async function getHotelCalendar(hotelId, fromDate, toDate){
  const apiUrl = `${apiBaseUrl}/hotelcalendar`;
  try {
    const data = await getRequestToStayFlexi(apiUrl, {hotelId: hotelId, fromDate:fromDate, toDate:toDate})
    return data;
  } catch (error) {
    console.error('Error making API request:', error.message);
    throw error;
  }
}

async function getActivePromoCodes(hotelId){
  const apiUrl = `${apiBaseUrl}/activepromocodes`;
  try {
    const data = await getRequestToStayFlexi(apiUrl, {hotelId: hotelId})
    return data;
  } catch (error) {
    console.error('Error making API request:', error.message);
    throw error;
  }
}

async function getValidPromoCodes(hotelId, checkIn, checkOut, numRooms){
  const apiUrl = `${apiBaseUrl}/validpromocodes`;
  try {
    const data = await getRequestToStayFlexi(apiUrl, {hotelId: hotelId, checkIn:checkIn, checkOut:checkOut, numRooms:numRooms})
    return data;
  } catch (error) {
    console.error('Error making API request:', error.message);
    throw error;
  }
}

async function getDiscountForPromoCode(hotelId, checkIn, checkOut, numRooms){
  const apiUrl = `${apiBaseUrl}/getpromocode`;
  try {
    const data = await getRequestToStayFlexi(apiUrl, {hotelId: hotelId, checkIn:checkIn, checkOut:checkOut, numRooms:numRooms})
    return data;
  } catch (error) {
    console.error('Error making API request:', error.message);
    throw error;
  }
}



module.exports = {
  getGroupLocations,
  getGroupHotelsByLocation,
  getGroupHotels,
  cancelBooking,
  getHotelContent,
  getHotelDetailAdvanced,
  performBooking,
  getCheckInTimes,
  getBookinginfo,
  getCheckoutTimes,
  getHotelCalendar,
  modifyBooking,
  getValidPromoCodes,
  getActivePromoCodes,
  getDiscountForPromoCode
};
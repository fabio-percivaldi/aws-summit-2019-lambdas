'use strict';
require('dotenv').config();

var dbOperation = require('./dbOperation');
var mysql = require('mysql');


var config = {
    connectionLimit: 10,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
};
// If 'client' variable doesn't exist
if (typeof pool === 'undefined') {
    // Connect to the MySQL database
    var pool = mysql.createPool(config);

    //pool.connect();
}

const bookingHandler = {
    "DELETE": deleteBooking,
    "GET": getBooking,
    "POST": postBooking,
    "PUT": putBooking,
}
const roomHandler = {
    "GET": getRoom
}
const availabilityHandler = {
    "POST": roomAvailability
}

module.exports.room = (event, context, callback) => {
    if (event.source === 'serverless-plugin-warmup') {
        console.log('WarmUP - Lambda is warm!')
        return callback(null, 'Lambda is warm!')
    }
    let httpMethod = event["httpMethod"];
    context.callbackWaitsForEmptyEventLoop = false;

    if (httpMethod in roomHandler) {
        return roomHandler[httpMethod](event)
            .then((response) => {
                callback(null, response);
            })
            .catch((error) => {
                callback(null, error);
            });
    }
}

function getRoom(event) {
    return new Promise(function (resolve, reject) {
        let queryStringParams = event["queryStringParameters"];
        let pathparams = event["pathParameters"];
        let params = queryStringParams !== null ? queryStringParams : pathparams
        return dbOperation.readDBRowsFiltered('Rooms', params, pool)
            .then((results) => {
                resolve(new lambdaResponse(200, results, "Room retrieved").response);
            })
            .catch((error) => {
                reject(new lambdaResponse(500, null, "Error retrieving the Room").response)
            })
    })
}
module.exports.booking = (event, context, callback) => {
    if (event.source === 'serverless-plugin-warmup') {
        console.log('WarmUP - Lambda is warm!')
        return callback(null, 'Lambda is warm!')
    }
    let httpMethod = event["httpMethod"];
    context.callbackWaitsForEmptyEventLoop = false;

    if (httpMethod in bookingHandler) {
        return bookingHandler[httpMethod](event)
            .then((response) => {
                callback(null, response);
            })
            .catch((error) => {
                callback(null, error);
            });
    }
}


function getBooking(event) {
    return new Promise(function (resolve, reject) {
        let queryStringParams = event["queryStringParameters"];
        let pathparams = event["pathParameters"];
        let params = queryStringParams !== null ? queryStringParams : pathparams
        return dbOperation.readDBRowsFiltered('Booking', params, pool)
            .then((results) => {
                resolve(new lambdaResponse(200, results, "Booking retrieved").response);
            })
            .catch((error) => {
                reject(new lambdaResponse(500, null, "Error retrieving the Booking").response)
            })
    })
}

function postBooking(event) {
    return new Promise(function (resolve, reject) {
        let booking = JSON.parse(event.body).booking;
        dbOperation.checkInputData('Booking', booking, pool)
            .then(() => {
                return dbOperation.insertDBRow('Booking', booking, pool)
                    .then((results) => {
                        resolve(new lambdaResponse(200, results, "Booking inserted").response);
                    })
                    .catch((error) => {
                        reject(new lambdaResponse(500, null, "Error inserting new Booking").response)
                    })
            })
            .catch((error) => {
                reject(new lambdaResponse(400, null, "Wrong Booking form submitted").response)
            });
    });
}

function putBooking(event) {
    return new Promise(function (resolve, reject) {
        let queryStringParams = event["queryStringParameters"];
        let pathparams = event["pathParameters"];
        let params = queryStringParams !== null ? queryStringParams : pathparams

        let booking = JSON.parse(event.body).booking;
        dbOperation.checkInputData('Booking', booking, pool)
            .then(() => {
                return dbOperation.updateDBRow('Booking', booking, params, pool)
                    .then((results) => {
                        resolve(new lambdaResponse(200, results, "Booking updated").response);
                    })
                    .catch((error) => {
                        reject(new lambdaResponse(500, null, "Error updating Booking").response)
                    })
            })
            .catch((error) => {
                reject(new lambdaResponse(400, null, "Wrong Booking form submitted").response)
            });
    });
}

function deleteBooking() {
    return new Promise(function (resolve, reject) {
        let queryStringParams = event["queryStringParameters"];
        let pathparams = event["pathParameters"];
        let params = queryStringParams !== null ? queryStringParams : pathparams
        return dbOperation.deleteDBRowsFiltered('Booking', params, pool)
            .then((results) => {
                resolve(new lambdaResponse(200, results, "Booking deleted").response);
            })
            .catch((error) => {
                reject(new lambdaResponse(500, null, "Error deleting the Booking").response)
            })
    })
}


module.exports.availability = (event, context, callback) => {
    if (event.source === 'serverless-plugin-warmup') {
        console.log('WarmUP - Lambda is warm!')
        return callback(null, 'Lambda is warm!')
    }
    let httpMethod = event["httpMethod"];
    context.callbackWaitsForEmptyEventLoop = false;

    if (httpMethod in availabilityHandler) {
        return availabilityHandler[httpMethod](event)
            .then((response) => {
                callback(null, response);
            })
            .catch((error) => {
                callback(null, error);
            });
    }
}

function roomAvailability(event) {
    return new Promise(function (resolve, reject) {
        let startDate, endDate, people;
        startDate = JSON.parse(event.body).Start_Date;
        endDate = JSON.parse(event.body).End_Date;
        people = JSON.parse(event.body).People;
        let queryParams = [startDate, startDate, endDate, endDate, people];
        let availabilityQuery = 'SELECT r.* FROM Rooms AS r ' +
            'WHERE r.Room_ID NOT IN ( ' +
            'SELECT b.Room_ID FROM Booking AS b ' +
            'WHERE (b.Start_Date <= ? AND b.End_Date >= ?) ' +
            'OR (b.Start_Date <= ? and b.End_Date >= ?)) ' +
            'AND r.Room_Dimension >= ?'
        availabilityQuery = mysql.format(availabilityQuery, queryParams);
        pool.query(availabilityQuery, function (error, results) {
            if (error) {
                reject(new lambdaResponse(500, error, "Error retrieving availability").response)
            } else {
                resolve(new lambdaResponse(200, results, "Availability retrieved").response);
            }
        });
    })
}
function lambdaResponse(httpCode, body, message) {
    this.response = {
        statusCode: httpCode,
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Credentials": true
        },
        body: JSON.stringify({
            body,
            message: message
        })
    };
}
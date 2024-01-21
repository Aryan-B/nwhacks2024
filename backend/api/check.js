const db = require("../database/dbConn.js");

async function getAvailableRooms(startTime) {

    // Get the current date and time
    let now = new Date();

    // Create a new Date object for the start of the day
    let today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);

    // Create a new Date object for the end of the day
    let endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 24, 0, 0, 0);


    // console.log(today, endOfDay);
    try {
        const roomsCollection = db.collection('Rooms');
        const bookedRoomsCollection = db.collection('Bookings');

        const allRooms = await roomsCollection.find().toArray();
        const roomAvailability = allRooms.reduce((acc, room) => {
            acc[room.name] = new Array(24).fill(true); // true indicates availability
            return acc;
        }, {});

        const bookings = await bookedRoomsCollection.find({
            startTime: { $gte: today },
            endTime: { $lte: endOfDay }
        }).toArray();


        // console.log(bookings);

        bookings.forEach(booking => {
            roomAvailability[booking.roomCode][booking.startTime.getHours()] = false; // Mark as booked
        });

        // console.log(roomAvailability);
        const red = [], yellow = [], green = [];
        console.log("starttime is here " + startTime.getHours());
        Object.keys(roomAvailability).forEach(code => {
            const isAvailableNow = roomAvailability[code][startTime.getHours()]; // Check if available at startHour
            const availableToday = roomAvailability[code].slice(startTime.getHours()).includes(true); // Check if available any time from startHour to end of day
        
            if (!availableToday) {
                red.push(code); // No available slots for the rest of the day
            } else if (isAvailableNow) {
                green.push(code); // Available at the specific startHour
            } else {
                yellow.push(code); // Not available at startHour but available later today
            }
        });
        

        return { red, yellow, green };
    } catch (err) {
        console.log(err);
    }
}

async function makeBooking(roomName, startHour) {
    console.log(roomName, startHour);
    const startTime = new Date(); // today's date
    startTime.setHours(startHour, 0, 0, 0); // setting the hour

    const endTime = new Date(startTime);
    endTime.setHours(endTime.getHours() + 1); // booking for 1 hour

    try {
        const roomsCollection = db.collection('Rooms');
        const bookedRoomsCollection = db.collection('Bookings');

        // Check if the room exists
        const roomExists = await roomsCollection.findOne({ name: roomName });
        if (!roomExists) {
            return { success: false, message: "Room does not exist" };
        }

        // Check if the room is already booked for the given time
        const isBooked = await bookedRoomsCollection.findOne({
            roomCode: roomName,
            startTime: { $lt: endTime },
            endTime: { $gt: startTime }
        });

        if (isBooked) {
            return { success: false, message: "Room is already booked for the requested time" };
        }

        // Insert the booking
        const booking = {
            roomCode: roomName,
            startTime: startTime,
            endTime: endTime
        };
        await bookedRoomsCollection.insertOne(booking);

        return { success: true, message: "Booking successful" };
    } catch (err) {
        console.log(err);
        return { success: false, message: "Error occurred during booking" };
    }
}

module.exports = { getAvailableRooms, makeBooking };

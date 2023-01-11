function loadAllCalendarEventsForTheDay() { // later: accept a day/date here. for now just today.
    const calendarsList = getCalendars();

    // TODO: Get all events. Put each in a POJO.
}

function getCalendars() {
    console.log("Loading calendar");
    const calendarsList = [];
    // For testing only
    const calendarId =
        "959b054ff7e3a5324ffef527bef9c8abb7070f3719787be57013b6b903f4c07c@group.calendar.google.com";

    // get the calendar
    const calendar = Calendar.CalendarApp.getCalendarById(calendarId);
    calendarsList.push(calendar);

    const calendarName = calendar.getName;
    const calendarDescription = calendar.getDescription;

    const textOutput = `Hello, world! 
          Calendar name = ${calendarName}, calendarDescription = ${calendarDescription}`;
    console.log("Loading calendar");

    return calendarsList;
}

function doNothing() {
    console.log("Doing nothing");
}
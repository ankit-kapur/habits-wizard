// TODO: Instead of making a website here, use this as a service. 
// APIs here talk to Calendar. My website just calls the APIs when needed. 

function doGet(e) {
  return HtmlService.createTemplateFromFile("Main").evaluate();
}

function getEventsForToday() {

  const calendarId = "primary";
  // const calendarId =
  // "959b054ff7e3a5324ffef527bef9c8abb7070f3719787be57013b6b903f4c07c@group.calendar.google.com";

  // get the calendar
  console.log("xxxxxx");

  // Add query parameters in optionalArgs
  const optionalArgs = {
      timeMin: (new Date()).toISOString(),
      showDeleted: false,
      singleEvents: true,
      maxResults: 10,
      orderBy: 'startTime'
      // use other optional query parameter here as needed.
  };

  const eventsList = Calendar.Events.list(calendarId, optionalArgs);
  console.log(eventsList);
  return eventsList;
}

// ---- (low priority) todo later
// Embed this on my site:
// https://sites.google.com/d/1VH7j0XoZSaRqDAc3_gqGtGsPS2CHdjox/p/1psN03JdqiFiD5o5Ucz6jTmrVvLLgoTen/edit
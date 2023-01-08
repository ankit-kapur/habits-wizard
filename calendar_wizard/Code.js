function doGet(e) {

  // var params = JSON.stringify(e);
  // return HtmlService.createHtmlOutput(params);

    return ContentService.createTextOutput('Hello, world!');

  /*
    TODO: Goal of this thing is to allow me to
          see the day's events and update them.

    UX:
    1. Shows today's events
        * as rows. 1 event per row.
        * (future: < and > buttons for other days)
    2. 'Status' Button on each event
        * status = deferred, done, failed, skipped, vacation.
        * 

    How it works:
    1. Reads from GoogleSheet. Filter by date.
    2. Displays events of the day as rows.
    3. Updates are written back to Sheets.
    4. Other app will sync Sheets updates to Calendar.
    
    ..... or should this app DIRECTLY talk to Calendar?
    maybe that's easier.
  */


  /* TODO: How does this tie to the other app?
     The one that syncs Calendar <---> Sheet
  */
}

// ---- (low priority) todo later
// Embed this on my site:
// https://sites.google.com/d/1VH7j0XoZSaRqDAc3_gqGtGsPS2CHdjox/p/1psN03JdqiFiD5o5Ucz6jTmrVvLLgoTen/edit
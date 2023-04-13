// To learn how to use this script, refer to the documentation:
// https://developers.google.com/apps-script/samples/automations/calendar-timesheet

/*
Copyright 2022 Jasper Duizendstra

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    https://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

/**
 * The main function used for the synchronisation
 * @param {Object} par The main parameter object.
 * @return {Object} The myTime Object.
 */
const myTime = (par) => {
  'use strict';

  /**
  * Format the sheet
  */
  const formatSheet = () => {
    // sort decending on start date 
    eventsSheet.sort(3, false);

    // hide the technical columns
    eventsSheet.hideColumns(1, 2);

    // remove any extra rows
    if (eventsSheet.getLastRow() > 1 && eventsSheet.getLastRow() < eventsSheet.getMaxRows()) {
      eventsSheet.deleteRows(eventsSheet.getLastRow() + 1, eventsSheet.getMaxRows() - eventsSheet.getLastRow());
    }

    // set the validation for the customers
    let rule = SpreadsheetApp.newDataValidation()
      .requireValueInRange(categoriesSheet.getRange('A2:A'), true)
      .setAllowInvalid(true)
      .build();
    eventsSheet.getRange('I2:I').setDataValidation(rule);

    // set the validation for the projects
    rule = SpreadsheetApp.newDataValidation()
      .requireValueInRange(categoriesSheet.getRange('B2:B'), true)
      .setAllowInvalid(true)
      .build();
    eventsSheet.getRange('J2:J').setDataValidation(rule);

    // set the validation for the tsaks
    rule = SpreadsheetApp.newDataValidation()
      .requireValueInRange(categoriesSheet.getRange('C2:C'), true)
      .setAllowInvalid(true)
      .build();
    eventsSheet.getRange('K2:K').setDataValidation(rule);

    if(isUseCategoriesAsCalendarItemTitle) {
      eventsSheet.getRange('L2:L').setFormulaR1C1('IF(OR(R[0]C[-3]="tbd";R[0]C[-2]="tbd";R[0]C[-1]="tbd");""; CONCATENATE(R[0]C[-3];"|";R[0]C[-2];"|";R[0]C[-1];"|"))');
    }
    // set the hours, month, week and number collumns
    eventsSheet.getRange('P2:P').setFormulaR1C1('=IF(R[0]C[-12]="";"";R[0]C[-12]-R[0]C[-13])');
    eventsSheet.getRange('Q2:Q').setFormulaR1C1('=IF(R[0]C[-13]="";"";month(R[0]C[-13]))');
    eventsSheet.getRange('R2:R').setFormulaR1C1('=IF(R[0]C[-14]="";"";WEEKNUM(R[0]C[-14];2))');
    eventsSheet.getRange('S2:S').setFormulaR1C1('=R[0]C[-3]');
  };

  /**
   * Run the synchronisation
   */
  function run() {
    console.log('Started processing hours.');

    const processCalendar = (setting) => {
      // What's being flushed here?
      SpreadsheetApp.flush();

      // current calendar info
      const calendarName = setting.name;
      const calendarId = setting.id;

      console.log(`processing ${calendarName} with the id ${calendarId} from ${syncStartDate} to ${syncEndDate}`);

      // get the calendar
      const calendar = CalendarApp.getCalendarById(calendarId);

      // get the calendar events and create
      const events = calendar.getEvents(syncStartDate, syncEndDate);
      const eventsLookup = events.reduce((jsn, event) => {
        jsn[event.getId()] = event;
        return jsn;
      }, {});

      // -------------------------------------------- Load existing event IDs.
      // TODO: Make an Event POJO. 
      const existingEvents = eventsSheet.getDataRange().getValues().slice(1);
      const existingEventsLookUp = existingEvents.reduce((jsn, row, index) => {
        if (row[0] !== calendarId) {
          return jsn;
        }
        jsn[row[1]] = { // eventId is here
          event: row,
          row: index + 2
        };
        return jsn;
      }, {});

      // ------------------------------------------------------ Start of handleEvent
      const handleEvent = (event) => {
        const eventId = event.getId();

        // NEW event
        if (!existingEventsLookUp[eventId]) {

          // TODO: Set row color here.
          // Reference: https://developers.google.com/apps-script/reference/calendar
          
          eventsSheet.appendRow([
            calendarId,
            eventId,
            event.getStartTime(),
            event.getEndTime(),

            // TODO: Remove useless columns

            calendarName,
            event.getCreators().join(','),
            event.getTitle(),
            event.getDescription(),

            // TODO: Figure out how to set TAGS in Calendar

            event.getTag('Client') || 'tbd',
            event.getTag('Project') || 'tbd',
            event.getTag('Task') || 'tbd',
            (isUpdateCalendarItemTitle) ? '' : event.getTitle(),
            (isUpdateCalendarItemDescription) ? '' : event.getDescription(),
            event.getGuestList().map((guest) => guest.getEmail()).join(','),
            event.getLocation(),
            undefined,
            undefined,
            undefined,
            undefined
          ]);
          return true;
        }

        // Existing event
        const existingEvent = existingEventsLookUp[eventId].event;


        if (event.getStartTime() - existingEvent[startTimeColumn - 1] !== 0) {
          eventsSheet.getRange(exisitingEventRow, startTimeColumn).setValue(event.getStartTime());
        }

        if (event.getEndTime() - existingEvent[endTimeColumn - 1] !== 0) {
          eventsSheet.getRange(exisitingEventRow, endTimeColumn).setValue(event.getEndTime());
        }

        if (event.getCreators().join(',') !== existingEvent[creatorsColumn - 1]) {
          eventsSheet.getRange(exisitingEventRow, creatorsColumn).setValue(event.getCreators()[0]);
        }

        if (event.getGuestList().map((guest) => guest.getEmail()).join(',') !== existingEvent[guestListColumn - 1]) {
          eventsSheet.getRange(exisitingEventRow, guestListColumn).setValue(event.getGuestList().map((guest) => guest.getEmail()).join(','));
        }

        if (event.getLocation() !== existingEvent[locationColumn - 1]) {
          eventsSheet.getRange(exisitingEventRow, locationColumn).setValue(event.getLocation());
        }

        if(event.getTitle() !== existingEvent[titleColumn - 1]) {
          if(!isUpdateCalendarItemTitle) {
            eventsSheet.getRange(exisitingEventRow, titleColumn).setValue(event.getTitle());
          }
          if(isUpdateCalendarItemTitle) {
            event.setTitle(existingEvent[titleColumn - 1]);
          }
        }
       
        if(event.getDescription() !== existingEvent[descriptionColumn - 1]) { 
          if(!isUpdateCalendarItemDescription) {
            eventsSheet.getRange(exisitingEventRow, descriptionColumn).setValue(event.getDescription());
          }
          if(isUpdateCalendarItemDescription) {
            event.setDescription(existingEvent[descriptionColumn - 1]);
          }
        }

        return true;
      }; 
      // ------------------------------------------------------ End of handleEvent

      // process each event for the calendar
      events.every(handleEvent);

      // remove any events in the sheet that are not in the calendar
      existingEvents.every((event, index) => {
        if (event[0] !== calendarId) {
          return true;
        };

        if (eventsLookup[event[1]]) {
          return true;
        }
        
        if (event[3] < syncStartDate) {
          return true;
        }

        eventsSheet.getRange(index + 2, 1, 1, 20).clear();
        return true;
      });

      return true;
    };

    // Process EACH calendar
    settings.calendarSettings
        .filter((calenderSetting) => calenderSetting.sync === true)
        .every(processCalendar);

    formatSheet();
    SpreadsheetApp.setActiveSheet(eventsSheet);

    console.log('Finished processing hours.');
  }

  const mainSpreadSheetId = par.mainSpreadsheetId;
  const mainSpreadsheet = SpreadsheetApp.openById(mainSpreadSheetId);
  const eventsSheet = mainSpreadsheet.getSheetByName('Hours');
  const categoriesSheet = mainSpreadsheet.getSheetByName('Categories');
  const settings = getSettings();

  const syncStartDate = new Date();
  syncStartDate.setDate(syncStartDate.getDate() - Number(settings.syncFrom));
  
  const syncEndDate = new Date();
  syncEndDate.setDate(syncEndDate.getDate() + Number(settings.syncTo));
  
  const isUpdateCalendarItemTitle = settings.isUpdateCalendarItemTitle;
  const isUseCategoriesAsCalendarItemTitle = settings.isUseCategoriesAsCalendarItemTitle;
  const isUpdateCalendarItemDescription = settings.isUpdateCalendarItemDescription;

  const startTimeColumn = 3;
  const endTimeColumn = 4;
  const creatorsColumn = 6;
  const originalTitleColumn = 7;
  const originalDescriptionColumn = 8;
  const clientColumn = 9;
  const projectColumn = 10;
  const taskColumn = 11;
  const titleColumn = 12;
  const descriptionColumn = 13;
  const guestListColumn = 14;
  const locationColumn = 15;

  return Object.freeze({
    run: run,
  });
};

/**
 * Runs when the spreadsheet is opened and adds the menu options
 * to the spreadsheet menu
 */
const onOpen = () => {
  SpreadsheetApp.getUi()
    .createMenu('My Time Tracker')
    .addItem('Sync calendar events', 'run')
    .addItem('Settings', 'settings')
    .addToUi();
};

/**
 * Opens the sidebar
 */
const settings = () => {
  const html = HtmlService.createHtmlOutputFromFile('Page')
    .setTitle('Settings');

  SpreadsheetApp.getUi().showSidebar(html);
};

/**
* returns the settings from the script properties
*/
const getSettings = () => {
  const settings = {};
  
  // get the current settings
  const savedCalendarSettings = JSON.parse(PropertiesService.getScriptProperties().getProperty('calendar') || '[]');
  
  // get the primary calendar
  const primaryCalendar = CalendarApp.getAllCalendars()
    .filter((cal) => cal.isMyPrimaryCalendar())
    .map((cal) => ({
      name: 'Primary calendar',
      id: cal.getId()
    }));
    
  // get the secondary calendars
  const secundaryCalendars = CalendarApp.getAllCalendars()
    .filter((cal) => cal.isOwnedByMe() && !cal.isMyPrimaryCalendar())
    .map((cal) => ({
      name: cal.getName(),
      id: cal.getId()
    }));

  // the current available calendars
  const availableCalendars = primaryCalendar.concat(secundaryCalendars);
  
  // find any calendars that were removed
  const unavailebleCalendars = [];
  savedCalendarSettings.forEach((savedCalendarSetting) => {
    if (!availableCalendars.find((availableCalendar) => availableCalendar.id === savedCalendarSetting.id)) {
      unavailebleCalendars.push(savedCalendarSetting);
    }
  });
 
  // map the current settings to the available calendars
  const calendarSettings = availableCalendars.map((availableCalendar) => {
    if (savedCalendarSettings.find((savedCalendar) => savedCalendar.id === availableCalendar.id)) {
      availableCalendar.sync = true;

    }
    return availableCalendar;
  });

  // add the calendar settings to the settings
  settings.calendarSettings = calendarSettings;

  const savedFrom = PropertiesService.getScriptProperties().getProperty('syncFrom');
  settings.syncFrom = savedFrom;
 
  const savedTo = PropertiesService.getScriptProperties().getProperty('syncTo');
  settings.syncTo = savedTo;

  const savedIsUpdateTitle = PropertiesService.getScriptProperties().getProperty('isUpdateTitle') === 'true';
  settings.isUpdateCalendarItemTitle = savedIsUpdateTitle;

  const savedIsUseCategoriesAsCalendarItemTitle = PropertiesService.getScriptProperties().getProperty('isUseCategoriesAsCalendarItemTitle') === 'true';
  settings.isUseCategoriesAsCalendarItemTitle = savedIsUseCategoriesAsCalendarItemTitle;

  const savedIsUpdateDescription = PropertiesService.getScriptProperties().getProperty('isUpdateDescription') === 'true';
  settings.isUpdateCalendarItemDescription = savedIsUpdateDescription;
  
  return settings;
};

/**
* Saves the settings from the sidebar
*/
const saveSettings = (settings) => {
  PropertiesService.getScriptProperties().setProperty('calendar', JSON.stringify(settings.calendarSettings));
  PropertiesService.getScriptProperties().setProperty('syncFrom', settings.syncFrom);
  PropertiesService.getScriptProperties().setProperty('syncTo', settings.syncTo);
  PropertiesService.getScriptProperties().setProperty('isUpdateTitle', settings.isUpdateCalendarItemTitle);
  PropertiesService.getScriptProperties().setProperty('isUseCategoriesAsCalendarItemTitle', settings.isUseCategoriesAsCalendarItemTitle);
  PropertiesService.getScriptProperties().setProperty('isUpdateDescription', settings.isUpdateCalendarItemDescription);
  return 'Settings saved';
};

/**
 * Builds the myTime object and runs the synchronisation
 */
const run = () => {
  'use strict';
  myTime({
    mainSpreadsheetId: SpreadsheetApp.getActiveSpreadsheet().getId(),
  }).run();
};

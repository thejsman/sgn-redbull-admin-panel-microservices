export const dateOnMonday = (today) => {
    let thisMondayDate = new Date(today);
    let weekDayNumber = thisMondayDate.getDay();
    weekDayNumber = weekDayNumber == 0 ? 7 : weekDayNumber;
    thisMondayDate = new Date(thisMondayDate.setDate(thisMondayDate.getDate() - weekDayNumber + 1));
    let lastMondayDate = new Date(thisMondayDate);
    lastMondayDate = new Date(lastMondayDate.setDate(lastMondayDate.getDate() - 7));
    return {
        thisMondayDate,
        lastMondayDate

    };
};

export const thisWeekAndLastWeekNumber = (today) => {
    let thisMondayDate = new Date(today);
    let weekDayNumber = thisMondayDate.getDay();
    weekDayNumber = weekDayNumber == 0 ? 7 : weekDayNumber;
    thisMondayDate = new Date(thisMondayDate.setDate(thisMondayDate.getDate() - weekDayNumber + 1));
    let lastMondayDate = new Date(thisMondayDate);
    lastMondayDate = new Date(lastMondayDate.setDate(lastMondayDate.getDate() - 7));
    let thisWeekNumber = `${thisMondayDate.toISOString().slice(0, 10)}To${new Date(thisMondayDate.setDate(thisMondayDate.getDate() + 6)).toISOString().slice(0, 10)}`;
    let lastWeekNumber = `${lastMondayDate.toISOString().slice(0, 10)}To${new Date(lastMondayDate.setDate(lastMondayDate.getDate() + 6)).toISOString().slice(0, 10)}`;
    return {
        thisWeekNumber,
        lastWeekNumber

    };
};

export const weekNumber = (Tdate) => {
    let mondayDate = new Date(Tdate);
    let weekDayNumber = mondayDate.getDay();
    weekDayNumber = weekDayNumber == 0 ? 7 : weekDayNumber;
    mondayDate = new Date(mondayDate.setDate(mondayDate.getDate() - weekDayNumber + 1));
    let weekNumber = `${mondayDate.toISOString().slice(0, 10)}To${new Date(mondayDate.setDate(mondayDate.getDate() + 6)).toISOString().slice(0, 10)}`;
    return weekNumber;
};


export const datesOfTheWeek = (startDate) => {
    return [1, 2, 3, 4, 5, 6, 7].map((x, y) => {
        x = new Date(new Date().setDate((new Date(startDate).getDate() + y))).toISOString().slice(0, 10);
        return x;
    });
};

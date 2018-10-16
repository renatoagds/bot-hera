// get all rows from a table
const getTableRows = async page => {
  const rows = await page.$$('tbody > tr');
  return rows;
};

// get columns values (if contains a return link)
const getColumns = async row => await row.$$eval('td',
  nodes => nodes.map(node => {
    if (node.querySelector('a')) {
      return node.querySelector('a').href;
    } else {
      return node.innerHTML;
    }
  })
);

// map service table to object
const getTableInfo = rows => rows.map(
  async row => {
    const columns = await getColumns(row);
    return {
      id: columns[0],
      open: columns[1],
      date: columns[2],
      name: columns[3],
      link: columns[4]
    };
  }
);

// map table calendar to object
const getTableCalendar = rows => rows.map(
  async row => {
    const columns = await getColumns(row);
    return {
      id: columns[0],
      time: columns[1],
      link: columns[2]
    };
  }
);

// pick a time and return it
const scheduleAnTime = (cli, availableHours) => {
  const noTimeMessage = 'Não existem horários disponíveis.';
  const time = cli.time || [];
  const hasTime = !availableHours[0].id.includes(noTimeMessage);
  const betweenTime = hour => hour >= time[0] && hour <= time[1];
  const randomIndex = arr => Math.floor(Math.random() * arr.length);
  const inRange = hours => hours.filter(hour => betweenTime(hour.time));

  if (hasTime) {
    const available = time.length > 0 ? inRange(availableHours) : availableHours;
    const selectedHour = available[randomIndex(available)];
    return selectedHour;
  } else {
    return null;
  }
};

module.exports = {
  getTableRows,
  getTableInfo,
  getTableCalendar,
  scheduleAnTime
};

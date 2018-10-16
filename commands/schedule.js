const puppeteer = require('puppeteer');
const {getTableInfo, getTableRows, getTableCalendar, scheduleAnTime} = require('./utils');
const heraMainUrl = 'http://csys.herabrasil.com/login.asp';
const scheduleUrl = 'http://csys.herabrasil.com/ver_agenda.asp';

module.exports = (password, cli) => puppeteer.launch().then(async browser => {
  const silent = cli.silent;
  const local = cli.local || 'lt';
  const log = msg => !silent ? console.log(msg) : null;

  try {
    // init a new page
    const page = await browser.newPage();

    // go to main URL and authenticate
    log(`Navegando para a página da Hera...`);
    await page.goto(heraMainUrl);

    // auth
    log(`Autenticando...`);
    await page.type('input[type="password"]', password);
    await page.click('input[type="submit"]');
    await page.waitForSelector('#dreamworks_container');

    // go to calendar
    log('Navegando para a pagina da agenda...');
    await page.goto(scheduleUrl);

    // get table rows
    const tableRows = await getTableRows(page);
    tableRows.shift();

    if (tableRows.length > 0) {
      log('Resgatando informações da agenda...')

      await Promise.all(getTableInfo(tableRows)).then(
        async rows => {
          if (!['l4b', 'lt'].includes(local)) {
            console.log(`Erro: Especifique um local entre l4b e lt`);
            process.exit(1);
          } else {
            const basedText = local === 'lt' ? 'Loggi Tower' : 'L4B';
            const filtered = rows.filter(row => row.name.includes(basedText));
            const pickAnTime = async service => {
              log(`Resgatando horários para: ${service.name}...`);
              await page.goto(service.link);

              // get all available times
              const calendar = await getTableRows(page);
              calendar.shift();

              await Promise.all(getTableCalendar(calendar)).then(async availableHours => {
                const available = scheduleAnTime(cli, availableHours);
                if (available) {
                  log(`Reservando o horário ${available.time} para o dia ${service.date} na agenda ${service.name}...`);
                  await page.goto(available.link);
                  await browser.close();
                  process.exit(0);
                } else {
                  console.log(`Erro: Não existem horários disponíveis para a agenda ${service.name}`);
                }
              });
            }

            if (filtered.length > 0) {
              for (let item of filtered) await pickAnTime(item);
              process.exit(0);
            } else {
              console.log('Erro: Nenhum calendário disponível');
              process.exit(1);
            }
          }
        }
      );
    } else {
      console.log(`Erro: Nenhum calendário encontrado`);
      process.exit(1);
    }
  } catch (e)  {
    console.log(`Erro: ${e.message}`);
    process.exit(1);
  }
});

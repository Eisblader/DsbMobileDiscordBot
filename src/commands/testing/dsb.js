const puppeteer = require("puppeteer");
// const chalk = require("chalk");
// const moment = require("moment");
require("dotenv/config");
const {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  Client,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("dsb")
    .setDescription("Vertretungsplan")
    .setDMPermission(false),
  // .addSubcommand((subcommand) =>
  //   subcommand
  //     .setName("all")
  //     .setDescription("Allgemeiner Vertretungsplan für alle")
  // )
  // .addSubcommand((subcommand) =>
  //   subcommand
  //     .setName("user")
  //     .setDescription("Vertretungsplan für die ausführende Person")
  // ),
  /**
   *
   * @param {ChatInputCommandInteraction} interaction
   * @param {Client} client
   */
  async execute(interaction, client) {
    await interaction.deferReply({ ephemeral: false });

    /**
     * @typedef {{
     *  klasse: string
     *  stunde: string
     *  vertretung: string
     *  raum: string
     *  lehrer: string
     *  fach: string
     *  notiz: string
     *  entfall: boolean
     * }} DayEntry
     *
     * @typedef {{
     *  date: string
     *  day: string
     *  dayEntries: DayEntry[]
     * }} Day
     */

    /** @param {import("puppeteer").Browser} browser @param {string} url */
    const parsePlanFromUrl = async (browser, url) => {
      const page = await browser.newPage();
      await page.goto(url);

      const days = await page.$$eval(
        "center:has(.mon_title)",
        (dayCenterElems) =>
          dayCenterElems.map((e) => {
            const dateRegex = /\d{1,2}\.\d{1,2}\.\d{1,4}/;
            const dayRegex = /Montag|Dienstag|Mittwoch|Donnerstag|Freitag/;

            /** @type {string} */
            const rawDay = e.querySelector(".mon_title").innerText;
            const date = dateRegex.exec(rawDay)[0];
            const day = dayRegex.exec(rawDay)[0];
            /** @type {HTMLTableRowElement[]} */
            const entries = Array.from(
              e.querySelector(".mon_list").querySelectorAll("tr.list")
            );

            const mappedEntries = entries.map((e) => {
              /** @type {HTMLTableCellElement[]} */
              const children = Array.from(e.children);
              return {
                klasse: children[0].innerText,
                stunde: children[1].innerText,
                vertretung: children[2].innerText,
                raum: children[3].innerText,
                lehrer: children[4].innerText,
                fach: children[5].innerText,
                notiz: children[6].innerText,
                entfall: children[7].innerText == "x",
              };
            });

            return {
              date,
              day,
              dayEntries: mappedEntries,
            };
          })
      );

      page.close();

      return days;
    };

    /** @param {Day[]} days @param {string} grade */
    const filterForGrade = (days, grade) => {
      days.forEach(
        (day) =>
          (day.dayEntries = day.dayEntries.filter((e) =>
            e.klasse.includes(grade)
          ))
      );
      return days;
    };

    /** @param {Day[]} days */
    const filterForTeachers = (days) => {
      const usersMap = require("../../storage/users");
      console.log(usersMap.get(interaction.member.user.id.toString()));
      const FaecherMap = usersMap.get(interaction.member.user.id);
      days.forEach(
        (day) =>
          (day.dayEntries = day.dayEntries.filter((e) => {
            const faecherArray = FaecherMap.get(e.lehrer);
            if (faecherArray !== undefined)
              return faecherArray.includes(e.fach);
            else return;
          }))
      );
    };

    /** @param {Day[]} days */
    const combineDupes = (days) => {
      days.forEach((day) => {
        /** @type {DayEntry[]} */
        const entriesFinal = [];
        day.dayEntries.forEach((e) => {
          const dupe = day.dayEntries.find(
            (e2) =>
              e2.klasse == e.klasse &&
              e2.vertretung == e.vertretung &&
              e2.raum == e.raum &&
              e2.lehrer == e.lehrer &&
              e2.fach == e.fach &&
              e2.notiz == e.notiz &&
              e2.entfall == e.entfall &&
              e2.stunde != e.stunde
          );
          if (dupe) {
            e.stunde = e.stunde + "+" + dupe.stunde;
            day.dayEntries.splice(day.dayEntries.indexOf(dupe), 1);
          }
          entriesFinal.push(e);
        });

        day.dayEntries = entriesFinal;
      });
      return days;
    };

    /** @param {import("puppeteer").Page} page */
    const doLoginStuff = async (page) => {
      await page.type("#txtUser", process.env.VUSER);
      await page.type("#txtPass", process.env.VPASS);
      await page.click("input.login");
    };

    await (async () => {
      // Launch the browser and open a new blank page
      const browser = await puppeteer.launch({ headless: "new" });
      const page = await browser.newPage();

      // Navigate the page to a URL
      await page.goto("https://www.dsbmobile.de/");

      // Set screen size
      await page.setViewport({ width: 1080, height: 1024 });

      // do login stuff
      if (page.url().endsWith("Login.aspx")) doLoginStuff(page);

      const planLinks = [];

      for (let i = 0; i <= 1; i++) {
        const planSelector = `.timetableView .timetable-element[data-index="${i}"]`;
        await page.waitForSelector(planSelector);
        await page.click(planSelector);
        const iframe = await page.waitForSelector(".iframe-wrapper iframe");
        const planLink = await iframe.evaluate((el) => el.src);
        planLinks.push(planLink);
        await page.click("#close-btn");
      }

      const kek = await Promise.all([
        parsePlanFromUrl(browser, planLinks[0]),
        parsePlanFromUrl(browser, planLinks[1]),
      ]);

      const asd = kek[0].concat(kek[1]);
      const wasd = filterForGrade(asd, process.env.GRADE);
      if (interaction.options.getSubcommand() == "user")
        asaaa = filterForTeachers(asd);
      const asdf = combineDupes(wasd);
      let messageToSend = "";
      asdf.forEach((day) => {
        messageToSend = messageToSend.concat(
          day.dayEntries.length != 0
            ? `\n\n\u001b[0m\u001b[4m${day.date.slice(0, -4)} ${
                day.day
              }\u001b[0m`
            : ``
        );
        day.dayEntries.forEach((dayEntry) => {
          messageToSend = messageToSend.concat(
            `\n\u001b[0;34m${dayEntry.lehrer}\u001b[0m ${dayEntry.fach} \u001b[33m${dayEntry.stunde}\u001b[0m`
          );
          messageToSend = messageToSend.concat(
            dayEntry.entfall
              ? ` \u001b[32mentfällt\u001b[0m`
              : dayEntry.lehrer != dayEntry.vertretung
              ? ` Vertretung \u001b[31m${dayEntry.vertretung}\u001b[0m in \u001b[35m${dayEntry.raum}\u001b[0m`
              : ` Raumtausch in \u001b[35m${dayEntry.raum}\u001b[0m`
          );
          messageToSend = messageToSend.concat(
            dayEntry.notiz.trim() != ""
              ? "\u001b[30m (" + dayEntry.notiz.trim() + ")"
              : ""
          );
        });
      });
      await interaction.editReply({
        content: "```ansi\n" + messageToSend + "```",
        // content: messageToSend,
      });

      await browser.close();
    })();
  },
};

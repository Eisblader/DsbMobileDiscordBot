const {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  Client,
} = require("discord.js");
const fs = require("fs");

// keine ganze Map, sodass man das nur in dsb.js converten muss

module.exports = {
  data: new SlashCommandBuilder()
    .setDMPermission(false)
    .setName("dsb-config")
    .setDescription("configure your lessons for the dsb command")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("add")
        .setDescription("Füge Kurse zu deiner Kursliste hinzu")
        .addStringOption((option) =>
          option
            .setName("kursliste")
            .setDescription(
              'Schreibe hier deine Kurse im Format "mu1, ph1, ..." getrennt mit einem Komma auf'
            )
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("remove")
        .setDescription("Entferne Kurse von deiner Kursliste")
        .addStringOption((option) =>
          option
            .setName("kursliste")
            .setDescription(
              'Schreibe hier deine Kurse im Format "mu1, ph1, ..." getrennt mit einem Komma auf'
            )
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("show")
        .setDescription("Lasse deine persönliche Kursliste anzeigen")
    ),

  /**
   *
   * @param {ChatInputCommandInteraction} interaction
   * @param {Client} client
   */
  async execute(interaction, client) {
    await interaction.deferReply({ ephemeral: true });
    const subcommand = interaction.options.getSubcommand();
    // console.log(subcommand);

    delete require.cache[require.resolve("../../storage/users.json")];
    let usersObject = require("../../storage/users.json");
    if (subcommand == "add" || subcommand == "remove") {
      const kursArray = interaction.options.getString("kursliste").split(", ");
      let kursString = "";

      // add Kursliste to user's ID
      if (subcommand == "add") {
        // if Kurs isn't already included: add Kurs to list
        const regex = new RegExp(
          "d[1-3]|e[1-3]|g[1-3]|inf1|m[1-3]|mu1|psemEnglisch|ph1|ev1|sk[1-3]|sp[1-3]|wr[1-2]"
        );
        kursArray.forEach((e) => {
          if (usersObject[interaction.member.user.id] == undefined) {
            usersObject[interaction.member.user.id] = [];
          }
          if (
            usersObject[interaction.member.user.id].indexOf(e) === -1 &&
            e.length <= 3 &&
            regex.test(e)
          ) {
            usersObject[interaction.member.user.id].push(e);
            kursString = kursString.concat(`- ${e}\n`);
          }
        });

        // add Kurse to users.json
        fs.writeFileSync(
          "./src/storage/users.json",
          JSON.stringify(usersObject),
          (err) => {
            if (err) throw err;
          }
        );

        await interaction.editReply({
          content: `Folgende Kurse hinzugefügt:\n\n${kursString}`,
        });
      } else if (subcommand == "remove") {
        kursArray.forEach((e) => {
          if (usersObject[interaction.member.user.id].indexOf(e) !== -1) {
            usersObject[interaction.member.user.id].splice(
              usersObject[interaction.member.user.id].indexOf(e),
              1
            );
            kursString = kursString.concat(`- ${e}\n`);
          }
        });

        // remove Kurse from users.json
        fs.writeFileSync(
          "./src/storage/users.json",
          JSON.stringify(usersObject),
          (err) => {
            if (err) throw err;
          }
        );

        await interaction.editReply({
          content: `Folgende Kurse entfernt:\n\n${kursString}`,
        });
      }
    } else if (subcommand == "show") {
      let kursString = "";
      if (usersObject[interaction.member.user.id] == undefined) {
        await interaction.editReply({
          content: `Du hast keine Kurse gespeichert`,
        });
        return;
      }
      usersObject[interaction.member.user.id].forEach((e) => {
        kursString = kursString.concat(`- ${e}\n`);
      });
      await interaction.editReply({
        content: `Deine Kurse:\n\n${kursString}`,
      });
    }
  },
};

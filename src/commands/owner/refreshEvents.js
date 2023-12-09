const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setDMPermission(false)
    .setName("refreshevents")
    .setDescription("refreshes events"),
  async execute(interaction, client) {
    if (interaction.member.id !== "330667440839065601") {
      console.log(
        `${interaction.member.tag} is not permitted to use ${interaction.name}!`
      );
      await interaction.reply({
        content: "You do not have permission to use this command.",
        ephemeral: true,
      });
    } else {
      await interaction.deferReply({ ephemeral: true });

      delete require.cache[
        require.resolve("../../functions/handlers/handleEvents.js")
      ];
      require("../../functions/handlers/handleEvents.js");
      await client.handleEvents();
      await interaction.editReply({ content: "done!" });
    }
  },
};

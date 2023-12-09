const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setDMPermission(false)
    .setName("refreshcommands")
    .setDescription("refreshes commands"),
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
      client.commands.clear();
      client.commandArray.length = 0;

      delete require.cache[
        require.resolve("../../functions/handlers/handleCommands.js")
      ];
      require("../../functions/handlers/handleCommands.js");
      await client.handleCommands();
      await interaction.editReply({ content: "done!" });
    }
  },
};

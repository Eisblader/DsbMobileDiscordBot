const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setDMPermission(false)
    .setName("refreshcomponents")
    .setDescription("refreshes components"),
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
        require.resolve("../../functions/handlers/handleComponents.js")
      ];
      require("../../functions/handlers/handleComponents.js");
      await client.handleComponents();
      await interaction.editReply({ content: "done!" });
    }
  },
};

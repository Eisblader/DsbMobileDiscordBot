const {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  Client,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("userconfig")
    .setDescription("Stelle dir deinen Stundenplan zusammen")
    .setDMPermission(false),
  /**
   *
   * @param {ChatInputCommandInteraction} interaction
   * @param {Client} client
   */
  async execute(interaction, client) {
    await interaction.deferReply({ ephemeral: true });
    await interaction.editReply({
      content: `${interaction.member.displayName} you stink!!`,
    });
  },
};

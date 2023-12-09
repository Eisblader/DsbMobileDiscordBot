const { Client } = require("discord.js");

module.exports = {
  name: "interactionCreate",
  /**
   *
   * @param {import("discord.js").Interaction} interaction
   * @param {Client} client
   * @returns
   */
  async execute(interaction, client) {
    if (interaction.isChatInputCommand()) {
      const { commands } = client;
      const { commandName } = interaction;
      // console.log(commands);
      const command = commands.get(commandName);
      if (!command) return;

      try {
        console.log(
          `command "${interaction.commandName}" registered, executed by ${interaction.member.user.username} (${interaction.member.user.id}) in #${interaction.channel.name} ${interaction.channelId}`
        );
        await command.execute(interaction, client);
      } catch (error) {
        console.error(error);
        await interaction.editReply({
          content: "something went wrong while executing this command...",
          ephemeral: true,
        });
      }
    } else if (interaction.isButton()) {
      const { buttons } = client;
      const { customId } = interaction;
      const button = buttons.get(customId);
      if (!button) return;

      try {
        await button.execute(interaction, client);
      } catch (error) {
        console.error(error);
      }
    }
  },
};

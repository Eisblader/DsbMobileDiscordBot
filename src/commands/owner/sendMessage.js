const {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  Client,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setDMPermission(false)
    .setName("sendmessage")
    .setDescription("sends a message provided")
    .addStringOption((option) =>
      option
        .setName("message")
        .setDescription("the message that should be sent")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("reply")
        .setDescription("The message ID of the message you wish to reply to")
        .setRequired(false)
    ),
  /**
   *
   * @param {ChatInputCommandInteraction} interaction
   * @param {Client} client
   */
  async execute(interaction, client) {
    await interaction.deferReply({ ephemeral: true });

    if (interaction.user.id !== "330667440839065601") {
      interaction.editReply({
        content: "You do not have permission to use this command!",
      });
    } else if (interaction.user.id === "439377063003291649") {
      interaction.channel.send(
        "Congrats French Furry you have found the command"
      );
    } else {
      const content = interaction.options.getString("message");
      const replyId = interaction.options.getString("reply");
      if (replyId == null) {
        interaction.channel.send(content);
      } else {
        const message = interaction.channel.messages.fetch(replyId);
        (await message).reply(content);
      }
      await interaction.editReply({
        content: "Message sent!",
      });
    }
  },
};

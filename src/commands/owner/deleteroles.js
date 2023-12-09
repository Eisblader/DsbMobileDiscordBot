const {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  Client,
  PermissionFlagsBits,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setDMPermission(false)
    .setName("deleteroles")
    .setDescription('deletes roles named "new role"')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),
  /**
   *
   * @param {ChatInputCommandInteraction} interaction
   * @param {Client} client
   */
  async execute(interaction, client) {
    await interaction.deferReply();
    if (interaction.user.id !== "330667440839065601") {
      interaction.editReply({ content: "perms issue" });
    } else {
      const roles = interaction.guild.roles.cache.filter(
        (role) => role.name === "new role"
      );
      roles.forEach((role) => {
        role.delete();
      });

      await interaction.editReply({
        content: `deleting ${roles.size} roles!`,
      });
    }
  },
};

const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
} = require("discord.js");
const hastebin = require("hastebin");

module.exports = {
  data: new SlashCommandBuilder()
    .setDMPermission(false)
    .setName("embed")
    .setDescription("Handles everything with embeds")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand((subbcommand) =>
      subbcommand
        .setName("source")
        .setDescription("Returns the starb.in link of a given embed")
        .addStringOption((option) =>
          option
            .setName("message-link")
            .setDescription("The message link of which you would get the embed")
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("send")
        .setDescription("send an embed")
        .addStringOption((option) =>
          option
            .setName("embed")
            .setDescription("The starb.in link for the embed")
            .setRequired(true)
        )
        .addChannelOption((option) =>
          option
            .setName("channel")
            .setDescription(
              "the channel to send your embed in, if empty it will take the current channel"
            )
            .addChannelTypes(0)
        )
    )
    .addSubcommand((subbcommand) =>
      subbcommand
        .setName("edit")
        .setDescription("edit an embed to a new embed")
        .addStringOption((option) =>
          option
            .setName("message-link")
            .setDescription("The link of the message you'd like to edit")
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("embed")
            .setDescription("The new embed")
            .setRequired(true)
        )
    ),
  async execute(interaction, client) {
    const subcommand = interaction.options.getSubcommand();
    await interaction.deferReply();

    if (subcommand === "source") {
      const messagelink = interaction.options
        .getString("message-link")
        .split("/");
      const messageId = messagelink.pop();
      const channel = await client.channels.fetch(messagelink.pop());
      const message = await channel.messages.fetch(messageId);
      const embedJson = message.embeds;
      if (embedJson[0] === undefined) {
        await interaction.editReply("This is not a valid embed!");
        return;
      }
      const link = await hastebin.createPaste(
        JSON.stringify(embedJson[0], 0, 4),
        {
          server: "https://starb.in",
          dataType: "js",
          contentType: ".json",
        }
      );

      await interaction.editReply(link + ".json");
    } else if (subcommand === "send") {
      const embedInput = interaction.options.getString("embed");
      if (embedInput.startsWith("https://starb.in")) {
        const fetch = (...args) =>
          import("node-fetch")
            .then(({ default: fetch }) => fetch(...args))
            .catch((err) => console.log(err));

        let url = `http://starb.in/raw/${
          embedInput.split(".")[1].split("/")[1]
        }`;

        const response = await fetch(url);
        const data = await response.text();

        const channel =
          interaction.options.getChannel("channel") ?? interaction.channel;

        const embed = new EmbedBuilder(JSON.parse(data));
        try {
          await channel.send({ embeds: [embed] });
          await interaction.editReply({
            content: `Successfully sent embed to ${channel}`,
            ephemeral: true,
          });
        } catch (error) {
          console.error(error);
          interaction.editReply("This is not a valid embed!");
        }
      } else {
        const embedInput = interaction.options.getString("embed");
        const channel =
          interaction.options.getChannel("channel") ?? interaction.channel;
        const embed = new EmbedBuilder(JSON.parse(embedInput));
        channel.send({ embeds: [embed] });
        await interaction.editReply({
          content: `Successfully sent embed to ${channel}`,
          ephemeral: true,
        });
      }
    } else if (subcommand === "edit") {
      const newEmbed = interaction.options.getString("embed");
      const messageLink = interaction.options
        .getString("message-link")
        .split("/");
      const messageId = messageLink.pop();
      let embed = null;
      const channel = await client.channels.fetch(messageLink.pop());
      const message = await channel.messages.fetch(messageId);
      if (newEmbed.startsWith("https://")) {
        const fetch = (...args) =>
          import("node-fetch")
            .then(({ default: fetch }) => fetch(...args))
            .catch((err) => console.log(err));

        let url = `http://starb.in/raw/${newEmbed.split(".")[1].split("/")[1]}`;
        // console.log(url);

        const response = await fetch(url);
        const data = await response.text();

        embed = new EmbedBuilder(JSON.parse(data));
      } else {
        embed = new EmbedBuilder(JSON.parse(newEmbed));
      }
      await message.edit({ embeds: [embed] });
      await interaction.editReply({
        content: `Successfully edited embed at ${interaction.options.getString(
          "message-link"
        )}`,
        ephemeral: true,
      });
    }
  },
};

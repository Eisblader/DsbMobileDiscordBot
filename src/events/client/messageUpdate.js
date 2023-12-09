const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "messageUpdate",
  async execute(oldMessage, newMessage, client) {
    if (oldMessage.author.bot) return;
    if (newMessage.guildId === "890952522729148436") {
      const count = 1950;
      const original =
        oldMessage.content.slice(0, count) + (oldMessage.content.length > count ? "..." : "");
      const edited =
        newMessage.content.slice(0, count) + (newMessage.content.length > count ? "..." : "");

      const logEmbed = new EmbedBuilder()
        .setTitle("Message edited")
        .setDescription(
          `**[Message](${newMessage.url}) has been edited by ${newMessage.author} in ${newMessage.channel}!**
        \n**Before**: \n${original}
        \n**After**: \n${edited}`
        )
        .setColor("DarkBlue");

      const channel = await client.channels.fetch("1088906870053408948");
      await channel.send({ embeds: [logEmbed] });
    }
  },
};

const { Presence, EmbedBuilder, Client } = require("discord.js");

module.exports = {
  name: "presenceUpdate",
  /**
   *
   * @param {Presence} oldPresence
   * @param {Presence} newPresence
   * @param {Client} client
   */
  async execute(oldPresence, newPresence, client) {
    return;
    if (
      newPresence.guild.id === "890952522729148436" &&
      newPresence.status === "online"
    ) {
      if (
        newPresence.userId === "439377063003291649" || // tesla
        newPresence.userId === "330667440839065601" // Eisblader
      ) {
        let oldPresenceStatus = null;
        oldPresence === null
          ? (oldPresenceStatus = "offline")
          : (oldPresenceStatus = oldPresence.status);

        if (oldPresenceStatus != newPresence.status) {
          console.log(
            `${newPresence.user.tag} changed their status from ${oldPresenceStatus} to ${newPresence.status}!`
          );

          //fetch ping-channel
          const channel = await client.channels.fetch("1088906870053408948");

          //if Eisblader
          if (newPresence.userId === "330667440839065601") {
            const embed = new EmbedBuilder().setDescription(
              `${
                newPresence.user
              } WELCOME BACK ${newPresence.user.username.toUpperCase()}`
            );
            await channel.send({ embeds: [embed] });
          } else {
            await channel.send(
              `${
                newPresence.user
              } WELCOME BACK ${newPresence.user.username.toUpperCase()}`
            );
            console.log(`Successfully pinged ${newPresence.user.username}`);
          }
        }
      }
    }
  },
};

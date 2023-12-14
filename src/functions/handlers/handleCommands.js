const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");
const { Client } = require("discord.js");

const fs = require("fs");

/**
 *
 * @param {Client} client
 */
module.exports = (client) => {
  client.handleCommands = async () => {
    const commandFolders = fs.readdirSync("./src/commands");
    for (const folder of commandFolders) {
      const commandFiles = fs
        .readdirSync(`./src/commands/${folder}`)
        .filter((file) => file.endsWith(".js"));

      for (const file of commandFiles) {
        delete require.cache[
          require.resolve(`../../commands/${folder}/${file}`)
        ];
        const command = require(`../../commands/${folder}/${file}`);
        client.commands.set(command.data.name, command);
        client.commandArray.push(command.data.toJSON());
        console.log(`Command: ${command.data.name} has been registered!`);
      }
    }

    const clientId = "1081562352568238100";
    // TESTING SERVER
    const guildId = "1181575378079326249";
    // QODLY
    // const guildId = "772394091388469270";
    const rest = new REST({ version: "9" }).setToken(process.env.token);

    try {
      console.log("Started refreshing application (/) commands.");

      await rest.put(Routes.applicationGuildCommands(clientId, guildId), {
        // await rest.put(Routes.applicationCommands(clientId), {
        body: client.commandArray,
      });
      // console.log(client.commandArray);
      console.log("Successfully reloaded application (/) commands.\n\n");
    } catch (error) {
      console.error(error);
    }
  };
};

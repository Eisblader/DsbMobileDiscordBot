const { Client } = require("discord.js");
const fs = require("fs");

/**
 *
 * @param {Client} client
 */
module.exports = (client) => {
  client.handleComponents = async () => {
    const compontFolder = fs.readdirSync(`./src/components`);
    for (const folder of compontFolder) {
      const componentFiles = fs
        .readdirSync(`./src/components/${folder}`)
        .filter((file) => file.endsWith(".js"));

      switch (folder) {
        case "buttons":
          for (const file of componentFiles) {
            const button = require(`../../components/${folder}/${file}`);
            client.buttons.set(button.data.name, button);
          }
          break;

        default:
          break;
      }
    }
  };
};

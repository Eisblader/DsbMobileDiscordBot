const fs = require("fs");

module.exports = (client) => {
  client.handleEvents = async () => {
    const eventFolders = fs.readdirSync("./src/events");
    for (const folder of eventFolders) {
      const eventFiles = fs.readdirSync(`./src/events/${folder}`).filter((file) => {
        return file.endsWith(`.js`);
      });
      switch (folder) {
        case "client":
          for (const file of eventFiles) {
            await delete require.cache[require.resolve(`../../events/${folder}/${file}`)];
            const event = require(`../../events/${folder}/${file}`);
            console.log(`loaded event: "${event.name}"`);
            client.removeAllListeners(event.name);
            if (event.once) {
              client.once(event.name, (...args) => event.execute(...args, client));
            } else {
              client.on(event.name, (...args) => event.execute(...args, client));
            }
          }
      }
    }
  };
};

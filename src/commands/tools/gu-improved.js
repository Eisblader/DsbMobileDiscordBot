const {
  SlashCommandBuilder,
  Client,
  ChatInputCommandInteraction,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ButtonBuilder,
  EmbedBuilder,
  ButtonStyle,
  Colors,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setDMPermission(false)
    .setName("gu-improved")
    .setDescription(
      "Multi step process to get users with and without certain roles"
    ),
  /**
   * @param {ChatInputCommandInteraction} interaction
   * @param {Client} client
   */
  async execute(interaction, client) {
    interaction.deferReply({ ephemeral: true });
    interaction.deleteReply();
    const { roleArray1, roleArray2, comparisonType } = client;

    const actionrows = new Array();

    //Creates and sends the Select Menu message
    for (let index = 0; index < 5; index++) {
      actionrows[index] = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
          .setCustomId(`roleSelect_${index}`)
          .setPlaceholder("Nothing selected yet!")
      );
    }
    const roles = interaction.guild.roles.cache;
    for (let index = 0; index < roles.size; index++) {
      let role = roles.at(index);
      actionrows[Math.floor(index / 25)].components[0].addOptions({
        label: role.name,
        description: `Role ${index + 1}`,
        value: `${role.id}`,
      });
    }
    for (let index = 0; index < Math.floor((125 - roles.size) / 25); index++) {
      actionrows.pop();
    }
    actionrows.forEach((actionrow) => {
      actionrow.components[0]
        .setMinValues(1)
        .setMaxValues(actionrow.components[0].options.length);
    });
    const selectMenuMessage = await interaction.channel.send({
      content: `Select the first set of roles!`,
      components: actionrows,
      fetchReply: true,
    });

    //Creates and sends the button message
    const actionrowbutton = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("improved-gu_continue")
        .setStyle(3)
        .setLabel("Continue")
    );
    const buttonMessage = await interaction.channel.send({
      components: [actionrowbutton],
      fetchReply: true,
    });

    // Create a collector for the Select Menu
    const selecteMenuCollector =
      selectMenuMessage.createMessageComponentCollector();
    roleArray1.length = 0;
    selecteMenuCollector.on("collect", (i) => {
      if (i.user.id !== interaction.user.id) {
        i.reply({
          content: `These select menus aren't for you!`,
          ephemeral: true,
        });
      } else {
        i.deferUpdate();
        i.values.forEach((i) => {
          roleArray1.push(i);
        });
      }
    });

    // Create a collector for the button
    const buttonCollector = buttonMessage.createMessageComponentCollector();
    buttonCollector.on("collect", async (i) => {
      if (i.user.id === interaction.user.id) {
        let embedDescription = "**First set of roles:** ";
        await roleArray1.forEach(async (i) => {
          const role = await interaction.guild.roles.fetch(i);
          embedDescription = embedDescription.concat(`${role.name}, `);
        });
        selectMenuMessage.edit({
          content: "",
          embeds: [new EmbedBuilder().setDescription(embedDescription)],
          components: [],
        });
        buttonMessage.delete();
        i.deferUpdate();
        // i.deleteReply();
        buttonCollector.stop();
        selecteMenuCollector.stop();
        const comparisonMessage = await interaction.channel.send({
          content: "Select the type of comparison!",
          components: [
            new ActionRowBuilder().addComponents(
              new StringSelectMenuBuilder()
                .setCustomId("comparisonSelect")
                .addOptions(
                  { label: "AND", value: "intersection" },
                  { label: "OR", value: "union" },
                  { label: "XOR", value: "symmetrical_difference" },
                  { label: "1 without 2", value: "difference" }
                )
            ),
          ],
          fetchReply: true,
        });

        // Comparison Type map:
        const comparisonTypes = new Map();
        comparisonTypes.set("intersection", "AND");
        comparisonTypes.set("union", "OR");
        comparisonTypes.set("symmetrical_difference", "XOR");
        comparisonTypes.set("difference", "1 without 2");

        const comparisonCollector =
          comparisonMessage.createMessageComponentCollector();
        comparisonCollector.on("collect", async (i) => {
          if (i.user.id !== interaction.user.id) {
            i.reply({ content: `This menu isn't for you!`, ephemeral: true });
          } else {
            client.comparisonType = i.values[0];

            comparisonMessage.edit({
              content: "",
              components: [],
              embeds: [
                new EmbedBuilder().setDescription(
                  `**Comparison Type:** ${comparisonTypes.get(i.values[0])}`
                ),
              ],
            });

            comparisonCollector.stop();

            //Creates and sends the Select Menu message
            const actionrows = new Array();
            for (let index = 0; index < 5; index++) {
              actionrows[index] = new ActionRowBuilder().addComponents(
                new StringSelectMenuBuilder()
                  .setCustomId(`roleSelect_${index}`)
                  .setPlaceholder("Nothing selected yet!")
              );
            }
            const roles = interaction.guild.roles.cache;
            for (let index = 0; index < roles.size; index++) {
              let role = roles.at(index);
              actionrows[Math.floor(index / 25)].components[0].addOptions({
                label: role.name,
                description: `Role ${index + 1}`,
                value: `${role.id}`,
              });
            }
            for (
              let index = 0;
              index < Math.floor((125 - roles.size) / 25);
              index++
            ) {
              actionrows.pop();
            }
            actionrows.forEach((actionrow) => {
              actionrow.components[0]
                .setMinValues(1)
                .setMaxValues(actionrow.components[0].options.length);
            });
            const selectMenuMessage = await interaction.channel.send({
              content: `Select the second set of roles for comparison!`,
              components: actionrows,
              fetchReply: true,
            });

            //Creates and sends the button message
            const actionrowbutton = new ActionRowBuilder().addComponents(
              new ButtonBuilder()
                .setCustomId("improved-gu_finalise")
                .setStyle(3)
                .setLabel("Find users!")
            );
            const buttonMessage = await interaction.channel.send({
              components: [actionrowbutton],
              fetchReply: true,
            });

            // Create a collector for the Select Menu
            const selecteMenuCollector =
              selectMenuMessage.createMessageComponentCollector();
            roleArray2.length = 0;
            selecteMenuCollector.on("collect", async (i) => {
              if (i.user.id !== interaction.user.id) {
                i.reply({
                  content: `This Menu isn't for you!`,
                  ephemeral: true,
                });
              } else {
                i.deferUpdate();
                i.values.forEach((i) => {
                  roleArray2.push(i);
                });
              }
            });
            selecteMenuCollector.on("end", (collected) => {});

            // Create a collector for the button
            const buttonCollector =
              buttonMessage.createMessageComponentCollector();
            buttonCollector.on("collect", async (i) => {
              if (i.user.id === interaction.user.id) {
                let embedDescription = "**Second set of roles:** ";
                await roleArray2.forEach(async (i) => {
                  const role = await interaction.guild.roles.fetch(i);
                  embedDescription = embedDescription.concat(`${role.name}, `);
                });
                selectMenuMessage.edit({
                  content: "",
                  embeds: [new EmbedBuilder().setDescription(embedDescription)],
                  components: [],
                });
                buttonMessage.delete();
                i.deferUpdate();
                buttonCollector.stop();
                selecteMenuCollector.stop();

                let members_r1 = new Array();
                let members_r2 = new Array();

                const roles1 = new Array();
                const roles2 = new Array();

                await roleArray1.forEach(async (roleId) => {
                  const role_a = await interaction.guild.roles.fetch(roleId);
                  roles1.push(role_a);
                  role_a.members.forEach((member) => {
                    members_r1.push(member.user);
                  });
                });
                members_r1 = Array.from(new Set(members_r1));

                await roleArray2.forEach(async (roleId) => {
                  const role_a = await interaction.guild.roles.fetch(roleId);
                  roles2.push(role_a);
                  role_a.members.forEach((member) => {
                    members_r2.push(member.user);
                  });
                });
                members_r2 = Array.from(new Set(members_r2));

                let members = new Array();
                let embedTitle = new String();
                const role1 = await interaction.guild.roles.fetch(
                  roleArray1[0]
                );
                const role2 = await interaction.guild.roles.fetch(
                  roleArray2[0]
                );
                switch (client.comparisonType) {
                  case "intersection": {
                    members = members_r1.filter((x) => members_r2.includes(x));
                    embedTitle = `${members.length} Members found! `;
                    break;
                  }

                  case "difference": {
                    members = members_r1.filter((x) => !members_r2.includes(x));
                    embedTitle = `${members.length} Members found! `;
                    break;
                  }

                  case "symmetrical_difference": {
                    members = members_r1
                      .filter((x) => !members_r2.includes(x))
                      .concat(
                        members_r2.filter((x) => !members_r1.includes(x))
                      );
                    embedTitle = `${members.length} Members found! `;
                    break;
                  }

                  case "union": {
                    members = [...new Set([...members_r1, ...members_r2])];
                    embedTitle = `${members.length} Members found! `;
                    break;
                  }
                }

                const chunkSize = 20;
                const membersPage = new Array();
                for (let i = 0; i < members.length; i += chunkSize) {
                  const chunk = members.slice(i, i + chunkSize);
                  membersPage.push(chunk);
                }
                function memberString(page) {
                  page = page - 1;
                  let embedDescription = new String();
                  if (membersPage.length === 0) {
                    membersPage.length = 1;
                    return "`No Members!`";
                  } else if (members.length === 1) {
                    embedTitle = embedTitle.replace("Members", "Member");
                  }
                  for (
                    let index = 0;
                    index < membersPage[page].length;
                    index++
                  ) {
                    embedDescription = embedDescription.concat(
                      `\`${membersPage[page][index].tag}\` - ${membersPage[page][index]}\n`
                    );
                  }
                  return embedDescription;
                }
                // Embed Creation
                function embedBuild(page) {
                  return new EmbedBuilder()
                    .setTitle(embedTitle)
                    .setDescription(memberString(page))
                    .setColor(Colors.DarkRed)
                    .setFooter({ text: `Page ${page}/${membersPage.length}` });
                }

                let components = [
                  new ButtonBuilder()
                    .setCustomId("list_back")
                    .setLabel("⬅️")
                    .setDisabled(true)
                    .setStyle(ButtonStyle.Primary),
                  new ButtonBuilder()
                    .setCustomId("list_forward")
                    .setLabel("➡️")
                    .setDisabled(false)
                    .setStyle(ButtonStyle.Primary),
                ];
                let page = 1;
                const embedToSend = embedBuild(page);
                let actionrow = new ActionRowBuilder()
                  .addComponents(components[0])
                  .addComponents(components[1]);
                if (membersPage.length === 1) {
                  actionrow.components[1].setDisabled(true);
                }
                const listMessage = await interaction.channel.send({
                  embeds: [embedToSend],
                  fetchReply: true,
                  components: [actionrow],
                });
                const listCollector =
                  listMessage.createMessageComponentCollector({ time: 30000 });
                listCollector.on("collect", (i) => {
                  if (i.user.id !== interaction.user.id) {
                    i.reply({
                      content: `These buttons aren't for you!`,
                      ephemeral: true,
                    });
                  } else {
                    i.deferUpdate();
                    if (i.customId === "list_forward") {
                      page++;
                    } else if (i.customId === "list_back") {
                      page--;
                    }
                    switch (page) {
                      case 1:
                        components[0].setDisabled(true);
                        components[1].setDisabled(false);
                        break;
                      case membersPage.length:
                        components[0].setDisabled(false);
                        components[1].setDisabled(true);
                        break;
                      default:
                        components[0].setDisabled(false);
                        components[1].setDisabled(false);
                        break;
                    }
                    listMessage.edit({
                      embeds: [embedBuild(page)],
                      components: [
                        new ActionRowBuilder()
                          .addComponents(components[0])
                          .addComponents(components[1]),
                      ],
                    });
                  }
                });
                listCollector.on("end", (i) => {
                  listMessage.edit({ components: [] });
                });
              } else {
                i.reply({
                  content: `These buttons aren't for you!`,
                  ephemeral: true,
                });
              }
            });
          }
        });
      } else {
        i.reply({ content: `These buttons aren't for you!`, ephemeral: true });
      }
    });
  },
};

const {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  Client,
  EmbedBuilder,
  ButtonStyle,
  ButtonBuilder,
  Colors,
  ActionRowBuilder,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setDMPermission(false)
    .setName("gu")
    .setDescription("test")
    .addRoleOption((option) =>
      option.setName("role1").setDescription("Role 1").setRequired(true)
    )
    .addRoleOption((option) =>
      option.setName("role2").setDescription("Role 2").setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("type")
        .setDescription("How you want to compare the two roles")
        .setRequired(true)
        .addChoices(
          { name: "AND", value: "intersection" },
          { name: "OR", value: "union" },
          { name: "XOR", value: "symmetrical_difference" },
          { name: "1 without 2", value: "difference" }
        )
    ),
  /**
   *
   * @param {ChatInputCommandInteraction} interaction
   * @param {Client} client
   */
  async execute(interaction, client) {
    const listMessage = await interaction.deferReply({ fetchReply: true });
    const role1 = interaction.options.getRole("role1");
    const role2 = interaction.options.getRole("role2");
    const members_r1 = new Array();
    const members_r2 = new Array();

    role1.members.forEach((member) => {
      members_r1.push(member.user);
    });
    role2.members.forEach((member) => {
      members_r2.push(member.user);
    });
    let members = new Array();
    let embedTitle = new String();
    switch (interaction.options.getString("type")) {
      case "intersection": {
        members = members_r1.filter((x) => members_r2.includes(x));
        embedTitle = `${members.length} Members with both ${role1.name} and ${role2.name}`;
        break;
      }

      case "difference": {
        members = members_r1.filter((x) => !members_r2.includes(x));
        embedTitle = `${members.length} Members with ${role1.name} but without ${role2.name}`;
        break;
      }

      case "symmetrical_difference": {
        members = members_r1
          .filter((x) => !members_r2.includes(x))
          .concat(members_r2.filter((x) => !members_r1.includes(x)));
        embedTitle = `${members.length} Members with ${role1.name} or ${role2.name} but not both`;
        break;
      }

      case "union": {
        members = [...new Set([...members_r1, ...members_r2])];
        embedTitle = `${members.length} Members with ${role1.name} or ${role2.name}`;
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
      for (let index = 0; index < membersPage[page].length; index++) {
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
    await interaction.editReply({
      embeds: [embedToSend],
      fetchReply: true,
      components: [actionrow],
    });
    const listCollector = listMessage.createMessageComponentCollector({
      time: 30000,
    });
    listCollector.on("collect", (i) => {
      if (i.user.id !== interaction.user.id) {
        i.reply({ content: `These buttons aren't for you!`, ephemeral: true });
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
  },
};

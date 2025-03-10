// const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
// const config = require("../config.json");

// module.exports = {
//   data: new SlashCommandBuilder()
//     .setName("verify")
//     .setDescription(
//       "Manually verify a user by setting their nickname and giving them a role."
//     )
//     .addUserOption((option) =>
//       option
//         .setName("user")
//         .setDescription("The user to verify")
//         .setRequired(true)
//     )
//     .addStringOption((option) =>
//       option
//         .setName("nickname")
//         .setDescription("The nickname to set for the user")
//         .setRequired(true)
//     ),
//   async execute(interaction) {
//     const adminRole = interaction.guild.roles.cache.get(config.adminRoleId);
//     if (!interaction.member.roles.cache.has(config.adminRoleId)) {
//       return interaction.reply({
//         content: "❌ You do not have permission to use this command.",
//         ephemeral: true,
//       });
//     }

//     const user = interaction.options.getUser("user");
//     const nickname = interaction.options.getString("nickname");

//     try {
//       const member = await interaction.guild.members.fetch(user.id);
//       await member.setNickname(nickname);
//       const role = interaction.guild.roles.cache.get(config.roleId);

//       if (role) {
//         await member.roles.add(role);
//         await interaction.reply(
//           `✅ **${user.tag}** has been manually verified with the nickname **${nickname}**.`
//         );

//         // Log manual verification
//         const logChannel = member.guild.channels.cache.get(config.logChannelId);
//         if (logChannel) {
//           const logEmbed = new EmbedBuilder()
//             .setColor("#FAA61A")
//             .setTitle("Manual Verification Logged")
//             .setDescription(
//               `**User:** ${user.tag} (${user.id})\n**New Nickname:** ${nickname}\n**Verified by:** ${interaction.user.tag}`
//             )
//             .setTimestamp();
//           await logChannel.send({ embeds: [logEmbed] });
//         }
//       } else {
//         await interaction.reply("⚠ Error: Could not assign role.");
//       }
//     } catch (err) {
//       console.error("Error manually verifying user:", err);
//       await interaction.reply(
//         "⚠ I couldn't set the nickname. Please check my permissions!"
//       );
//     }
//   },
// };

const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
} = require("discord.js");
const fs = require("fs");
const configPath = "./serverConfig.json";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("verify")
    .setDescription(
      "Manually verify a user by setting their nickname and giving them a role."
    )
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The user to verify")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("nickname")
        .setDescription("The nickname to set for the user")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    if (!fs.existsSync(configPath)) {
      return await interaction.reply({
        content: "❌ Configuration file not found!",
        ephemeral: true,
      });
    }

    const config = JSON.parse(fs.readFileSync(configPath));

    if (!config[interaction.guild.id]) {
      return await interaction.reply({
        content: "❌ Server configuration not found!",
        ephemeral: true,
      });
    }

    const serverConfig = config[interaction.guild.id];

    // Fetch roles dynamically from config
    const adminRoleId = serverConfig.adminRoleId;
    const verifyRoleId = serverConfig.verifyRoleId;

    if (!adminRoleId || !verifyRoleId) {
      return await interaction.reply({
        content:
          "❌ Admin or verification role not set. Use `/setadminrole` and `/setverifyrole`.",
        ephemeral: true,
      });
    }

    // Check if the user has the admin role
    const adminRole = interaction.guild.roles.cache.get(adminRoleId);
    if (!adminRole || !interaction.member.roles.cache.has(adminRoleId)) {
      return await interaction.reply({
        content: "❌ You do not have permission to use this command.",
        ephemeral: true,
      });
    }

    const user = interaction.options.getUser("user");
    const nickname = interaction.options.getString("nickname");

    try {
      const member = await interaction.guild.members.fetch(user.id);
      await member.setNickname(nickname);

      const verifyRole = interaction.guild.roles.cache.get(verifyRoleId);
      if (verifyRole) {
        await member.roles.add(verifyRole);
        await interaction.reply(
          `✅ **${user.tag}** has been manually verified with the nickname "**${nickname}**".`
        );
      } else {
        await interaction.reply(
          "⚠️ Error: Could not assign verification role."
        );
      }

      // Log verification in the log channel
      if (serverConfig.logChannelId) {
        const logChannel = interaction.guild.channels.cache.get(
          serverConfig.logChannelId
        );
        if (logChannel) {
          const logEmbed = new EmbedBuilder()
            .setColor("#6AA6F1")
            .setTitle("Manual Verification Logged")
            .setDescription(
              `👤 **User:** ${user.tag} ( ${user.id} )\n🏷 **New Nickname:** ${nickname}\n✅ **Verified by:** ${interaction.user.tag}`
            )
            .setTimestamp();

          await logChannel.send({ embeds: [logEmbed] });
        }
      }
    } catch (err) {
      console.error("❌ Error manually verifying user:", err);
      await interaction.reply(
        "⚠️ I couldn't set the nickname. Please check my permissions!"
      );
    }
  },
};

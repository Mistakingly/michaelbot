const { Events, PermissionFlagsBits } = require("discord.js");
const fs = require("fs");
const configPath = "./serverConfig.json";

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction, client) {
    try {
      console.log(
        `🔹 Received interaction: ${
          interaction.commandName || interaction.customId
        }`
      );

      if (interaction.isChatInputCommand()) {
        const command = client.commands.get(interaction.commandName);
        if (!command) {
          console.error(
            `❌ No command matching ${interaction.commandName} was found.`
          );
          return;
        }
        await command.execute(interaction, client);
      } else if (interaction.isButton()) {
        console.log(`🔘 Button clicked: ${interaction.customId}`);

        if (interaction.customId.startsWith("verify_")) {
          const userId = interaction.customId.split("_")[1];

          if (interaction.user.id !== userId) {
            return await interaction.reply({
              content: "❌ You are not allowed to click this button!",
              ephemeral: true,
            });
          }

          await interaction.reply({
            content:
              "✅ Your verification request has been sent to the admins!",
            ephemeral: true,
          });

          await interaction.message
            .delete()
            .catch((err) => console.error("❌ Error deleting message:", err));

          if (!fs.existsSync(configPath)) return;
          const config = JSON.parse(fs.readFileSync(configPath));

          const serverConfig = config[interaction.guild.id];
          if (!serverConfig || !serverConfig.logChannelId) return;

          const logChannel = interaction.guild.channels.cache.get(
            serverConfig.logChannelId
          );
          if (!logChannel) return console.error("❌ Log channel not found.");

          const embed = {
            color: 0x5865f2,
            title: "New Verification Request",
            description: `**👤 User:** <@${interaction.user.id}> ( ${
              interaction.user.id
            } )\n📅 **Joined:** <t:${Math.floor(
              interaction.member.joinedTimestamp / 1000
            )}:R>`,
            thumbnail: {
              url: interaction.user.displayAvatarURL({ dynamic: true }),
            },
            footer: { text: "Approve or Deny the request manually" },
          };

          await logChannel.send({ embeds: [embed] });
        } else if (interaction.customId.startsWith("approve_")) {
          if (
            !interaction.member.permissions.has(
              PermissionFlagsBits.Administrator
            )
          ) {
            return await interaction.reply({
              content: "❌ You do not have permission to approve verification.",
              ephemeral: true,
            });
          }

          const userId = interaction.customId.split("_")[1];
          const member = await interaction.guild.members.fetch(userId);

          if (!fs.existsSync(configPath)) return;
          const config = JSON.parse(fs.readFileSync(configPath));

          const serverConfig = config[interaction.guild.id];
          if (!serverConfig || !serverConfig.verifyRoleId) return;

          const verifyRole = interaction.guild.roles.cache.get(
            serverConfig.verifyRoleId
          );
          if (!verifyRole)
            return console.error("❌ Verification role not found.");

          await member.roles.add(verifyRole);
          await interaction.reply({
            content: `✅ <@${userId}> has been verified!`,
            ephemeral: false,
          });
        }
      }
    } catch (error) {
      console.error("❌ Error handling interaction:", error);
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({
          content: "There was an error processing this interaction.",
          ephemeral: true,
        });
      } else {
        await interaction.reply({
          content: "There was an error processing this interaction.",
          ephemeral: true,
        });
      }
    }
  },
};

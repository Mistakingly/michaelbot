const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const config = require("../config.json");

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
    ),
  async execute(interaction) {
    const adminRole = interaction.guild.roles.cache.get(config.adminRoleId);
    if (!interaction.member.roles.cache.has(config.adminRoleId)) {
      return interaction.reply({
        content: "❌ You do not have permission to use this command.",
        ephemeral: true,
      });
    }

    const user = interaction.options.getUser("user");
    const nickname = interaction.options.getString("nickname");

    try {
      const member = await interaction.guild.members.fetch(user.id);
      await member.setNickname(nickname);
      const role = interaction.guild.roles.cache.get(config.roleId);

      if (role) {
        await member.roles.add(role);
        await interaction.reply(
          `✅ **${user.tag}** has been manually verified with the nickname **${nickname}**.`
        );

        // Log manual verification
        const logChannel = member.guild.channels.cache.get(config.logChannelId);
        if (logChannel) {
          const logEmbed = new EmbedBuilder()
            .setColor("#FAA61A")
            .setTitle("Manual Verification Logged")
            .setDescription(
              `**User:** ${user.tag} (${user.id})\n**New Nickname:** ${nickname}\n**Verified by:** ${interaction.user.tag}`
            )
            .setTimestamp();
          await logChannel.send({ embeds: [logEmbed] });
        }
      } else {
        await interaction.reply("⚠ Error: Could not assign role.");
      }
    } catch (err) {
      console.error("Error manually verifying user:", err);
      await interaction.reply(
        "⚠ I couldn't set the nickname. Please check my permissions!"
      );
    }
  },
};

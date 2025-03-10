const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const fs = require("fs");
const configPath = "./serverConfig.json";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("setadminrole")
    .setDescription("Set the admin role for verification approval.")
    .addRoleOption((option) =>
      option
        .setName("role")
        .setDescription("Select the admin role")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const role = interaction.options.getRole("role");

    if (!fs.existsSync(configPath)) fs.writeFileSync(configPath, "{}");
    const config = JSON.parse(fs.readFileSync(configPath));

    if (!config[interaction.guild.id]) config[interaction.guild.id] = {};
    config[interaction.guild.id].adminRoleId = role.id;

    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

    await interaction.reply({
      content: `✅ Admin role set to <@&${role.id}>`,
      ephemeral: true,
    });
  },
};

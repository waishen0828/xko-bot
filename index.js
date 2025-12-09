const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
    res.send("Bot is running!");
});

app.listen(PORT, () => {
    console.log(`Web server running on port ${PORT}`);
});

// -----------------------------
// Discord Bot 主体
// -----------------------------
const {
    Client,
    GatewayIntentBits,
    REST,
    SlashCommandBuilder,
    Routes
} = require("discord.js");

const TOKEN = process.env.TOKEN; // 从 Render 环境变量读取

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages
    ]
});

// -----------------------------
// 注册 /send 指令
// -----------------------------
const commands = [
    new SlashCommandBuilder()
        .setName("send")
        .setDescription("让机器人发送自定义消息")
        .addChannelOption(option =>
            option.setName("channel")
                .setDescription("选择要发送的频道")
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName("content")
                .setDescription("要发送的内容")
                .setRequired(true)
        )
].map(command => command.toJSON());

const rest = new REST({ version: "10" }).setToken(TOKEN);

client.once("ready", async () => {
    console.log(`🤖 Bot 登录成功：${client.user.tag}`);

    try {
        await rest.put(
            Routes.applicationCommands(client.user.id),
            { body: commands }
        );
        console.log("✔ Slash 指令已更新");
    } catch (err) {
        console.error(err);
    }
});

// -----------------------------
// 实现 /send 功能
// -----------------------------
client.on("interactionCreate", async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === "send") {

        const channel = interaction.options.getChannel("channel");
        const content = interaction.options.getString("content");

        await channel.send(content);

        await interaction.reply({
            content: "✅ 已发送消息！",
            ephemeral: true
        });
    }
});

client.login(TOKEN);

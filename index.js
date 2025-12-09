// --------------------
// 基本模块
// --------------------
const express = require("express");
const { 
    Client, 
    GatewayIntentBits, 
    SlashCommandBuilder, 
    REST, 
    Routes 
} = require("discord.js");

const server = express();

server.all("/", (req, res) => {
    res.send("Bot is running!");
});

function keepAlive() {
    server.listen(3000, () => {
        console.log("Server is Ready!");
    });
}
keepAlive();

// --------------------
// Bot Token（在 Koyeb 里面设置，不写在这里）
// --------------------
const TOKEN = process.env.TOKEN;

// --------------------
// Discord Client
// --------------------
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages
    ]
});

// --------------------
// 创建 Slash 指令
// --------------------
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
].map(cmd => cmd.toJSON());

// --------------------
// 注册 Slash 指令
// --------------------
const rest = new REST({ version: "10" }).setToken(TOKEN);

client.once("ready", async () => {
    console.log(`Bot 已上线：${client.user.tag}`);

    try {
        await rest.put(
            Routes.applicationCommands(client.user.id),
            { body: commands }
        );
        console.log("Slash 指令已成功注册");
    } catch (err) {
        console.error("注册指令失败：", err);
    }
});

// --------------------
// 处理 Slash 指令
// --------------------
client.on("interactionCreate", async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === "send") {
        const channel = interaction.options.getChannel("channel");
        const content = interaction.options.getString("content");

        await channel.send(content);

        await interaction.reply({ 
            content: `已发送到 ${channel}`,
            ephemeral: true
        });
    }
});

// --------------------
// 登录
// --------------------
client.login(TOKEN);

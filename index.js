// ====== 保持在线的服务器 ======
const express = require("express");
const app = express();

app.get("/", (req, res) => {
    res.send("Bot is running!");
});

app.listen(3000, () => {
    console.log("Status server online.");
});

// ====== Discord Bot ======
const { 
    Client, 
    GatewayIntentBits,
    REST,
    Routes,
    SlashCommandBuilder 
} = require("discord.js");

// 使用环境变量读取 TOKEN（Render / Railway）
const TOKEN = process.env.TOKEN;

// 建立客户端
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages
    ]
});

// Slash 指令 /send
const commands = [
    new SlashCommandBuilder()
        .setName("send")
        .setDescription("让机器人发送自定义消息")
        .addChannelOption(option =>
            option.setName("channel")
                .setDescription("选择频道")
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName("content")
                .setDescription("要发送的文字")
                .setRequired(true)
        )
].map(cmd => cmd.toJSON());

// Bot ready 事件
client.once("ready", async () => {
    console.log(`Bot 已上线：${client.user.tag}`);

    const rest = new REST({ version: "10" }).setToken(TOKEN);

    try {
        await rest.put(
            Routes.applicationCommands(client.user.id),
            { body: commands }
        );
        console.log("Slash 指令已注册");
    } catch (error) {
        console.error("注册指令失败", error);
    }
});

// 处理 /send
client.on("interactionCreate", async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === "send") {
        const channel = interaction.options.getChannel("channel");
        const content = interaction.options.getString("content");

        await channel.send(content);
        await interaction.reply({ content: "消息已发送！", ephemeral: true });
    }
});

// 登录
client.login(TOKEN);

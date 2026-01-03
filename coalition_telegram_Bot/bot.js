const TelegramBot = require("node-telegram-bot-api");
const axios = require("axios");
const https = require("https");

// Create an Axios instance with an agent to allow self-signed certificates
const axiosInstance = axios.create({
  httpsAgent: new https.Agent({
    rejectUnauthorized: false, // Disable SSL verification
  }),
});

// Replace this with your actual token
const token = "7820281886:AAF7HTMQ-4ICN3U-ecf9y3X8TQ-hKx-Vpxs";

// Create a new bot instance
const bot = new TelegramBot(token, { polling: true });
console.log("Bot is up and running...");

// Handle the /start command with a parameter
bot.onText(/\/start (\S+)/, async (msg, match) => {
  const chatId = msg.chat.id; // Extract chat ID
  const userId = match[1]; // Extract user ID from /start <userId>

  // Inform the user about the purpose of the bot
  bot.sendMessage(
    chatId,
    'Welcome to EPLFFC! By clicking "Start," you will receive all notifications from the web platform directly on your Telegram.'
  );

  try {
    
    

    // Send chat ID to your backend to link with the user
    const response = await axiosInstance.post(
      "https://eplffc.et/api/Telegram/Connect",
      {
        userId,
        chatId:chatId.toString(),
      }
    );

    // Handle success
    bot.sendMessage(
      chatId,
      "Your account has been successfully linked to Telegram. You will now receive all updates and notifications here!"
    );

    console.log("Response from backend:", response.data);
  } catch (error) {
    // Log the error details for debugging
    console.error("Error linking account:", error.message);
    console.error(error.response?.data || error);

    // Inform the user about the failure
    bot.sendMessage(chatId, "Failed to link your account. Please try again.");
  }
});

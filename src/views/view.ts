import TelegramBot from "node-telegram-bot-api";

export default interface View {
    chatId: TelegramBot.ChatId
    invoke: () => Promise<void>,
    destroy: () => Promise<void>
}
import Telegraf from 'telegraf';
import get from 'lodash/get';
import session from 'telegraf/session';
import { BotProviderMessageCtx } from '../types';
import BotProvider from './BotProvider';

export type TelegramBotProviderMessageCtx = BotProviderMessageCtx;

/**
 * Docs: https://telegraf.js.org/#/
 */

type TelegramBotConfigType = {
  token: string;
};

export default class TelegramBotProvider extends BotProvider {
  provider = 'telegram';
  Telegraf = Telegraf;
  eventTypes = [
    'message',
    'edited_message',
    'callback_query',
    'inline_query',
    'shipping_query',
    'pre_checkout_query',
    'chosen_inline_result',
    'channel_post',
    'edited_channel_post',
  ];
  config: TelegramBotConfigType;
  async init(): Promise<void> {
    await super.init();
    if (!this.config.token) throw 'TelegramBotProvider !config.token';
    this.client = new Telegraf(this.config.token);
    this.client.use(session());
  }
  async run() {
    await super.run();
    if (!this.client) return;
    await this.initEventEmitter();
    await this.client.launch();
    await this.client.startPolling();
  }
  getMessage(ctx: TelegramBotProviderMessageCtx): TelegramBotProviderMessageCtx {
    if (get(ctx, 'message')) return get(ctx, 'message');
    return ctx;
  }
  getMessageUserId(ctx: TelegramBotProviderMessageCtx): number {
    const message = this.getMessage(ctx);
    if (get(message, 'from.id')) return get(message, 'from.id');
    return null;
  }
  getMessageChatId(ctx: TelegramBotProviderMessageCtx): number {
    const message = this.getMessage(ctx);
    if (get(message, 'chat.id')) return get(message, 'chat.id');
    return null;
  }
  getMessageTargetId(ctx: TelegramBotProviderMessageCtx): number {
    const message = this.getMessage(ctx);
    if (get(message, 'chat.id')) return get(message, 'chat.id');
    if (get(message, 'from.id')) return get(message, 'from.id');
    return message;
  }
  getReplyMessageId(ctx: TelegramBotProviderMessageCtx): number {
    const message = this.getMessage(ctx);
    return message.message_id;
  }
  getMessageText(ctx: TelegramBotProviderMessageCtx): string {
    if (typeof ctx === 'string') return ctx;
    if (get(ctx, 'message.caption')) return get(ctx, 'message.caption');
    if (get(ctx, 'message.text')) return get(ctx, 'message.text');
    return get(ctx, 'text');
  }
  isMessageCommand(ctx: TelegramBotProviderMessageCtx, command: RegExp | string): boolean {
    return this.isMessageStartsWith(ctx, `/${command}`);
  }
  getMessageDate(ctx: TelegramBotProviderMessageCtx): Date {
    const message = this.getMessage(ctx);
    return new Date(message.date * 1000);
  }
  getMessageType(ctx: TelegramBotProviderMessageCtx): string {
    const message = this.getMessage(ctx);
    if (message.photo) return 'photo';
    if (message.sticker) return 'sticker';
    if (message.voice) return 'voice';
    if (message.location) return 'location';
    if (message.document) return 'document';
    if (message.audio) return 'audio';
    if (message.text) return 'text';
    return null;
  }
  reply(ctx, payload, extra = {}) {
    return this.client.telegram.sendMessage()
    return this.client.telegram.sendMessage(this.getMessageTargetId(ctx), payload, {
      ...extra,
      reply_to_message_id: this.getReplyMessageId(ctx),
    });
  }
  sendMessage(ctx, ...args) {
    return this.client.telegram.sendMessage(this.getMessageTargetId(ctx), ...args);
  }
  sendSticker(ctx, ...args) {
    return this.client.telegram.sendSticker(this.getMessageTargetId(ctx), ...args);
  }
  sendAnimation(ctx, ...args) {
    return this.client.telegram.sendAnimation(this.getMessageTargetId(ctx), ...args);
  }
  sendDocument(ctx, ...args) {
    return this.client.telegram.sendDocument(this.getMessageTargetId(ctx), ...args);
  }
  sendPhoto(ctx, ...args) {
    return this.client.telegram.sendPhoto(this.getMessageTargetId(ctx), ...args);
  }

  isMessageLike(ctx) {
    const message = this.getMessage(ctx);
    const likes = ['+', '👍', '➕'].map((a) => a.codePointAt(0));

    let firstSign;
    if (message && message.text && message.text.codePointAt) {
      firstSign = message.text.codePointAt(0);
    } else if (message && message.sticker && message.sticker.emoji) {
      firstSign = message.sticker.emoji.codePointAt(0);
    }
    return firstSign && likes.includes(firstSign);
  }
  // async repost({message, chatId, forwardFrom}) {
  //   const data = { };
  //   if (message.sticker) {
  //     data.type = 'sticker';
  //     data.method = 'sendSticker';
  //     data.path = message.sticker.file_id;
  //   }
  //   if (message.photo) {
  //     data.type = 'photo';
  //     data.method = 'sendPhoto';
  //     data.text = message.caption || '';
  //     data.path = message.photo[0].file_id;
  //     data.opt = {
  //       caption: message.caption,
  //     };
  //   }
  //   if (message.voice) {
  //     data.type = 'voice';
  //     data.method = 'sendVoice';
  //     data.path = message.voice.file_id;
  //   }
  //   if (message.video_note) {
  //     data.type = 'video_note';
  //     data.method = 'sendVideoNote';
  //     data.path = message.video_note.file_id;
  //   }
  //   if (message.video) {
  //     data.type = 'video';
  //     data.method = 'sendVideo';
  //     data.path = message.video.file_id;
  //   }
  //   if (message.location) {
  //     data.type = 'location';
  //     data.method = 'sendLocation';
  //     data.path = message.location.latitude;
  //     data.opt = message.location.longitude;
  //   }
  //   if (message.document) {
  //     data.type = 'document';
  //     data.method = 'sendDocument';
  //     data.path = message.document.file_id;
  //     data.opt = {
  //       caption: message.caption,
  //     };
  //   }
  //   if (message.text) {
  //     data.type = 'text';
  //     data.method = 'sendMessage';
  //     data.path = message.text;
  //   }
  //   if (message.audio) {
  //     data.type = 'audio';
  //     data.method = 'sendAudio';
  //     data.path = message.audio.file_id;
  //   }
  //   if (forwardFrom) {
  //     return this.bot.forwardMessage(chatId, forwardFrom, message.message_id);
  //   } else if (data.method) {
  //     return this.bot[data.method](chatId, data.path, data.opt || {});
  //   } else {
  //     console.error('НАТА РЕАЛИЗУЙ МЕНЯ', message);
  //     return null;
  //   }
  // }

  // testGroupId(message, id) {
  //   const chatId = message.chat.id || message.from.id;
  //   return chatId == id;
  // }

  // letter = '[a-zA-Zа-яА-ЯёЁ0-9]';
  // nonLetter = '[^a-zA-Zа-яА-ЯёЁ0-9]';

  // wordBoundary(text, word) {
  //   text.toLowerCase();
  //   const regExp = new RegExp(`\\s${word}\\s`, 'g');
  //   text = text.replace(new RegExp(this.nonLetter, 'g'), ' ');
  //   text = ` ${text} `;
  //   return text.match(regExp);
  // }

  // randomInteger(min, max) {
  //   return random(min, max);
  // }

  // percentProbability(percent) {
  //   const r = random(0, 100);
  //   return r < percent;
  // }

  // send(msg, text, params) {
  //   let {
  //     delay = random(0, 5, 1),
  //     reply = 50,
  //     method = 'sendMessage',
  //   } = params;
  //   const chatId = msg.chat.id || msg.from.id;
  //   const bot = this.bot;
  //   const opt = this.percentProbability(reply) ? {
  //     reply_to_message_id: msg.message_id
  //   } : {};

  //   setTimeout(function () {
  //     bot[method](chatId, text, opt);
  //   }, delay);
  // }
  // sendSticker(msg, text, params = {}) {
  //   this.send(msg, text, {
  //     ...params,
  //     method: 'sendSticker',
  //   })
  // }
  // sendMessage(msg, text, params = {}) {
  //   this.send(msg, text, {
  //     ...params,
  //     method: 'sendMessage',
  //   })
  // }
  // sendPhoto(msg, text, params = {}) {
  //   this.send(msg, text, {
  //     ...params,
  //     method: 'sendPhoto',
  //   })
  // }

  // editMessage(msg, text) {
  //   msg.then((sended) => {
  //     const chatId = sended.chat.id;
  //     const messageId = sended.message_id;
  //     this.bot.editMessageText(text, { chat_id: chatId, message_id: messageId });
  //   });
  // }

  // deleteMessage(chat_id, message_id, params = {}) {
  //   this.bot.deleteMessage(chat_id, message_id, params);
  // }
}

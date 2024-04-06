import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Bot } from './models/bot.model';
import { InjectBot } from 'nestjs-telegraf';
import { BOT_NAME } from '../app.constants';
import { Context, Markup, Telegraf } from 'telegraf';

@Injectable()
export class BotService {
  constructor(
    @InjectModel(Bot) private botRepo: typeof Bot,
    @InjectBot(BOT_NAME) private readonly bot: Telegraf<Context>,
  ) {}


  async start(ctx: Context) {
    const userId = ctx.from.id;
    const user = await this.botRepo.findByPk(userId);
    if (!user) {
      await this.botRepo.create({
        user_id: userId,
        username: ctx.from.username,
        first_name: ctx.from.first_name,
        last_name: ctx.from.last_name,
      });

      await ctx.reply(`please, send your phone number`, {
        parse_mode: 'HTML',
        ...Markup.keyboard([
          [Markup.button.contactRequest('📞 sending phone number')],
        ])
          .resize()
          .oneTime(),
      });
    } else if (!user.status) {
      await ctx.reply(`please, send your phone number`, {
        parse_mode: 'HTML',
        ...Markup.keyboard([
          [Markup.button.contactRequest('📞 Sending phone number')],
        ])
          .resize()
          .oneTime(),
      });
    } else {
      await ctx.reply(`Bu bot orqali moyka-bot bilan muloqot ornatiladi!`, {
        parse_mode: 'HTML',
        ...Markup.removeKeyboard(),
      });
    }
  }


  async onContact(ctx: Context) {
    if ('contact' in ctx.message) {
      const userId = ctx.from.id;
      const user = await this.botRepo.findByPk(userId);
      if (!user) {
        await ctx.reply(`Iltimos, <b>"/start"<b> tugmasini bosing`, {
          parse_mode: 'HTML',
          ...Markup.keyboard([['/start']])
            .resize()
            .oneTime(),
        });
      } else if (user.status) {
        await ctx.reply(`Kechirasiz siz royxatdan o'tib bolgansiz`, {
          parse_mode: 'HTML',
          ...Markup.removeKeyboard(),
        });
      } else if (ctx.message.contact.user_id != userId) {
        await ctx.reply(`Iltimos, o'zingizni raqamizi yuboring!`, {
          parse_mode: 'HTML',
          ...Markup.keyboard([
            [Markup.button.contactRequest('📞 Sending phone number')],
          ])
            .resize()
            .oneTime(),
        });
      } else {
        await this.botRepo.update(
          {
            phone_number: ctx.message.contact.phone_number,
            status: true,
          },
          { where: { user_id: userId } },
        );
        await ctx.reply(`Tabriklayman, ro'yxatdan o'tdingiz!\nIltimos mashinangiz `, {
          parse_mode: 'HTML',
          ...Markup.removeKeyboard(),
        });
      }
    }
  }
}

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Bot } from './models/bot.model';
import { InjectBot } from 'nestjs-telegraf';
import { BOT_NAME } from '../app.constants';
import { Context, Markup, Telegraf } from 'telegraf';
import { Car } from './models/cars.model';
import { log } from 'console';

@Injectable()
export class BotService {
  constructor(
    @InjectModel(Bot) private botRepo: typeof Bot,
    @InjectModel(Car) private carRepo: typeof Car,
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
      // await ctx.reply(`Bu bot orqali Moyka bilan muloqot ornatiladi!`, {
      //   parse_mode: 'HTML',
      //   ...Markup.removeKeyboard(),
      // });
      const inlineKeyboard = [
        [
          {
            text: 'My cars',
            callback_data: 'mycars',
          },
        ],
        [
          {
            text: 'Add new car',
            callback_data: 'addcar',
          },
        ],
        [
          {
            text: 'Delete Car',
            callback_data: 'deletecar',
          },
        ],
      ];
      await ctx.reply('Buttonlardan birini tanlang:', {
        reply_markup: {
          inline_keyboard: inlineKeyboard,
        },
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
      } else if (ctx.message.contact.user_id != userId) {
        await ctx.reply(`Iltimos, o'zingizni raqamizi yuboring!`, {
          parse_mode: 'HTML',
          ...Markup.keyboard([
            [Markup.button.contactRequest('📞 Sending phone number')],
          ])
            .resize()
            .oneTime(),
        });
      } else if (user.status) {
        await ctx.reply(`Kechirasiz siz royxatdan o'tib bolgansiz`, {
          parse_mode: 'HTML',
          ...Markup.removeKeyboard(),
        });
      } else {
        await this.botRepo.update(
          {
            phone_number: ctx.message.contact.phone_number,
            status: true,
          },
          { where: { user_id: userId } },
        );
        await ctx.reply(`Tabriklayman, ro'yxatdan o'tdingiz!`, {
          parse_mode: 'HTML',
          ...Markup.removeKeyboard(),
        });
        const inlineKeyboard = [
          [
            {
              text: 'My cars',
              callback_data: 'mycars',
            },
          ],
          [
            {
              text: 'Add new car',
              callback_data: 'addcar',
            },
          ],
          [
            {
              text: 'Delete Car',
              callback_data: 'deletecar',
            },
          ],
        ];
        await ctx.reply('Buttonlardan birini tanlang:', {
          reply_markup: {
            inline_keyboard: inlineKeyboard,
          },
        });
      }
    }
  }

  async onClicMyCarsButton(ctx: Context) {
    const user_id = ctx.from.id;
    const car = await this.carRepo.findAll({
      include: { all: true },
      where: { userId: user_id },
    });
    if (car.length == 0) {
      const inlineKeyboard = [
        [
          {
            text: 'Add new car',
            callback_data: 'addcar',
          },
        ],
      ];
      await ctx.reply(
        'Siz hali mashina qoshmagansz. Iltimos mashina qoshing!',
        {
          reply_markup: {
            inline_keyboard: inlineKeyboard,
          },
        },
      );
    } else {
      await ctx.reply(`${car}`);
    }
  }

  // async onClickAddCarButton(ctx: any) {
  //   const sentMessage = await ctx.replyWithText(
  //     `Mashinangiz modelini kiriting => (nexia 2):`,
  //   );

  //   const reply = await ctx.telegram.waitForReply(
  //     sentMessage.chat.id,
  //     sentMessage.message_id,
  //   );

  //   if (reply) {
  //     const carModel = reply.text;
  //     log(carModel)

  //     // Assuming you have carNumber and carColor defined somewhere
  //     const carNumber = ''; // Define carNumber
  //     const carColor = ''; // Define carColor

  //     // Assuming this.carRepo.create() is a function that saves a new car object
  //     const newCar = this.carRepo.create({
  //       model: carModel,
  //       number: carNumber,
  //       color: carColor,
  //       userId: ctx.from.id,
  //     });

  //     // Assuming you want to log the newly created car
  //     console.log(newCar);
  //   } else {
  //     // Handle if no reply is received
  //     console.log('No reply received');
  //   }
  // }
}

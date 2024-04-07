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
    const inlineKeyboard = [
      [
        {
          text: "O'zbek tili 🇺🇿",
          callback_data: 'uzbek',
        },
        {
          text: 'Pусский язык 🇷🇺',
          callback_data: 'rus',
        },
      ],
    ];
    await ctx.reply(
      `Buttonlardan birini tanlang 🇺🇿


Выберите одну из кнопок 🇷🇺
    `,
      {
        reply_markup: {
          inline_keyboard: inlineKeyboard,
        },
      },
    );
  }

  // ============= Uzbek tili bolimi ============
  async onClickUzbekButton(ctx: Context) {
    const userId = ctx.from.id;
    const user = await this.botRepo.findByPk(userId);
    if (!user) {
      await this.botRepo.create({
        user_id: userId,
        username: ctx.from.username,
        first_name: ctx.from.first_name,
        last_name: ctx.from.last_name,
      });

      await ctx.reply(`Iltimos telefon raqamingizni yuboring!`, {
        parse_mode: 'HTML',
        ...Markup.keyboard([
          [Markup.button.contactRequest('📞 Telefon raqamini yuborish')],
        ])
          .resize()
          .oneTime(),
      });
    } else if (!user.status) {
      await ctx.reply(`Iltimos telefon raqamingizni yuboring!`, {
        parse_mode: 'HTML',
        ...Markup.keyboard([
          [Markup.button.contactRequest('📞 Telefon raqamini yuborish')],
        ])
          .resize()
          .oneTime(),
      });
    } else {
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
            [Markup.button.contactRequest('📞 Telefon raqamini yuborish')],
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
      const deleteKeyboard = [
        [
          {
            text: 'Delete this car',
            callback_data: 'deletecarid',
          },
        ],
      ];
      for (let i of car) {
        await ctx.reply(
          `🚗 Modeli: ${i.model}

🔴 Rangi: ${i.color}

🇺🇿 Davlat raqami: ${i.number}
        `,
          {
            reply_markup: {
              inline_keyboard: deleteKeyboard,
            },
          },
        );
      }
    }
  }

  async onClickAddCarButton(ctx: Context) {
    const newCar = await this.carRepo.create({
      model: null,
      number: null,
      color: null,
      userId: ctx.from.id,
      text_status: 'car_model',
    });

    if (newCar.text_status == 'car_model') {
      await ctx.reply(`Iltimos mashinangiz modelini kiriting!`);
      newCar.text_status = 'car_number';
      await newCar.save();
      log(newCar)
    }
  }

  async onText(ctx: Context) {
    const cars = await this.carRepo.findOne({ where: { color: null } });
    log(cars)
    if ('text' in ctx.message) {
      if (cars.text_status === 'car_number') {
        cars.model = ctx.message.text;
        await ctx.reply(
          'Iltimos mashinangizning davlat raqamini kiriting (masalan: 60A034AA):',
        );
        cars.text_status = 'car_color';
        await cars.save();

        log(cars)
      } else if (cars.text_status === 'car_color') {
        log(cars)
        cars.number = ctx.message.text;
        await ctx.reply(
          'Iltimos mashinangizning rangini kiriting (masalan: qora):',
        );
        cars.text_status = 'text_status';
        await cars.save();
        log(cars)
      } else {
        cars.color = ctx.message.text;
        await this.carRepo.update(
          {
            model: cars.model,
            number: cars.number,
            color: cars.color,
          },
          { where: { userId: ctx.from.id } },
        );
        await ctx.reply("Tabriklayman, mashina muvaffaqiyatli qo'shildi ✅");
      }
    }
  }

  async deleteCar(ctx: Context, carId: number) {
    try {
      const deletedCarCount = await this.carRepo.destroy({
        where: {
          id: carId,
          userId: ctx.from.id,
        },
      });

      if (deletedCarCount > 0) {
        await ctx.reply(`Avtomobil muvaffaqiyatli oʻchirildi ✅`);
      } else {
        await ctx.reply(`Avtomobil topilmadi yoki oʻchirilmadi 🤷‍♂️`);
      }
    } catch (error) {
      console.error("Avtomobilni o'chirishda xatolik yuz berdi:", error);
      await ctx.reply(`Sizda hech qanday mashina yoq ❌`);
    }
  }

  //  ============= Rus tili bolimi xali beri tayyor emas ============
}

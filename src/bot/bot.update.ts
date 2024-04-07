import { log } from 'console';
import {
  Action,
  Command,
  Ctx,
  Hears,
  On,
  Start,
  Update,
} from 'nestjs-telegraf';
import { Context, Markup } from 'telegraf';
import { BotService } from './bot.service';
import { InjectModel } from '@nestjs/sequelize';
import { Car } from './models/cars.model';

@Update()
export class BotUpdate {
  constructor(
    private readonly botServise: BotService,
    @InjectModel(Car) private carRepo: typeof Car,
  ) {}

  @Start()
  async onStart(@Ctx() ctx: Context) {
    this.botServise.start(ctx);
  }

  @Action('uzbek')
  async onClickUzbekButton(@Ctx() ctx: Context) {
    this.botServise.onClickUzbekButton(ctx);
  }

  @Action('rus')
  async onClickRusButton(@Ctx() ctx: Context) {
    await ctx.reply(
      `Bu qismi xali beri tayyor emas. Iltimos Uzbek tili bolimini tanlang😄`,
    );
  }

  @On('contact')
  async onContact(@Ctx() ctx: Context) {
    await this.botServise.onContact(ctx);
  }

  @Action('mycars')
  async onClicMyCarsButton(@Ctx() ctx: Context) {
    await this.botServise.onClicMyCarsButton(ctx);
  }

  @Action('addcar')
  async onClickAddCarButton(@Ctx() ctx: Context) {
    await this.botServise.onClickAddCarButton(ctx);
  }

  @Action('deletecar')
  async onClickDeleteCarButton(@Ctx() ctx: Context) {
    await this.botServise.onClicMyCarsButton(ctx);
  }

  @Action('deletecarid')
  async onClickDeleteCarIdButton(ctx: Context) {
    try {
      let carId;
      const car = await this.carRepo.findOne({
        where: { userId: ctx.from.id },
      });
      log(car.id)
      if (car) {
        carId = car.id;
      } else {
        console.log('Mashina topilmadi.');
      }
      await this.botServise.deleteCar(ctx, parseInt(carId));
    } catch (error) {
      console.error("Avtomobilni o'chirishda xatolik yuz berdi:", error);
      await ctx.reply(`Sizda hech qanday mashina yoq❌`);
    }
  }

  @On('text')
  async onText(@Ctx() ctx: Context) {
    await this.botServise.onText(ctx);
  }

  // @On('photo')
  // async onPhoto(@Ctx() ctx: Context) {
  //   if ('photo' in ctx.message) {
  //     log(ctx.message.photo);
  //     await ctx.replyWithPhoto(
  //       String(ctx.message.photo[ctx.message.photo.length - 1].file_id),
  //     );
  //   }
  // }

  // @On('video')
  // async onVideo(@Ctx() ctx: Context) {
  //   if ('video' in ctx.message) {
  //     log(ctx.message.video);
  //     await ctx.reply(String(ctx.message.video.file_name));
  //   }
  // }

  // @On('sticker')
  // async onSticker(@Ctx() ctx: Context) {
  //   if ('sticker' in ctx.message) {
  //     log(ctx.message.sticker);
  //     await ctx.reply('🖕');
  //   }
  // }

  // @On('animation')
  // async onAnimation(@Ctx() ctx: Context) {
  //   if ('animation' in ctx.message) {
  //     log(ctx.message.animation);
  //     await ctx.reply('🖕');
  //   }
  // }

  // @On('contact')
  // async onContact(@Ctx() ctx: Context) {
  //   if ('contact' in ctx.message) {
  //     log(ctx.message.contact);
  //     await ctx.reply(String(ctx.message.contact.phone_number));
  //     await ctx.reply(String(ctx.message.contact.first_name));
  //     await ctx.reply(String(ctx.message.contact.user_id));
  //   }
  // }

  // @On('location')
  // async onLocation(@Ctx() ctx: Context) {
  //   if ('location' in ctx.message) {
  //     log(ctx.message.location);
  //     await ctx.reply(String(ctx.message.location.latitude));
  //     await ctx.reply(String(ctx.message.location.longitude));
  //     await ctx.replyWithLocation(
  //       ctx.message.location.latitude,
  //       ctx.message.location.longitude,
  //     );
  //   }
  // }

  // @On('invoice')
  // async onInvoice(@Ctx() ctx: Context) {
  //   if ('invoice' in ctx.message) {
  //     log(ctx.message.invoice);
  //     await ctx.reply(String(ctx.message.invoice.title));
  //   }
  // }

  // @On('document')
  // async onDocument(@Ctx() ctx: Context) {
  //   if ('document' in ctx.message) {
  //     log(ctx.message.document);
  //     await ctx.reply(String(ctx.message.document.file_name));
  //   }
  // }

  // @Hears('hi')
  // async hearsHi(@Ctx() ctx: Context) {
  //   await ctx.reply('Hey there');
  // }

  // @Command('help')
  // async helpCommand(@Ctx() ctx: Context) {
  //   await ctx.reply('Koooop narsa oqidim deb tasavur qil🍑');
  // }

  // @Command('inline_keyboard')
  // async inlineButton(@Ctx() ctx: Context) {
  //   const inlineKeyboard = [
  //     [
  //       {
  //         text: 'Button 1',
  //         callback_data: 'button1',
  //       },
  //       {
  //         text: 'Button 2',
  //         callback_data: 'button2',
  //       },
  //       {
  //         text: 'Button 3',
  //         callback_data: 'button3',
  //       },
  //     ],
  //     [
  //       {
  //         text: 'Button 4',
  //         callback_data: 'button4',
  //       },
  //     ],
  //     [
  //       {
  //         text: 'Button 5',
  //         callback_data: 'button5',
  //       },
  //     ],
  //   ];
  //   await ctx.reply('Inline buttonni tanla:', {
  //     reply_markup: {
  //       inline_keyboard: inlineKeyboard,
  //     },
  //   });
  // }

  // @Action('button1')
  // async onActionButton1(@Ctx() ctx: Context) {
  //   await ctx.reply('Button 1 bosildi');
  // }

  // @Action('button2')
  // async onActionButton2(@Ctx() ctx: Context) {
  //   await ctx.reply('Button 2 bosildi');
  // }

  // @Action(/button+[1-9]/)
  // async onActionAnyButton(@Ctx() ctx: Context) {
  //   await ctx.reply('Any Button bosildi');
  // }

  // @Command('main_keyboard')
  // async onMainKeyboard(@Ctx() ctx: Context) {
  //   ctx.reply('Main button tanla: ', {
  //     parse_mode: 'HTML',
  //     ...Markup.keyboard([
  //       ['bir', 'ikki', 'uch'],
  //       ['tort'],
  //       [Markup.button.contactRequest('Telefon raqamni yuboring')],
  //       [Markup.button.locationRequest('Locatsiyani yuboring')],
  //     ])
  //       .resize()
  //       .oneTime(),
  //   });
  // }

  // @Hears('bir')
  // async hearsBir(@Ctx() ctx: Context) {
  //   ctx.reply('Bir bosildi');
  // }

  // @On('text')
  // async onText(@Ctx() ctx: Context) {
  //   log(ctx);
  //   if ('text' in ctx.message) {
  //     if (ctx.message.text == 'salom') {
  //       await ctx.replyWithHTML('<b>Hello</b>');
  //     } else {
  //       await ctx.replyWithHTML(`<b>${ctx.message.text}</b>`);
  //     }
  //   }
  // }

  // @On('message')
  // async onMessage(@Ctx() ctx: Context) {
  //   log(ctx.botInfo);
  //   log(ctx.chat);
  //   log(ctx.chat.id);
  //   log(ctx.from);
  //   log(ctx.from.first_name);
  // }
}

import { Bot, InlineKeyboard } from 'grammy'
import { prisma } from './prisma'
import { env } from './env'

let _bot: Bot | null = null

export function getBot(): Bot {
  if (_bot) return _bot

  const bot = new Bot(env.TELEGRAM_BOT_TOKEN)

  const webAppUrl = env.WEBAPP_URL

  const mainKeyboard = () =>
    new InlineKeyboard()
      .webApp('Открыть тренировку', `${webAppUrl}/app`)
      .row()
      .webApp('Пройти экзамен', `${webAppUrl}/app?mode=exam`)
      .row()
      .webApp('Настройки', `${webAppUrl}/app/settings`)

  bot.command('start', async (ctx) => {
    const from = ctx.from
    if (!from || !ctx.chat) return
    await prisma.user.upsert({
      where: { telegramUserId: BigInt(from.id) },
      create: {
        telegramUserId: BigInt(from.id),
        chatId: BigInt(ctx.chat.id),
        username: from.username,
        firstName: from.first_name,
        reminderSettings: { create: {} },
      },
      update: {
        chatId: BigInt(ctx.chat.id),
        username: from.username,
        firstName: from.first_name,
        lastSeenAt: new Date(),
      },
    })

    await ctx.reply(
      [
        'Привет! 🚗',
        '',
        'Я помогу подготовиться к теоретическому экзамену на права категории B в Буэнос-Айресе (CABA).',
        '',
        '• Испанский оригинал + русский перевод',
        '• Тренировка, экзамен (40 вопросов), повторение ошибок',
        '• Ежедневное напоминание',
        '',
        'Открывай mini app — начнём.',
      ].join('\n'),
      { reply_markup: mainKeyboard() },
    )
  })

  bot.command('practice', async (ctx) => {
    await ctx.reply('Тренировка:', {
      reply_markup: new InlineKeyboard().webApp('Открыть', `${webAppUrl}/app?mode=practice`),
    })
  })

  bot.command('exam', async (ctx) => {
    await ctx.reply('Экзамен (40 вопросов):', {
      reply_markup: new InlineKeyboard().webApp('Начать', `${webAppUrl}/app?mode=exam`),
    })
  })

  bot.command('settings', async (ctx) => {
    await ctx.reply('Настройки:', {
      reply_markup: new InlineKeyboard().webApp('Открыть настройки', `${webAppUrl}/app/settings`),
    })
  })

  bot.command('status', async (ctx) => {
    const from = ctx.from
    if (!from) return
    const user = await prisma.user.findUnique({
      where: { telegramUserId: BigInt(from.id) },
    })
    if (!user) {
      await ctx.reply('Сначала нажми /start, чтобы я тебя запомнил.')
      return
    }
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayAttempts = await prisma.attempt.count({
      where: { userId: user.id, answeredAt: { gte: today } },
    })
    const total = await prisma.attempt.count({ where: { userId: user.id } })
    const correct = await prisma.attempt.count({
      where: { userId: user.id, isCorrect: true },
    })
    const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0
    await ctx.reply(
      [
        `Сегодня решено: ${todayAttempts}`,
        `Всего попыток: ${total}`,
        `Точность: ${accuracy}%`,
      ].join('\n'),
      { reply_markup: mainKeyboard() },
    )
  })

  bot.catch((err) => {
    console.error('[bot] error', err)
  })

  _bot = bot
  return bot
}

export function mainMenuKeyboard(): InlineKeyboard {
  const webAppUrl = env.WEBAPP_URL
  return new InlineKeyboard()
    .webApp('Начать тренировку', `${webAppUrl}/app?mode=practice`)
    .row()
    .webApp('Пройти экзамен', `${webAppUrl}/app?mode=exam`)
}

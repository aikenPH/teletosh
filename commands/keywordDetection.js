const ModerationTools = require("../handlers/moderationTools")

const banKeywords = [
  // Bullying
  "loser",
  "stupid",
  "idiot",
  "dumb",
  "ugly",
  "fat",
  "worthless",
  "useless",
  "pathetic",
  "weak",
  // Crime
  "steal",
  "rob",
  "murder",
  "kill",
  "assault",
  "drug",
  "illegal",
  "weapon",
  "fraud",
  "hack",
  // Insults
  "bastard",
  "bitch",
  "asshole",
  "moron",
  "jerk",
  "scumbag",
  "douchebag",
  "prick",
  "slut",
  "whore",
  // Discrimination
  "racist",
  "sexist",
  "homophobe",
  "bigot",
  "nazi",
  "supremacist",
  "discriminate",
  "prejudice",
  "stereotype",
  "xenophobe",
  // Profanity
  "fuck",
  "shit",
  "damn",
  "ass",
  "cunt",
  "dick",
  "cock",
  "pussy",
  "twat",
  "wanker",
  // Threats
  "threaten",
  "hurt",
  "attack",
  "beat",
  "fight",
  "punch",
  "stab",
  "shoot",
  "torture",
  "revenge",
  // Sexual harassment
  "rape",
  "molest",
  "grope",
  "harass",
  "stalk",
  "creep",
  "pervert",
  "pedophile",
  "predator",
  "abuse",
  // Hate speech
  "nigger",
  "faggot",
  "retard",
  "spic",
  "kike",
  "chink",
  "wetback",
  "gook",
  "tranny",
  "dyke",
  // Violence
  "bloodshed",
  "massacre",
  "slaughter",
  "mutilate",
  "dismember",
  "behead",
  "strangle",
  "suffocate",
  "maim",
  "brutalize",
  // Extremism
  "terrorist",
  "extremist",
  "radical",
  "jihad",
  "anarchist",
  "fascist",
  "supremacy",
  "genocide",
  "ethnic cleansing",
  "martyr",
]

class KeywordDetection {
  constructor(bot, db) {
    this.bot = bot
    this.db = db
    this.moderationTools = new ModerationTools(bot, db)
    this.userWarnings = new Map()
  }

  async checkMessage(msg) {
    const chatId = msg.chat.id
    const userId = msg.from.id
    const text = msg.text.toLowerCase()

    for (const keyword of banKeywords) {
      if (text.includes(keyword)) {
        return this.handleViolation(chatId, userId)
      }
    }
  }

  async handleViolation(chatId, userId) {
    if (!this.userWarnings.has(userId)) {
      this.userWarnings.set(userId, 1)
      await this.warnUser(chatId, userId)
    } else {
      this.userWarnings.set(userId, 2)
      await this.muteUser(chatId, userId)
    }
  }

  async warnUser(chatId, userId) {
    const warningMessage = `⚠️ Warning: Your message contains prohibited content. Please refrain from using offensive language. Further violations may result in muting.`
    await this.bot.sendMessage(chatId, warningMessage, { reply_to_message_id: userId })
  }

  async muteUser(chatId, userId) {
    const muteDuration = 60 * 60 // 1 hour in seconds
    await this.moderationTools.handleMute(chatId, userId, muteDuration)
    const muteMessage = `🔇 User has been muted for 1 hour due to repeated use of prohibited content.`
    await this.bot.sendMessage(chatId, muteMessage, { reply_to_message_id: userId })
  }
}

module.exports = {
  name: "keyworddetection",
  description: "Automatically detect and moderate messages containing prohibited keywords",
  async execute(bot, msg, args, db) {
    const keywordDetection = new KeywordDetection(bot, db)
    await keywordDetection.checkMessage(msg)
  },
}


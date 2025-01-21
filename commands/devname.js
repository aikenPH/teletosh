const prefixes = [
    'cyber', 'tech', 'code', 'dev', 'hack', 'byte', 'pixel', 'data', 'web', 'net',
    'algo', 'script', 'logic', 'proto', 'meta', 'digital', 'binary', 'quantum', 'neural', 'crypto',
    'machine', 'cloud', 'zero', 'stack', 'core', 'spark', 'prime', 'matrix', 'flux', 'nano',
    'system', 'micro', 'intel', 'async', 'sync', 'root', 'admin', 'kernel', 'lambda', 'debug',
    'circuit', 'network', 'stream', 'buffer', 'cache', 'block', 'thread', 'signal', 'proxy', 'wire',
    'pulse', 'blade', 'bolt', 'drone', 'alpha', 'beta', 'gamma', 'delta', 'echo', 'omega',
    'quantum', 'neural', 'ai', 'ml', 'deep', 'learn', 'brain', 'smart', 'cognitive', 'logic',
    'compute', 'process', 'daemon', 'router', 'switch', 'server', 'client', 'host', 'portal', 'gateway',
    'code', 'dev', 'build', 'compile', 'debug', 'test', 'deploy', 'scale', 'optimize', 'refactor',
    'design', 'architect', 'engineer', 'program', 'develop', 'create', 'innovate', 'solve', 'craft', 'build',
    'algo', 'math', 'logic', 'theorem', 'formula', 'compute', 'calculate', 'solve', 'derive', 'analyze',
    'graph', 'matrix', 'vector', 'tensor', 'prime', 'cipher', 'pattern', 'sequence', 'algorithm', 'compute',
    'spark', 'fire', 'blaze', 'storm', 'thunder', 'lightning', 'wave', 'stream', 'river', 'ocean',
    'moon', 'star', 'galaxy', 'cosmos', 'nebula', 'planet', 'asteroid', 'comet', 'solar', 'lunar',
    'bit', 'byte', 'pixel', 'render', 'stream', 'sync', 'async', 'parallel', 'concurrent', 'distributed',
    'flux', 'phase', 'shift', 'wave', 'pulse', 'signal', 'node', 'link', 'mesh', 'grid',
    'micro', 'macro', 'nano', 'pico', 'tera', 'giga', 'mega', 'kilo', 'deca', 'hecto',
    'circuit', 'chip', 'core', 'processor', 'mainframe', 'terminal', 'console', 'interface', 'protocol', 'kernel',
    'cryptic', 'cipher', 'encode', 'decode', 'encrypt', 'decrypt', 'hash', 'key', 'token', 'secure',
    'flux', 'dynamic', 'static', 'runtime', 'compile', 'interpret', 'execute', 'process', 'thread', 'context',
    'abstract', 'concrete', 'virtual', 'actual', 'real', 'potential', 'dynamic', 'static', 'generic', 'specific',
    'prime', 'root', 'base', 'core', 'central', 'primary', 'main', 'key', 'primary', 'fundamental',
    'nano', 'micro', 'mini', 'macro', 'mega', 'giga', 'tera', 'peta', 'exa', 'zetta',
    'neural', 'cognitive', 'intelligent', 'smart', 'adaptive', 'learning', 'reasoning', 'thinking', 'processing', 'analyzing',
    'quantum', 'superposition', 'entanglement', 'probabilistic', 'coherent', 'interference', 'tunneling', 'spin', 'qbit', 'state',
    'cyber', 'digital', 'virtual', 'online', 'network', 'connected', 'global', 'universal', 'integrated', 'distributed',
    'proto', 'meta', 'hyper', 'ultra', 'super', 'trans', 'inter', 'multi', 'poly', 'cross',
    'dynamic', 'elastic', 'flexible', 'adaptive', 'scalable', 'agile', 'robust', 'resilient', 'responsive', 'intelligent',
    'abstract', 'conceptual', 'theoretical', 'hypothetical', 'speculative', 'innovative', 'experimental', 'exploratory', 'groundbreaking', 'revolutionary',
    'prime', 'core', 'essential', 'fundamental', 'basic', 'elemental', 'primary', 'key', 'critical', 'central',
    'quantum', 'neural', 'cognitive', 'intelligent', 'adaptive', 'learning', 'reasoning', 'thinking', 'processing', 'analyzing',
    'cyber', 'digital', 'virtual', 'online', 'network', 'connected', 'global', 'universal', 'integrated', 'distributed',
    'proto', 'meta', 'hyper', 'ultra', 'super', 'trans', 'inter', 'multi', 'poly', 'cross',
    'dynamic', 'elastic', 'flexible', 'adaptive', 'scalable', 'agile', 'robust', 'resilient', 'responsive', 'intelligent'
];
const suffixes = [
    'warrior', 'champion', 'elite', 'legend', 'titan', 'phoenix', 'dragon', 'wolf', 'hawk', 'fox',
    'knight', 'samurai', 'ranger', 'sentinel', 'guardian', 'shield', 'blade', 'storm', 'thunder', 'lightning',
    'master', 'sage', 'guru', 'sensei', 'prophet', 'oracle', 'seer', 'visionary', 'architect', 'strategist',
    'hunter', 'ranger', 'scout', 'sniper', 'tracker', 'breaker', 'crusher', 'slayer', 'killer', 'destroyer',
    'spark', 'flame', 'blaze', 'inferno', 'nova', 'star', 'comet', 'meteor', 'rocket', 'satellite',
    'zero', 'prime', 'omega', 'alpha', 'beta', 'gamma', 'delta', 'epsilon', 'zeta', 'sigma',
    'force', 'power', 'might', 'strength', 'core', 'pulse', 'wave', 'stream', 'flow', 'surge',
    'spirit', 'soul', 'mind', 'brain', 'intellect', 'genius', 'prodigy', 'mastermind', 'innovator', 'creator',
    'guardian', 'protector', 'defender', 'shield', 'armor', 'wall', 'fortress', 'bastion', 'sentinel', 'warden',
    'hunter', 'seeker', 'explorer', 'pioneer', 'trailblazer', 'adventurer', 'voyager', 'navigator', 'pathfinder', 'scout',
    'blade', 'edge', 'razor', 'knife', 'sword', 'dagger', 'spear', 'lance', 'arrow', 'bolt',
    'storm', 'thunder', 'lightning', 'cyclone', 'hurricane', 'tornado', 'tempest', 'gale', 'squall', 'whirlwind',
    'shadow', 'ghost', 'phantom', 'spectre', 'wraith', 'shade', 'whisper', 'echo', 'silence', 'void',
    'rock', 'stone', 'mountain', 'cliff', 'peak', 'boulder', 'granite', 'marble', 'crystal', 'diamond',
    'wave', 'tide', 'current', 'river', 'ocean', 'sea', 'stream', 'rapids', 'waterfall', 'cascade',
    'fire', 'flame', 'blaze', 'inferno', 'ember', 'spark', 'burn', 'heat', 'solar', 'plasma',
    'wind', 'breeze', 'gust', 'draft', 'zephyr', 'cyclone', 'whirl', 'gale', 'breath', 'air',
    'light', 'ray', 'beam', 'gleam', 'shine', 'spark', 'flash', 'radiance', 'glow', 'brilliance',
    'dark', 'shade', 'shadow', 'night', 'void', 'eclipse', 'midnight', 'dusk', 'twilight', 'gloom',
    'star', 'nova', 'comet', 'meteor', 'galaxy', 'cosmos', 'universe', 'nebula', 'constellation', 'orbit',
    'frost', 'ice', 'snow', 'crystal', 'glacier', 'arctic', 'winter', 'freeze', 'chill', 'cold'
];
const techTerms = [
    'git', 'node', 'react', 'vue', 'rust', 'java', 'py', 'go', 'ruby', 'swift',
    'docker', 'kubernetes', 'ansible', 'terraform', 'nginx', 'kafka', 'redis', 'mongo', 'graphql', 'apollo',
    'webpack', 'babel', 'typescript', 'kotlin', 'scala', 'dart', 'elixir', 'erlang', 'haskell', 'clojure',
    'angular', 'svelte', 'ember', 'express', 'django', 'flask', 'fastapi', 'spring', 'hibernate', 'laravel',
    'mysql', 'postgres', 'sqlite', 'mariadb', 'cassandra', 'dynamodb', 'elastic', 'solr', 'hadoop', 'spark',
    'linux', 'ubuntu', 'centos', 'debian', 'fedora', 'alpine', 'arch', 'gentoo', 'mint', 'opensuse',
    'aws', 'azure', 'gcp', 'heroku', 'digital', 'linode', 'vultr', 'do', 'oracle', 'ibm',
    'selenium', 'cypress', 'jest', 'mocha', 'junit', 'pytest', 'rspec', 'karma', 'protractor', 'cucumber',
    'grpc', 'rest', 'soap', 'graphql', 'websocket', 'mqtt', 'amqp', 'zeromq', 'thrift', 'protobuf',
    'jenkins', 'gitlab', 'github', 'bitbucket', 'travis', 'circleci', 'codecov', 'sonar', 'jira', 'bamboo'
];
const leetReplacements = {
  'a': '4',
  'e': '3',
  'i': '1',
  'o': '0',
  's': '5',
  't': '7',
  'b': '8',
  'g': '9'
};

class DevNameGenerator {
  constructor() {
    this.styles = ['classic', 'leet', 'minimalist', 'tech'];
  }

  generateClassicStyle(name) {
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
    return `${prefix}${name.toLowerCase()}${suffix}`;
  }

  generateLeetStyle(name) {
    let leetName = name.toLowerCase();
    Object.entries(leetReplacements).forEach(([letter, number]) => {
      leetName = leetName.replace(new RegExp(letter, 'g'), number);
    });
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    return `${prefix}_${leetName}_${Math.floor(Math.random() * 999)}`;
  }

  generateMinimalistStyle(name) {
    const vowels = ['a', 'e', 'i', 'o', 'u'];
    let minName = name.toLowerCase();
    vowels.forEach(vowel => {
      minName = minName.replace(new RegExp(vowel, 'g'), '');
    });
    return `_${minName}_`;
  }

  generateTechStyle(name) {
    const techTerm = techTerms[Math.floor(Math.random() * techTerms.length)];
    return `${techTerm}.${name.toLowerCase()}.dev`;
  }

  generateMultipleNames(name, count = 5) {
    const names = [];
    this.styles.forEach(style => {
      switch(style) {
        case 'classic':
          names.push({ style: 'Classic', name: this.generateClassicStyle(name) });
          break;
        case 'leet':
          names.push({ style: 'Leet', name: this.generateLeetStyle(name) });
          break;
        case 'minimalist':
          names.push({ style: 'Minimalist', name: this.generateMinimalistStyle(name) });
          break;
        case 'tech':
          names.push({ style: 'Tech', name: this.generateTechStyle(name) });
          break;
      }
    });
    return names;
  }

  validateName(name) {
    return /^[a-zA-Z]{2,20}$/.test(name);
  }
}

module.exports = {
  name: 'devname',
  description: 'Generate cool developer usernames based on your name',

  async execute(bot, msg, args) {
    const chatId = msg.chat.id;
    const generator = new DevNameGenerator();

    if (args.length === 0) {
      const helpMessage = `
🔥 *Developer Username Generator*

Generate awesome developer usernames with these commands:

1️⃣ *Basic Generation*
Command: \`/devname <your_name>\`
Example: \`/devname john\`
Generates multiple username variations in different styles

2️⃣ *Style-Specific Generation*
Command: \`/devname <your_name> <style>\`
Available styles:
• classic: \`/devname john classic\`
• leet: \`/devname john leet\`
• minimalist: \`/devname john minimalist\`
• tech: \`/devname john tech\`

*Rules:*
• Name should be 2-20 characters long
• Only letters allowed (A-Z, a-z)
• No spaces or special characters

*Pro tip:* Try different styles to find your perfect dev username! 🚀
`;
      return bot.sendMessage(chatId, helpMessage, { parse_mode: 'Markdown' });
    }

    const name = args[0];
    const style = args[1]?.toLowerCase();

    if (!generator.validateName(name)) {
      return bot.sendMessage(
        chatId,
        "⚠️ Invalid name! Please use only letters (2-20 characters long)."
      );
    }

    try {
      let response;

      if (style && !generator.styles.includes(style)) {
        return bot.sendMessage(
          chatId,
          "⚠️ Invalid style! Available styles: classic, leet, minimalist, tech"
        );
      }

      if (style) {
        let generatedName;
        switch(style) {
          case 'classic':
            generatedName = generator.generateClassicStyle(name);
            break;
          case 'leet':
            generatedName = generator.generateLeetStyle(name);
            break;
          case 'minimalist':
            generatedName = generator.generateMinimalistStyle(name);
            break;
          case 'tech':
            generatedName = generator.generateTechStyle(name);
            break;
        }
        response = `🎯 Your *${style}* developer username:\n\`${generatedName}\``;
      } else {
        const names = generator.generateMultipleNames(name);
        response = '🎨 *Your Developer Usernames:*\n\n' + names.map(
          ({ style, name }) => `*${style}:* \`${name}\``
        ).join('\n');
      }

      await bot.sendMessage(chatId, response, {
        parse_mode: 'Markdown',
        reply_to_message_id: msg.message_id
      });

    } catch (error) {
      console.error('Developer Name Generation Error:', error);
      await bot.sendMessage(
        chatId,
        "😅 Oops! Something went wrong while generating your developer name. Please try again!"
      );
    }
  }
};

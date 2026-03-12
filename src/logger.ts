/**
 * @module logger
 * Colored, timestamped console logger.
 *
 * @author NeoKEX (https://github.com/NeoKEX)
 * @license MIT
 */

type Color = keyof typeof COLORS;

const COLORS = {
  reset:   '\x1b[0m',
  bright:  '\x1b[1m',
  dim:     '\x1b[2m',
  red:     '\x1b[31m',
  green:   '\x1b[32m',
  yellow:  '\x1b[33m',
  blue:    '\x1b[34m',
  magenta: '\x1b[35m',
  cyan:    '\x1b[36m',
  white:   '\x1b[37m',
} as const;

class Logger {
  private readonly prefix: string;

  constructor(prefix = 'ica-neokex') {
    this.prefix = prefix;
  }

  private timestamp(): string {
    const now = new Date();
    return [now.getHours(), now.getMinutes(), now.getSeconds()]
      .map((n) => String(n).padStart(2, '0'))
      .join(':');
  }

  private format(level: string, color: string, message: string, data?: unknown): string {
    const { bright, dim, cyan, reset } = COLORS;
    let out = `${dim}[${this.timestamp()}]${reset} ${color}${bright}[${level}]${reset} ${cyan}${this.prefix}${reset} › ${message}`;
    if (data !== undefined && data !== null) {
      out += `\n${dim}${JSON.stringify(data, null, 2)}${reset}`;
    }
    return out;
  }

  info(message: string, data?: unknown):    void { console.log(this.format('INFO',    COLORS.blue,    message, data)); }
  success(message: string, data?: unknown): void { console.log(this.format('SUCCESS', COLORS.green,   message, data)); }
  warn(message: string, data?: unknown):    void { console.warn(this.format('WARN',   COLORS.yellow,  message, data)); }
  error(message: string, data?: unknown):   void { console.error(this.format('ERROR', COLORS.red,     message, data)); }
  debug(message: string, data?: unknown):   void { console.log(this.format('DEBUG',   COLORS.magenta, message, data)); }
  event(message: string, data?: unknown):   void { console.log(this.format('EVENT',   COLORS.cyan,    message, data)); }
  session(message: string):                 void { console.log(this.format('SESSION', COLORS.green,   message)); }

  login(username: string): void {
    const { green, bright, cyan, reset } = COLORS;
    console.log(this.format('LOGIN', green, `Authenticated as ${cyan}${bright}${username}${reset}`));
  }

  message(from: string, preview: string): void {
    const { bright, dim, reset } = COLORS;
    const short = preview.length > 50 ? `${preview.substring(0, 50)}…` : preview;
    console.log(this.format('MESSAGE', COLORS.cyan, `From ${bright}${from}${reset} › ${dim}${short}${reset}`));
  }

  custom(level: string, color: Color, message: string, data?: unknown): void {
    console.log(this.format(level, COLORS[color], message, data));
  }
}

export default new Logger();

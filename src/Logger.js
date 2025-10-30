class Logger {
  constructor(prefix = 'neokex-ica') {
    this.prefix = prefix;
    this.colors = {
      reset: '\x1b[0m',
      bright: '\x1b[1m',
      dim: '\x1b[2m',
      
      black: '\x1b[30m',
      red: '\x1b[31m',
      green: '\x1b[32m',
      yellow: '\x1b[33m',
      blue: '\x1b[34m',
      magenta: '\x1b[35m',
      cyan: '\x1b[36m',
      white: '\x1b[37m',
      
      bgBlack: '\x1b[40m',
      bgRed: '\x1b[41m',
      bgGreen: '\x1b[42m',
      bgYellow: '\x1b[43m',
      bgBlue: '\x1b[44m',
      bgMagenta: '\x1b[45m',
      bgCyan: '\x1b[46m',
      bgWhite: '\x1b[47m',
    };
  }

  getTimestamp() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  }

  formatMessage(level, color, message, data = null) {
    const timestamp = this.getTimestamp();
    const { bright, dim, reset } = this.colors;
    
    let formattedMsg = `${dim}[${timestamp}]${reset} ${color}${bright}[${level}]${reset} ${this.colors.cyan}${this.prefix}${reset} › ${message}`;
    
    if (data) {
      formattedMsg += `\n${dim}${JSON.stringify(data, null, 2)}${reset}`;
    }
    
    return formattedMsg;
  }

  info(message, data = null) {
    console.log(this.formatMessage('INFO', this.colors.blue, message, data));
  }

  success(message, data = null) {
    console.log(this.formatMessage('SUCCESS', this.colors.green, message, data));
  }

  warn(message, data = null) {
    console.warn(this.formatMessage('WARN', this.colors.yellow, message, data));
  }

  error(message, data = null) {
    console.error(this.formatMessage('ERROR', this.colors.red, message, data));
  }

  debug(message, data = null) {
    console.log(this.formatMessage('DEBUG', this.colors.magenta, message, data));
  }

  event(message, data = null) {
    console.log(this.formatMessage('EVENT', this.colors.cyan, message, data));
  }

  login(username) {
    const { green, bright, reset, cyan } = this.colors;
    console.log(this.formatMessage('LOGIN', green, `Authenticated as ${cyan}${bright}${username}${reset}`));
  }

  auth(message, data = null) {
    console.log(this.formatMessage('AUTH', this.colors.magenta, message, data));
  }

  network(method, endpoint) {
    const { dim, blue, reset } = this.colors;
    console.log(this.formatMessage('API', blue, `${method} ${dim}${endpoint}${reset}`));
  }

  rateLimit(retryAfter) {
    const { red, yellow, bright, reset } = this.colors;
    console.warn(this.formatMessage('RATE LIMIT', red, `Rate limited! Retry after: ${yellow}${bright}${retryAfter}${reset}`));
  }

  session(message) {
    console.log(this.formatMessage('SESSION', this.colors.green, message));
  }

  message(from, preview) {
    const { cyan, bright, dim, reset } = this.colors;
    const shortPreview = preview.length > 50 ? preview.substring(0, 50) + '...' : preview;
    console.log(this.formatMessage('MESSAGE', cyan, `From ${bright}${from}${reset} › ${dim}${shortPreview}${reset}`));
  }

  custom(level, color, message, data = null) {
    const colorCode = this.colors[color] || this.colors.white;
    console.log(this.formatMessage(level, colorCode, message, data));
  }
}

export default new Logger();

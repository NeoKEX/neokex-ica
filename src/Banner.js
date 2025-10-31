class Banner {
  constructor() {
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
    };
  }

  show(version = '1.0.0', methods = []) {
    const { cyan, green, yellow, blue, magenta, bright, dim, reset } = this.colors;
    
    console.log('');
    console.log(`${cyan}${bright}╔══════════════════════════════════════════════════════════════╗${reset}`);
    console.log(`${cyan}${bright}║${reset}                                                              ${cyan}${bright}║${reset}`);
    console.log(`${cyan}${bright}║${reset}   ${green}${bright}█▄ █ █▀▀ █▀█ █▄▀ █▀▀ ▀▄▀     █ █▀▀ ▄▀█${reset}                    ${cyan}${bright}║${reset}`);
    console.log(`${cyan}${bright}║${reset}   ${green}${bright}█ ▀█ ██▄ █▄█ █ █ ██▄ █ █  ▄  █ █▄▄ █▀█${reset}                    ${cyan}${bright}║${reset}`);
    console.log(`${cyan}${bright}║${reset}                                                              ${cyan}${bright}║${reset}`);
    console.log(`${cyan}${bright}║${reset}   ${yellow}Instagram Chat API${reset} ${dim}v${version}${reset}                              ${cyan}${bright}║${reset}`);
    console.log(`${cyan}${bright}║${reset}   ${dim}Professional Instagram automation & messaging API${reset}        ${cyan}${bright}║${reset}`);
    console.log(`${cyan}${bright}║${reset}                                                              ${cyan}${bright}║${reset}`);
    console.log(`${cyan}${bright}╠══════════════════════════════════════════════════════════════╣${reset}`);
    console.log(`${cyan}${bright}║${reset}  ${blue}${bright}📦 Package Info${reset}                                             ${cyan}${bright}║${reset}`);
    console.log(`${cyan}${bright}║${reset}     ${dim}├─${reset} Name:        ${green}neokex-ica${reset}                                ${cyan}${bright}║${reset}`);
    console.log(`${cyan}${bright}║${reset}     ${dim}├─${reset} License:     ${yellow}MIT${reset}                                     ${cyan}${bright}║${reset}`);
    console.log(`${cyan}${bright}║${reset}     ${dim}├─${reset} Node.js:     ${magenta}>=16.0.0${reset}                                ${cyan}${bright}║${reset}`);
    console.log(`${cyan}${bright}║${reset}     ${dim}└─${reset} Methods:     ${cyan}${methods.length} available${reset}                       ${cyan}${bright}║${reset}`);
    console.log(`${cyan}${bright}║${reset}                                                              ${cyan}${bright}║${reset}`);
    console.log(`${cyan}${bright}║${reset}  ${blue}${bright}✨ Features${reset}                                                ${cyan}${bright}║${reset}`);
    console.log(`${cyan}${bright}║${reset}     ${green}✓${reset} Direct messaging & group chats                        ${cyan}${bright}║${reset}`);
    console.log(`${cyan}${bright}║${reset}     ${green}✓${reset} Real-time message listening                           ${cyan}${bright}║${reset}`);
    console.log(`${cyan}${bright}║${reset}     ${green}✓${reset} Media sharing (photos, videos, voice notes)           ${cyan}${bright}║${reset}`);
    console.log(`${cyan}${bright}║${reset}     ${green}✓${reset} Cookie-based authentication                           ${cyan}${bright}║${reset}`);
    console.log(`${cyan}${bright}║${reset}     ${green}✓${reset} Professional error handling                           ${cyan}${bright}║${reset}`);
    console.log(`${cyan}${bright}║${reset}                                                              ${cyan}${bright}║${reset}`);
    console.log(`${cyan}${bright}╚══════════════════════════════════════════════════════════════╝${reset}`);
    console.log('');
  }

  showSimple(version = '1.0.0') {
    const { cyan, green, yellow, bright, dim, reset } = this.colors;
    
    console.log('');
    console.log(`${cyan}${bright}┌────────────────────────────────────────────┐${reset}`);
    console.log(`${cyan}${bright}│${reset}  ${green}${bright}NEOKEX-ICA${reset} ${dim}Instagram Chat API${reset}      ${cyan}${bright}│${reset}`);
    console.log(`${cyan}${bright}│${reset}  ${yellow}v${version}${reset} • ${green}Ready${reset}                        ${cyan}${bright}│${reset}`);
    console.log(`${cyan}${bright}└────────────────────────────────────────────┘${reset}`);
    console.log('');
  }

  showVerification(packageName, version, methods) {
    const { cyan, green, yellow, blue, magenta, bright, dim, reset } = this.colors;
    
    console.log('');
    console.log(`${cyan}${bright}═══════════════════════════════════════════════════════════${reset}`);
    console.log(`  ${green}${bright}neokex-ica${reset} ${dim}Instagram Chat API Library${reset}`);
    console.log(`${cyan}${bright}═══════════════════════════════════════════════════════════${reset}`);
    console.log(`${green}✓${reset} Package verified successfully!`);
    console.log('');
    console.log(`${blue}${bright}📦 Package Information:${reset}`);
    console.log(`   ${dim}•${reset} Name:       ${green}${packageName}${reset}`);
    console.log(`   ${dim}•${reset} Version:    ${yellow}${version}${reset}`);
    console.log(`   ${dim}•${reset} License:    ${cyan}MIT${reset}`);
    console.log(`   ${dim}•${reset} Node.js:    ${magenta}>=16.0.0${reset}`);
    console.log('');
    console.log(`${blue}${bright}🔧 Available Methods:${reset} ${cyan}${methods.length} total${reset}`);
    console.log(`   ${dim}${this.wrapMethods(methods, 3)}${reset}`);
    console.log('');
    console.log(`${blue}${bright}📖 Documentation:${reset} See README.md for complete API reference`);
    console.log(`${cyan}${bright}═══════════════════════════════════════════════════════════${reset}`);
    console.log('');
  }

  wrapMethods(methods, columns = 3) {
    const lines = [];
    for (let i = 0; i < methods.length; i += columns) {
      const chunk = methods.slice(i, i + columns);
      lines.push(chunk.map(m => m.padEnd(20)).join(''));
    }
    return lines.join('\n   ');
  }
}

export default new Banner();

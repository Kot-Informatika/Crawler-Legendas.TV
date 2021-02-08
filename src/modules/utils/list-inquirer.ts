const readline = require('readline');
const chalk = require('chalk');

function spawnListLogger(title:string, data: Array<string>){
    readline.emitKeypressEvents(process.stdin);
    process.stdin.setRawMode(true);
    const limit = 3;
    let offset=0;
    const wholeLength = Math.max(title.length +2, 50);
    const halfLength = ((wholeLength) / 2)-1;

    const logger ={
        print(){
            console.clear();
            console.log(`+${'-'.repeat(wholeLength)}+`);
            console.log(`| ${chalk.white.bgBlack(title)}${' '.repeat(wholeLength - title.length -1 )}|`);
            console.log(`+${'-'.repeat(wholeLength)}+`);
            if(offset > 0){
                console.log(`+${' '.repeat(halfLength)}${chalk.green('/\\ k')}${' '.repeat(halfLength-2)}+`);
            }else{
                console.log(`+${' '.repeat(wholeLength)}+`);
            }
            for(let i=offset; i< offset+limit; ++i) {
            const splitContent = data[i].split('\t');
                if (splitContent) {
                    let count = 0;
                    for (const content of splitContent) {
                        if(count++ > 0){
                            console.log(` ${content}`);
                        }else {
                            console.log(` ${chalk.black.bgWhite(i + 1)}) ${content}`);
                        }
                    }
                } else {
                    console.log(` ${chalk.black.bgWhite(i + 1)}) ${data[i]}`);
                }
                console.log();
            }
            if(limit+offset < data.length) {
                console.log(`+${' '.repeat(halfLength)}${chalk.green('\\/ j')}${' '.repeat(halfLength-2)}+`);
            }else{
                console.log(`+${' '.repeat(wholeLength)}+`);
            }
            console.log(`+${'-'.repeat(wholeLength)}+`);
            console.log(chalk.red(`\nCtrl+c - exit`));
        },
        next(){
            offset = Math.min(data.length-limit, offset+1);
            this.print();
        },
        previous(){
            offset = Math.max(0, offset-1);
            this.print();
        }
    }


    process.stdin.on('keypress', (str, key) => {
        if (key.ctrl && key.name === 'c') {
            process.exit();
        } else {
            if (str === 'j') {
                logger.next();
            }
            if(str === 'k'){
                logger.previous();
            }
        }
    });

    return logger;
}

export default spawnListLogger;

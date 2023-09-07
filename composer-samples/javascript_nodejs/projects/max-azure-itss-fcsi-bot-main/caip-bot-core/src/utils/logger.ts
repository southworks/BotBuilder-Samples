export class Logger {
  private readonly namespace: string;
  public info: (msg?: any, ...optionalParams: any[]) => void;
  public error: (msg?: any, ...optionalParams: any[]) => void;
  public debug: (msg?: any, ...optionalParams: any[]) => void;
  private readonly logLevel = process.env.CAIP_BOT_CORE_LOG_LEVEL || 'ERROR';
  private readonly configLogLevel = this.getLogLevel(this.logLevel);
  
  constructor(filename: string, ...namespaces: string[]) {
    const source = filename.split("/").pop();
    this.namespace = namespaces.reduce((fullName, name) => `${fullName}:${name}`, source);

    this.info = this.logger("INFO");
    this.error = this.logger("ERROR");
    this.debug = this.logger("DEBUG");
  }

  logger(level: "INFO" | "ERROR" | "DEBUG") {
    return (msg?: any, ...optionalParams: any[]) => {      
      const consoleAdapter = this.getConsoleAdapter(level, this.configLogLevel);
      if(consoleAdapter){
        const logMessage = `${this.namespace}: ${msg}`;
        optionalParams.length === 0 ? consoleAdapter(logMessage) : consoleAdapter(logMessage, optionalParams);
      }
    };
  }

  getConsoleAdapter(level:string, configLogLevel: number) {
    if (level === "DEBUG" && configLogLevel >= 3) {
      return console.debug;
    }

    if (level === "INFO" && configLogLevel >= 2) {
      return console.info;
    }

    if (level === "ERROR" && configLogLevel >= 1) {
      return console.error;
    }

    return null;
  }

  getLogLevel(logLevel: string){
    return logLevel === 'DEBUG' ? 3 : logLevel === 'INFO' ? 2 : 1;
  }
}

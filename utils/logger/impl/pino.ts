import { pino } from "pino";

import { useLogStore } from "../log-store";

const customWrite = (logObj: any) => {
  try {
    const logStore = useLogStore.getState();

    const getLevelName = (level: number) => {
      switch (level) {
        case 10:
          return "trace";
        case 20:
          return "debug";
        case 30:
          return "info";
        case 40:
          return "warn";
        case 50:
          return "error";
        case 60:
          return "fatal";
        default:
          return "unknown";
      }
    };

    logStore.addLog({
      timestamp: new Date(logObj.time || Date.now()),
      level: getLevelName(logObj.level),
      message: logObj.msg || "No message",
      data: { ...logObj },
      env: logObj.env,
      error: logObj.error || logObj.err,
    });
  } catch (e) {
    console.error("Failed to process log:", e);
  }

  console.log(logObj);
};

/**
 * @name Logger
 * @description A logger implementation using Pino
 */
const Logger = pino({
  browser: {
    asObject: true,
    write: customWrite,
  },
  level: "debug",
  base: {
    env: process.env.NODE_ENV,
  },
  errorKey: "error",
});

export { Logger };

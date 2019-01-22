const { promisify } = require('util');
const { existsSync } = require('fs');
const exec = promisify(require('child_process').exec);

const FILE_RUBY_TCP_LISTEN = 'lsof -iTCP -sTCP:LISTEN | grep ruby';
const getCwdLine = pid => `lsof -p ${pid} | grep cwd`;
// `ps -ef | grep puma | awk '$8=="puma" {print $2}'`

exports.findRubyServerPid = async () => {
  try {
    const { stdout: pidLine } = await exec(FILE_RUBY_TCP_LISTEN);
    return pidLine ? pidLine.split(/\s+/, 3)[1] : null;
  } catch (_e) {
    return null;
  }
};

exports.findRailsLogPath = async ({ pid, mode = 'development' }) => {
  try {
    const { stdout: cwdLine } = await exec(getCwdLine(pid));
    if (!cwdLine) return null;

    const cwd = cwdLine.split(/\s+/, 10)[8];
    const logPath = `${cwd}/log/${mode}.log`;
    if (!existsSync(logPath)) return null;

    return logPath;
  } catch (_e) {
    return null;
  }
};

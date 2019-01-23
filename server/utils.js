const { promisify } = require('util');
const { existsSync } = require('fs');
const exec = promisify(require('child_process').exec);

const getRubyServicePid = port => `lsof -i:${port} | grep ruby`; // awk '{print $2}'
const getCwdLine = pid => `lsof -p ${pid} | grep cwd`; // awk '{print $9}'
// `ps -ef | grep puma | awk '$8=="puma" {print $2}'`

exports.findRubyServerPid = async ({ port = 3000 }) => {
  try {
    const { stdout: pidLine } = await exec(getRubyServicePid(port));
    return pidLine ? pidLine.split(/\s+/, 3)[1] : null;
  } catch (_e) {
    return null;
  }
};

exports.findRailsLogPath = async ({ pid, mode = 'development' }) => {
  try {
    const { stdout: cwdLine } = await exec(getCwdLine(pid));
    if (!cwdLine) return null;

    const cwd = cwdLine.split(/\s+/, 9)[8];
    const logPath = `${cwd}/log/${mode}.log`;
    if (!existsSync(logPath)) return null;

    return logPath;
  } catch (_e) {
    return null;
  }
};

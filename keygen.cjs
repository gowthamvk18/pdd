const { execSync } = require('child_process');
const os = require('os');
const path = require('path');
const fs = require('fs');

const sshDir = path.join(os.homedir(), '.ssh');
if (!fs.existsSync(sshDir)) fs.mkdirSync(sshDir);

const keyPath = path.join(sshDir, 'id_rsa');
if (fs.existsSync(keyPath)) fs.unlinkSync(keyPath);
if (fs.existsSync(keyPath + '.pub')) fs.unlinkSync(keyPath + '.pub');

try {
  execSync(`ssh-keygen -t rsa -b 2048 -N "" -f "${keyPath}"`);
  console.log("Key generated successfully!");
} catch (e) {
  console.error("Failed:", e.message);
}

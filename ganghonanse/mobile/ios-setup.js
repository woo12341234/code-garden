// After `cap add/sync ios`: app icon, hidden status bar, every orientation.
const fs = require('fs');
const path = require('path');

const app = path.join(__dirname, 'ios', 'App', 'App');
const iconSet = path.join(app, 'Assets.xcassets', 'AppIcon.appiconset');
const icon = path.resolve(__dirname, '..', 'assets', 'app', 'icon-1024.png');
for (const f of fs.readdirSync(iconSet)) if (f.endsWith('.png')) fs.copyFileSync(icon, path.join(iconSet, f));

const plistPath = path.join(app, 'Info.plist');
let plist = fs.readFileSync(plistPath, 'utf8');
const add = (key, xml) => {
  if (!plist.includes(`<key>${key}</key>`)) plist = plist.replace(/<\/dict>\s*<\/plist>\s*$/, `\t<key>${key}</key>\n\t${xml}\n</dict>\n</plist>\n`);
};
add('UIStatusBarHidden', '<true/>');
add('UIViewControllerBasedStatusBarAppearance', '<false/>');
add('UIRequiresFullScreen', '<true/>');
fs.writeFileSync(plistPath, plist);
console.log('ios project customised');

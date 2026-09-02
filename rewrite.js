const fs = require('fs');

const pnpm = fs.readFileSync('pnpm-workspace.yaml', 'utf8');
const catalogMatch = pnpm.split('catalog:')[1].split('autoInstallPeers:')[0];
const catalog = {};
for (const line of catalogMatch.split('\n')) {
  const t = line.trim();
  if (t && !t.startsWith('#')) {
    let [key, val] = t.split(/:(.*)/);
    if (key && val) {
      key = key.trim().replace(/^'|'$/g, '');
      val = val.trim();
      catalog[key] = val;
    }
  }
}
console.log("Catalog:", catalog);

const pkgFiles = [
  'package.json',
  ...fs.readdirSync('artifacts').map(d => `artifacts/${d}/package.json`),
  ...fs.readdirSync('lib').map(d => `lib/${d}/package.json`).filter(f => fs.existsSync(f))
];

for (const file of pkgFiles) {
  if (!fs.existsSync(file)) continue;
  const pkg = JSON.parse(fs.readFileSync(file, 'utf8'));
  for (const depType of ['dependencies', 'devDependencies', 'peerDependencies']) {
    if (pkg[depType]) {
      for (const [dep, ver] of Object.entries(pkg[depType])) {
        if (ver === 'catalog:') {
          if (!catalog[dep]) throw new Error(`Missing catalog entry for ${dep}`);
          pkg[depType][dep] = catalog[dep];
        } else if (ver === 'workspace:*') {
          pkg[depType][dep] = '*';
        }
      }
    }
  }
  // Also remove preinstall
  if (pkg.scripts && pkg.scripts.preinstall) {
    delete pkg.scripts.preinstall;
  }
  if (pkg.packageManager) {
    delete pkg.packageManager;
  }
  if (file === 'package.json') {
    pkg.workspaces = ["artifacts/*", "lib/*"];
    // Fix dev script
    pkg.scripts.dev = "npm run dev --workspace=@workspace/api-server";
  }
  fs.writeFileSync(file, JSON.stringify(pkg, null, 2) + '\n');
}

fs.unlinkSync('pnpm-workspace.yaml');
console.log('Rewritten');

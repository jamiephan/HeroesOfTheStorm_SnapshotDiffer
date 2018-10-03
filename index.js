const fs = require('fs');
const exec = require('child_process').execSync;
const SETTINGS = require('./settings');
const Snapshot = require('./snapshot');
const GameVersion = require('./game-version');
const Reddit = require('./post-reddit');
const Gett = require('./post-gett');

const snapshot = new Snapshot();
const gameversion = new GameVersion();

// Create folder if not exist
if (!fs.existsSync(SETTINGS.SNAPSHOT_SAVE_PATH)) {
  fs.mkdirSync(SETTINGS.SNAPSHOT_SAVE_PATH);
}
if (!fs.existsSync(SETTINGS.DIFF_RESULTS_SAVE_PATH)) {
  fs.mkdirSync(SETTINGS.DIFF_RESULTS_SAVE_PATH);
}

console.log('');
console.log(`Heroes of the Storm installed version: ${gameversion.installed.Version}`);
console.log(`Heroes of the Storm installed BuildID: ${gameversion.installed.BuildID}`);
console.log('');
console.log(`Heroes of the Storm Live version: ${gameversion.live.Version}`);
console.log(`Heroes of the Storm Live BuildID: ${gameversion.live.BuildID}`);

console.log('================================');

// Check if Game Up to Date
if (gameversion.live.BuildID !== gameversion.installed.BuildID) {
  console.log('Error: Both Live and install ID does not match. Please update Heroes of the Storm first!');
  console.log('Note: Please try it in US region.');
  process.exit(0);
}

console.log('Snapshots currently created:');
const snapshots = snapshot.list();

snapshots.forEach(s => {
  console.log(` >Build ${s}`);
});

console.log('================================');

// Check if installed version in snapshot
if (!snapshots.includes(gameversion.installed.BuildID)) {
  console.log('Error: Current Installed version is not in snapshot!');
  console.log('Generating snapshot for installed Heroes of the Storm.');
  snapshot.create();
} else {
  console.log('Current Installed version is in snapshot!');
}

console.log('================================');

if (parseInt(gameversion.installed.BuildID) == snapshots[0] && snapshots.length == 1) {
  console.log('Error: Only current build in snapshot. Please wait for a new patch and keep the snapshot.');
  process.exit(0);
}

const OldBuild = snapshot.latestWithout(gameversion.installed.BuildID);
const OldVersion = snapshot.latestWithout(gameversion.installed.Version);
const NewBuild = gameversion.installed.BuildID;
const NewVersion = gameversion.installed.Version;

console.log(`Comparing diff to previous snapshot version ${OldBuild}`);

console.log('================================');

const filename = SETTINGS.DIFF_RESULTS_FILENAME_TEMPLATE.replace('{{NewBuild}}', NewBuild).replace(
  '{{OldBuild}}',
  OldBuild
);

if (fs.existsSync(SETTINGS.DIFF_RESULTS_SAVE_PATH + '/' + filename)) {
  fs.unlinkSync(SETTINGS.DIFF_RESULTS_SAVE_PATH + '/' + filename);
  console.log(`Deleted Existing ${filename} file`);
  console.log('================================');
}
console.log('Running the command:');

const command = `diff -r --ignore-file-name-case ${SETTINGS.SNAPSHOT_SAVE_PATH}/snapshot-${OldBuild} ${
  SETTINGS.SNAPSHOT_SAVE_PATH
}/snapshot-${NewBuild}`;

console.log(command);

let output = '';

// What the actual fuck
try {
  exec(command, { encoding: 'utf8' });
} catch (err) {
  output = err.stdout;
}

// Trim down the output by removeing unneeded filepath
output = output.replace(new RegExp(SETTINGS.SNAPSHOT_SAVE_PATH, 'g'), '');

console.log('================================');

console.log(`Saving results to ${SETTINGS.DIFF_RESULTS_SAVE_PATH}${filename}`);

fs.writeFileSync(SETTINGS.DIFF_RESULTS_SAVE_PATH + '/' + filename, output, { encoding: 'utf8' });

console.log('================================');

console.log(`Uploading ${filename} to Ge.tt`);

diffLink = Gett(filename);

console.log('================================');

console.log('Posting to Reddit');

let str = '';
for (let i = 0; i < SETTINGS.SNAPSHOT_SAVE_EXTENSIONS.length; i++) {
  const ext = SETTINGS.SNAPSHOT_SAVE_EXTENSIONS[i];
  if (SETTINGS.SNAPSHOT_SAVE_EXTENSIONS[SETTINGS.SNAPSHOT_SAVE_EXTENSIONS.length - 1] == ext) {
    str += 'and "\\*.' + ext + '"';
  } else {
    if (SETTINGS.SNAPSHOT_SAVE_EXTENSIONS[SETTINGS.SNAPSHOT_SAVE_EXTENSIONS.length - 2] == ext) {
      str += '"\\*.' + ext + '" ';
    } else {
      str += '"\\*.' + ext + '", ';
    }
  }
}

Reddit({
  NewBuild,
  NewVersion,
  OldBuild,
  OldVersion,
  diffLink,
  extraLink: 'http://extralink',
  removedLink: 'http://removedlink',
  exts: str,
});

console.log('================================');
console.log('All done :)');

// Reddit account
// heroesdiffer@gmail.com
// heroesdiff
// heroesdiffer123

const stormExtract = require('storm-extract');
const fs = require('fs');
const rimraf = require('rimraf');
const request = require('sync-request');
const exec = require('child_process').exec;

// const path = process.argv[2];
const path = '/mnt/d/Program Files/Heroes of the Storm/';
if (path == undefined) {
  throw 'Please specify the path for Heroes Of The Storm installation folder: npm run xml /path/to/hots';
}

// Create Folder / save path as variable
if (!fs.existsSync(__dirname + '/diff')) {
  fs.mkdirSync(__dirname + '/diff');
}
const diffpath = fs.realpathSync(__dirname + '/diff');
// Get a list of Builds Snapshot
// Filter out folder name start with snaphtop-*
const snapshotsPath = fs.readdirSync(diffpath).filter(l => /^snapshot\-/s.test(l));
const snapshots = fs
  .readdirSync(diffpath)
  .filter(l => /^snapshot\-/s.test(l))
  .map(l => parseInt(l.replace('snapshot-', '')));
console.log('Saved Snapshots:');
snapshotsPath.forEach(f => {
  console.log(f.replace('snapshot-', '> Build '));
});

// Get installed version
console.log('');
console.log('Getting the installed version:');
const installedVersion = fs
  .readFileSync(path + '.build.info', {
    encoding: 'utf8',
  })
  .split('\n')
  .map(l => (/^us/s.test(l) ? l : undefined))
  .filter(l => !!l)[0]
  .split('|')[12];
const buildFileName = fs
  .readFileSync(path + '.build.info', {
    encoding: 'utf8',
  })
  .split('\n')
  .map(l => (/^us/s.test(l) ? l : undefined))
  .filter(l => !!l)[0]
  .split('|')[2];
const installedBuildID = fs
  .readFileSync(
    `${path}HeroesData/config/${buildFileName.substring(0, 2)}/${buildFileName.substring(2, 4)}/${buildFileName}`,
    {
      encoding: 'utf8',
    }
  )
  .split('\n')
  .map(l => (/^build\-name/s.test(l) ? l : undefined))
  .filter(l => !!l)[0]
  .split('B')[1];
console.log('> The installed version is: ' + installedVersion);
console.log('> The installed build ID  is: ' + installedBuildID);

console.log('');
console.log('Getting the current live version:');
const liveConfig = request('GET', 'http://us.patch.battle.net:1119/hero/versions').getBody('utf8');
const liveVersion = liveConfig
  .split('\n')
  .map(l => (/^us/s.test(l) ? l : undefined))
  .filter(l => !!l)[0]
  .split('|')[5];
const liveBuildID = liveConfig
  .split('\n')
  .map(l => (/^us/s.test(l) ? l : undefined))
  .filter(l => !!l)[0]
  .split('|')[4];

console.log('> The live version is: ' + liveVersion);
console.log('> The live build ID is: ' + liveBuildID);
console.log('');
//Does installed version in snapshot?
if (!snapshots.includes(parseInt(installedBuildID))) {
  console.log('Error: Current Installed version is not in snapshot!');
  console.log('Generating snapshot.');
  generateSnapshot(diffpath, path);
} else {
  console.log('Current Installed version is in snapshot!');
}

console.log('');

if (liveBuildID !== installedBuildID) {
  console.log('Error: Both Live and install ID does not match. Please update Heroes of the Storm first!');
  // process.exit(0);
}

if (parseInt(installedBuildID) == snapshots[0] && snapshots.length == 1) {
  console.log(
    'Error: Only current build in snapshot. Please manually fetch old version, or wait for new patch for diff.'
  );
  process.exit(0);
}

const snapshotsExcludeInstalled = snapshots.filter(b => b !== parseInt(installedBuildID));
const previousLatestBuild = Math.max.apply(null, snapshotsExcludeInstalled);
console.log(`Comparing diff to previous latest version ${previousLatestBuild}`);
if (fs.existsSync(`${__dirname}/diff_${installedBuildID}_${previousLatestBuild}.txt`)) {
  fs.unlinkSync(`${__dirname}/diff_${installedBuildID}_${previousLatestBuild}.txt`);
  console.log(`Deleted Existing ${__dirname} diff_${installedBuildID}_${previousLatestBuild}.txt file`);
}
console.log(
  `>diff -r --ignore-file-name-case ${diffpath}/snapshot-${previousLatestBuild} ${diffpath}/snapshot-${installedBuildID} >> ${fs.realpathSync(
    __dirname + '/'
  )}/diff_${installedBuildID}_${previousLatestBuild}.txt`
);
exec(
  `diff -r --ignore-file-name-case ${diffpath}/snapshot-${previousLatestBuild} ${diffpath}/snapshot-${installedBuildID} >> ${fs.realpathSync(
    __dirname + '/'
  )}/diff_${installedBuildID}_${previousLatestBuild}.txt`,
  () => {
    console.log('Done');
    console.log(" ")
    console.log("Uploading to file.io")
    var yourscript = exec(`curl -F "file=@diff_${installedBuildID}_${previousLatestBuild}.txt" https://file.io/?expires=9999y`,
        (error, stdout, stderr) => {
            const json = JSON.parse(stdout)
            if(json.success){
              console.log("> " + json.link)
              generateRedditCode(json.link, installedBuildID, previousLatestBuild)
            } else {
              console.log(json);
            }
            



            if (error !== null) {
                console.log(`exec error: ${error}`);
            }
        });







  }
);

function generateSnapshot(outputPath, inputPath) {
  // Temp path clearing
  if (fs.existsSync(__dirname + '/difftemp/')) {
    rimraf.sync(fs.realpathSync(__dirname + '/difftemp/'));
  }
  fs.mkdirSync(__dirname + '/difftemp/');
  const tempPath = fs.realpathSync(__dirname + '/difftemp/');

  // Get the build ID
  console.log('Getting the build id');
  const buildFile = ['mods/core.stormmod/base.stormdata/buildid.txt'];
  stormExtract.extractFiles(inputPath, tempPath, buildFile);
  const buildFileContent = fs.readFileSync(tempPath + '/' + buildFile, { encoding: 'utf8' });
  const buildID = parseInt(buildFileContent.replace('B', ''));
  console.log('> ' + buildID);

  console.log('Searching for .xml, .galaxy, .txt, .StormLayout files. This may take a long time.');
  var aFiles = stormExtract.listFiles(path);
  aFiles = aFiles
    .map(l => (/mods.*?.(xml|galaxy|txt|stormlayout)$/s.test(l.toLowerCase()) ? l : undefined))
    .filter(l => !!l);
  console.log(' ->done');
  console.log('');
  console.log('Extracting .xml, .galaxy, .txt, .StormLayout files to snapshot-' + buildID);
  fs.mkdirSync(outputPath + '/snapshot-' + buildID);
  stormExtract.extractFiles(path, outputPath + '/snapshot-' + buildID, aFiles);
  console.log(' ->done');
  console.log('');
  console.log('Deleting Temp Directory');
  rimraf.sync(tempPath);
  console.log(' ->done');
}

function generateRedditCode(link, newbuild, oldbuild){
  console.log("");
  console.log("");
  console.log("===== Reddit Post =====")
  console.log("");
  console.log("Title: ");
  console.log(`[Test] Heroes Differ: Build ${newbuild} <--> Build ${oldbuild}`);
  console.log("");
  console.log("");
  console.log("Body: ");
  console.log(`
\\[Test\\] Heroes Diff between Patch Build 68778 and Build 68509

**Full diff can be found here: ${link}**

---

^(I am a bot to generate diffs after each Heroes of the Storm Patch to the previous version.)

^(Source is not available yet due to messy code.)

^(*Please contact /u/jamiephan if this bot is doing some crazy stuff.*)
    `);
}

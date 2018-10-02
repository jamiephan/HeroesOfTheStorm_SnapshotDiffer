const fs = require('fs');
const rimraf = require('rimraf');
const stormExtract = require('storm-extract');
const SETTINGS = require('./settings');

class Snapshot {
  constructor() {
    if (fs.existsSync(__dirname + '/_difftemp/')) {
      rimraf.sync(fs.realpathSync(__dirname + '/_difftemp/'));
    }
    fs.mkdirSync(__dirname + '/_difftemp/');
    this.tempdir = fs.realpathSync(__dirname + '/_difftemp/');
    this.buildFile = ['mods/core.stormmod/base.stormdata/buildid.txt'];
    this.ShowOutput = true;
  }
  set setShowOutput(bool) {
    this.ShowOutput = bool;
  }
  create() {
    const log = this.ShowOutput ? console.log : () => {};

    // Get the build ID
    log('Getting the Build ID');
    stormExtract.extractFiles(SETTINGS.HEROES_OF_THE_STORM_INSTALLATION_PATH, this.tempdir, this.buildFile);
    this.buildID = parseInt(
      fs
        .readFileSync(this.tempdir + '/' + this.buildFile[0], {
          encoding: 'utf8',
        })
        .replace('B', '')
    );
    log('> The build ID is: ' + this.buildID);
    log('');

    // List all the files
    log('Searching for files with the following extensions: (This may take a while.)');
    SETTINGS.SNAPSHOT_SAVE_EXTENSIONS.forEach(ext => {
      log(` *.${ext}`);
    });
    // Build a regex
    let regex = '';
    for (let i = 0; i < SETTINGS.SNAPSHOT_SAVE_EXTENSIONS.length; i++) {
      const ext = SETTINGS.SNAPSHOT_SAVE_EXTENSIONS[i];
      if (SETTINGS.SNAPSHOT_SAVE_EXTENSIONS[SETTINGS.SNAPSHOT_SAVE_EXTENSIONS.length - 1] !== ext) {
        regex += `${ext}|`;
      } else {
        regex += ext;
      }
    }
    regex = new RegExp(`mods.*?.(${regex})$`, 'i');
    const files = stormExtract.listFiles(SETTINGS.HEROES_OF_THE_STORM_INSTALLATION_PATH);
    this.setsnapshotFullFilesList = files;
    this.setsnapshotFilteredFilesList = files.filter(f => regex.test(f.toLowerCase()));
    log(` Done.`);
    log(' Note: Access the filtered list of file path via "getsnapshotFilteredFilesList " method.');
    log(' Note: Access the whole list of file path via "getsnapshotFullFilesList " method.');
    log('');

    //Extract the files from above
    log('Extracting the files with the following extensions: (This may take a while.)');
    SETTINGS.SNAPSHOT_SAVE_EXTENSIONS.forEach(ext => {
      log(` *.${ext}`);
    });
    stormExtract.extractFiles(
      SETTINGS.HEROES_OF_THE_STORM_INSTALLATION_PATH,
      SETTINGS.SNAPSHOT_SAVE_PATH + `/${SETTINGS.SNAPSHOT_SAVE_PREFIX}${this.buildID}`,
      this.snapshotFilteredFilesList
    );
    log(' Done.');
    log('');
    // Delete Temp dir
    log(`Deleting Temp directory ${this.tempdir}`);
    rimraf.sync(this.tempdir);
    log(' Done.');
  }
  list() {
    return fs
      .readdirSync(SETTINGS.SNAPSHOT_SAVE_PATH)
      .filter(l => new RegExp(`^${SETTINGS.SNAPSHOT_SAVE_PREFIX}`, 's').test(l))
      .map(l => parseInt(l.replace(SETTINGS.SNAPSHOT_SAVE_PREFIX, '')));
  }
  latestWithout(excludeBuild) {
    let builds = this.list();
    builds = builds.filter(b => b !== excludeBuild);
    return Math.max.apply(null, builds);
  }
  set setsnapshotFullFilesList(value) {
    this.snapshotFullFilesList = value;
  }
  set setsnapshotFilteredFilesList(value) {
    this.snapshotFilteredFilesList = value;
  }
  get getsnapshotFullFilesList() {
    return this.snapshotFullFilesList;
  }
  get getsnapshotFilteredFilesList() {
    return this.snapshotFilteredFilesList;
  }
}

module.exports = Snapshot;

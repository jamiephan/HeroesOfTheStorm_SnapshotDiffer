const fs = require('fs');
const request = require('sync-request');
const SETTINGS = require('./settings');

class GameVersion {
  get installed() {
    const BuildFileHash = fs
      .readFileSync(SETTINGS.HEROES_OF_THE_STORM_INSTALLATION_PATH + '/.build.info', {
        encoding: 'utf8',
      })
      .split('\n')[1]
      .split('|')[2];
    const BuildID = fs
      .readFileSync(
        SETTINGS.HEROES_OF_THE_STORM_INSTALLATION_PATH +
          `/HeroesData/config/${BuildFileHash.slice(0, 2)}/${BuildFileHash.slice(2, 4)}/${BuildFileHash}`,
        { encoding: 'utf8' }
      )
      .split('\n')
      .filter(l => /^build-name/i.test(l))[0]
      .split('=')[1]
      .replace(' B', '');
    const Version = fs
      .readFileSync(SETTINGS.HEROES_OF_THE_STORM_INSTALLATION_PATH + '/.build.info', {
        encoding: 'utf8',
      })
      .split('\n')[1]
      .split('|')[12];
    return {
      Version, //This is not reliable but whatever
      BuildID: parseInt(BuildID),
    };
  }

  get live() {
    const configFile = request('GET', 'http://us.patch.battle.net:1119/hero/versions').getBody('utf8');
    const Version = configFile
      .split('\n')
      .map(l => (/^us/s.test(l) ? l : undefined))
      .filter(l => !!l)[0]
      .split('|')[5];
    const BuildID = configFile
      .split('\n')
      .map(l => (/^us/s.test(l) ? l : undefined))
      .filter(l => !!l)[0]
      .split('|')[4];
    return {
      Version,
      BuildID: parseInt(BuildID),
    };
  }
}

module.exports = GameVersion;

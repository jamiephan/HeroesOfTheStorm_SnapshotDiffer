const exec = require('child_process').execSync;
const SETTINGS = require('./settings');

module.exports = filename => {
  // Get Acces Token
  const accesstoken = JSON.parse(
    exec(
      `curl -sX POST -H "Content-Type: application/json" --data '{"apiKey":"${SETTINGS.GETT_APIKEY}","email":"${
        SETTINGS.GETT_EMAIL
      }","password":"${SETTINGS.GETT_PASSWORD}"}' http://api.ge.tt/1/users/login`,
      { encoding: 'utf8' }
    )
  ).accesstoken;

  // Create a share
  const sharename = JSON.parse(
    exec(
      `curl -sX POST -H "Content-Type: application/json" --data '{"title": "${filename}"}' http://api.ge.tt/1/shares/create?accesstoken=${accesstoken}`,
      {
        encoding: 'utf8',
      }
    )
  ).sharename;

  // Create file in share
  const postlink = JSON.parse(
    exec(
      `curl -sX POST -H "Content-Type: application/json" --data '{"filename": "${filename}"}' http://api.ge.tt/1/files/${sharename}/create?accesstoken=${accesstoken}`,
      {
        encoding: 'utf8',
      }
    )
  ).upload.posturl;

  // Upload the actual file
  exec(
    `curl -sH "Content-Type: application/json" --upload-file ${
      SETTINGS.DIFF_RESULTS_SAVE_PATH
    }/${filename} "${postlink}"`,
    {
      encoding: 'utf8',
    }
  );

  return `http://ge.tt/` + sharename;
};

const snoowrap = require('snoowrap');
const fs = require('fs');
const SETTINGS = require('./settings');

const reddit = new snoowrap({
  userAgent: SETTINGS.REDDIT_USERAGENT,
  clientId: SETTINGS.REDDIT_CLIENT_ID,
  clientSecret: SETTINGS.REDDIT_CLIENT_SECRET,
  username: SETTINGS.REDDIT_USERNAME,
  password: SETTINGS.REDDIT_PASSWORD,
});

module.exports = data => {
  if (fs.existsSync(SETTINGS.REDDIT_POST_TEMPLATE)) {
    let text = fs.readFileSync(SETTINGS.REDDIT_POST_TEMPLATE, { encoding: 'utf8' });
    Object.keys(data).forEach(k => {
      if (typeof data[k] == 'string' || typeof data[k] == 'number') {
        text = text.replace(new RegExp(`{{${k}}}`, 'g'), data[k]);
      }
    });
    let title = SETTINGS.REDDIT_POST_TITLE_TEMPLATE;
    Object.keys(data).forEach(k => {
      if (typeof data[k] == 'string' || typeof data[k] == 'number') {
        title = title.replace(new RegExp(`{{${k}}}`, 'g'), data[k]);
      }
    });
    reddit
      .getSubreddit(SETTINGS.REDDIT_SUBREDDIT)
      .submitSelfpost({ title, text })
      .distinguish();
  } else {
    throw 'Please create a reddit template first: reddit-post.template';
  }
};

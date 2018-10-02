const snoowrap = require('snoowrap');
const fs = require('fs');
const reddit = new snoowrap({
  userAgent: 'Heroes Differ 1.0 by /u/jamiephan',
  clientId: 'q3abVx8A8N7A8A',
  clientSecret: 'wWg2WFWNHSUrcOo-aui3djaEoYs',
  username: 'heroesdiff',
  password: 'heroesdiffer123',
});

module.exports = (data, subreddit = 'heroesdiff') => {
  if (fs.existsSync(__dirname + '/reddit-post.template')) {
    let template = fs.readFileSync(__dirname + '/reddit-post.template', { encoding: 'utf8' });
    Object.keys(data).forEach(k => {
      if (typeof data[k] == 'string') {
        template = template.replace(new RegExp(`{{${k}}}`, 'g'), data[k]);
      }
    });
    reddit
      .getSubreddit(subreddit)
      .submitSelfpost({
        title: `[Test Post] Heroes Differ: Build ${data['NewBuild']} <--> Build ${data['OldBuild']}`,
        text: template,
      })
      .distinguish();
  } else {
    throw 'Please create a reddit template first: reddit-post.template';
  }
};

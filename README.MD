# HeroesSnapshotDiffer

**HeroesSnapshotDiffer** is a tool to generate snapshots of different versions of Heroes of the Storm's files, as well as generate a [diff](https://en.wikipedia.org/wiki/Diff) and upload the results to Reddit.

## TODO:

- <input type="checkbox" name="TODO6"><label for="TODO6"><b>Better Error Handling and checks.</b></label>
- <input type="checkbox" name="TODO1"><label for="TODO1">Add support to compare specific builds, rather just new one.</label>
- <input type="checkbox" name="TODO2"><label for="TODO2">Restructure the whole project that allow to get required by other projects.</label>
- <input type="checkbox" name="TODO3"><label for="TODO3">Change all the functions and stuff to async/promise.</label>
- <input type="checkbox" name="TODO4"><label for="TODO4">Add Babel to transpile ES6 to ES5 for older Nodejs versions.</label>
- <input type="checkbox" name="TODO5"><label for="TODO5">Compare file counts and list as well (different list of files).</label>

# Prerequisite

- `Nodejs (//TODO: add version)`
- `node-gyp`
- `diff` command installed and added to `$PATH`
- `curl` command installed and added to `$PATH`
- Prefer Linux system since `storm-extract` act wired on Windows systems.

# Installation and Execution

    git clone https://github.com/jamiephan/HeroesSnapshotDiffer.git
    cd HeroesSnapshotDiffer
    npm intall
    npm start

# Configuation

**Important: Please rename `settings.template.js` to `settings.js` first, otherwise the whole project will not work.**

You can configure the `settings.js` with your account settings. This project will use both [Reddit](http://www.reddit.com) and [Ge.tt](http://ge.tt/) for posting and uploading service.

Both of these service requires an API key, you may obtain them from these locations (After login and *create/add app*):

 - https://www.reddit.com/prefs/apps/

 - http://ge.tt/developers/create


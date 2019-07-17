const gulp = require('gulp');
const fs = require('fs');
const less = require('gulp-less');
const rename = require('gulp-rename');
const path = require("path");
const exec = require('child_process').exec;
const through2 = require('through2');

const notifierPath = path.resolve(__dirname, "utils/notify");
const lessDir = 'src/styles'
const wxmlDir = 'src/templates'

function middlelizeKey(key, ignoreFirst = false) {
  let out = [];
  let i = 0;
  let lowerCasedStr = key.toString().toLowerCase();
  while (i < key.length) {
    if (key[i] !== lowerCasedStr[i]) {
      if (!ignoreFirst || i !== 0) {
        out.push("-");
        out.push(lowerCasedStr[i]);
        i++;
        continue;
      }
    }
    out.push(key[i].toLocaleLowerCase());
    i++;
  }
  return out.join("");
}

function notify(msg) {
  exec(notifierPath + ` \"${msg}\"!`);
}

function watchCompile() {
  gulp.watch(lessDir + '/**/*.less', ['compile-less']);
  gulp.watch(wxmlDir + '/**/*.wxml', ['compile-wxml']);
}
gulp.task('watch-compile', watchCompile);

function ignoreFolders(folders) {
  var folderPaths = (function () {
    var i, len, results;
    results = [];
    for (i = 0, len = folders.length; i < len; i++) {
      f = folders[i];
      results.push("/" + f + "/");
    }
    return results;
  })();
  return through2.obj(function (file, enc, callback) {
    var i, len;
    var path = "/" + file.path.replace(file.base, "");
    for (i = 0, len = folderPaths.length; i < len; i++) {
      f = folderPaths[i];
      if (path.indexOf(f) !== -1) {
        return callback();
      }
    }
    this.push(file);
    return callback();
  });
};

function compileLess() {
  return gulp.src(lessDir + "/**/*.less")
    .pipe(ignoreFolders(["partials"]))
    .pipe(less())
    .on('error', function (e) {
      console.error('\n', e.message, '\n');
      notify("Less Compile Error! please check terminal ouput");
      this.emit('end');
    })
    .pipe(rename({ extname: '.wxss' }))
    .pipe(gulp.dest("wxapp/")).on('end', function () {
      notify("all less compiled");
    })
}
gulp.task('compile-less', compileLess)

function compileWxml() {
  return gulp.src(wxmlDir + "/**/*.wxml")
    .pipe(gulp.dest("wxapp/"))
}
gulp.task('compile-wxml', compileWxml)

gulp.task('default', [
  'compile-wxml', 'compile-less',
  'watch-compile'
]);

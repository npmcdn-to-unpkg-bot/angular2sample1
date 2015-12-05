'use strict';

const gulp = require('gulp');
const ts = require('gulp-typescript');
const plumber = require('gulp-plumber');
const babel = require('gulp-babel');
const nodemon = require('gulp-nodemon');
//const filter = require('gulp-filter')
const browserSync = require('browser-sync').create();
const ignore = require('gulp-ignore');

/////////////////////////////////////////////////////////////////////////
// TypeScript Compile

gulp.task('tscES5', () => {
  const tsProject = ts.createProject('tsconfig.json', { noExternalResolve: true });
  tsProject.src()
  //.pipe(plumber())
    .pipe(ignore.exclude(['src/**/*.ts', '**/*.d.ts', 'node_modules/**/*.*', 'typings/**/*.*']))
    .pipe(ignore.include(['*.ts']))
    .pipe(ts(tsProject))
    .pipe(babel({
      presets: ['es2015']
    }))
    .pipe(gulp.dest('.'));
});

gulp.task('tscES6', () => {
  const tsProject = ts.createProject('tsconfig.json', { noExternalResolve: true });
  tsProject.src()
  //.pipe(plumber())
    .pipe(ignore.exclude(['*.ts', '**/*.d.ts', 'node_modules/**/*.*', 'typings/**/*.*']))
    .pipe(ignore.include(['src/**/*.ts']))
    .pipe(ts(tsProject))
  .pipe(babel({
    presets: ['es2015']
  }))
    .pipe(gulp.dest('.'));
});

gulp.task('tsc', () => {
  const tsProject = ts.createProject('tsconfig.json', { noExternalResolve: true });
  tsProject.src()
    .pipe(plumber())
    .pipe(ignore.exclude(['**/*.d.ts', 'node_modules/**/*.*', 'typings/**/*.*']))
    .pipe(ignore.include(['*.ts', 'src/**/*.ts']))
    .pipe(ts(tsProject))
    .pipe(babel({
      presets: ['es2015']
    }))
    .pipe(gulp.dest('.'));
});

gulp.task('compile', ['tsc']);

gulp.task('watch', () => {
  gulp.watch(['*.ts', 'src/**/*.ts'], ['tsc']);
});

/////////////////////////////////////////////////////////////////////////
// EXPRESS

function reload() {
  browserSync.reload({ stream: false });
};

gulp.task('browsersync', function () {
  browserSync.init({
    files: ['src/**/*.*'], // BrowserSyncにまかせるファイル群
    proxy: 'http://localhost:3000',  // express の動作するポートにプロキシ
    port: 4000,  // BrowserSync は 4000 番ポートで起動
    open: true,  // ブラウザ open しない
    reloadDelay: 1000 * 2,
    //reloadDebounce: 1000 * 10,
    ghostMode: false
  });
});

gulp.task('express', ['browsersync'], function () {
  nodemon({
    script: 'express.js',
    ext: 'js html css',
    ignore: [  // nodemon で監視しないディレクトリ
      'node_modules',
      'typings',
      'src',
    ],
    env: {
      'NODE_ENV': 'development'
    },
    stdout: false  // Express の再起動時のログを監視するため
  }).on('readable', function () {
    this.stdout.on('data', function (chunk) {
      if (/^Express\ server\ listening/.test(chunk)) {
        // Express の再起動が完了したら、reload() でBrowserSync に通知。
        // ※Express で出力する起動時のメッセージに合わせて比較文字列は修正
        reload();
      }
      process.stdout.write(chunk);
    });
    this.stderr.on('data', function (chunk) {
      process.stderr.write(chunk);
    });
  });
});

gulp.task('ex', ['compile', 'express', 'watch']);

/////////////////////////////////////////////////////////////////////////
// ELECTRON

gulp.task('electron', () => {
  const electron = require('electron-prebuilt');
  const proc = require('child_process');
  proc.spawn(electron, ['main.js']);
});

gulp.task('el', ['compile', 'electron', 'watch']);
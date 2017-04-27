/*jshint -W069,-W097*/
"use strict";

// In case you seem to have trouble starting Mendix through `gulp modeler`, you might have to set the path to the Mendix application, otherwise leave both values as they are
const MODELER_PATH = null;
const MODELER_ARGS = "/file:{path}";

/********************************************************************************
 * Do not edit anything below, unless you know what you are doing
 ********************************************************************************/
const gulp = require("gulp");
const zip = require("gulp-zip");
const del = require("del");
const gutil = require("gulp-util");
const gulpif = require("gulp-if");
const sequence = require('gulp-sequence');
const jsonTransform = require("gulp-json-transform");
const intercept = require("gulp-intercept");
const argv = require("yargs").argv;
const widgetBuilderHelper = require("widgetbuilder-gulp-helper");
const path = require('path');

const webpack = require("webpack");
const webpackConfig = require("./webpack.config");
const webpackConfigRelease = {};

let plugins = webpackConfig.plugins.slice(0);
plugins.push(new webpack.optimize.UglifyJsPlugin({
    //compress: true
}));

Object.assign(webpackConfigRelease, webpackConfig, {
    devtool: false,
    plugins: plugins
});

const pkg = require("./package.json"),
      currentFolder = require('shelljs').pwd().toString(),
      relPath = (...folder) =>
        path.join.apply(this, folder[0].indexOf('.') === 0 ?
        [currentFolder].concat(folder) : folder);

const paths = {
    WATCH_DIST: relPath('./dist/tmp/src/**/*'),
    SRC_FOLDER: relPath('./src/**/*'),
    DIST_TMP_SRCFILES: relPath('./dist/tmp/src/'),
    DIST_MPK_FOLDER: relPath(`./dist/${pkg.version}/`),
    DIST_MPK_FILE: relPath(`./dist/${pkg.version}/${pkg.widget.name}.mpk`),
    DIST_WIDGET_FOLDER: relPath(pkg.widget.testproject, 'widgets/'),
    DIST_DEPLOYMENT_FOLDER: relPath(pkg.widget.testproject, 'deployment/web/widgets'),
    PACKAGE_XML: relPath('./src/package.xml')
};

const runWebPack = (config, cb) => {
    webpack(config, (err, stats) => {
        if(err) throw new gutil.PluginError("webpack", err);
        gutil.log("[webpack]", stats.toString({
            chunks: false,
            colors: true
        }));
        cb();
    });
};

const compress = () => gulp.src(paths.WATCH_DIST)
    .pipe(zip(pkg.widget.name + ".mpk"))
    .pipe(gulp.dest(paths.DIST_MPK_FOLDER))
    .pipe(gulp.dest(paths.DIST_WIDGET_FOLDER));

gulp.task("default", ['webpack:develop'], () => {
    gulp.watch(paths.SRC_FOLDER, ['webpack:develop', 'copy:src']);
    gulp.watch(paths.WATCH_DIST, ['copy:deployment']);
});

gulp.task('copy:src', [], () => gulp.src([
        paths.SRC_FOLDER,
        `!${paths.SRC_FOLDER}.ts`,
        `!${paths.SRC_FOLDER}.css`
    ], { nodir: true })
    .pipe(gulp.dest(paths.DIST_TMP_SRCFILES)));

gulp.task('copy:deployment', [], () => gulp.src(paths.WATCH_DIST)
    .pipe(gulp.dest(paths.DIST_DEPLOYMENT_FOLDER)));

gulp.task('webpack:develop', [], (done) => { runWebPack(webpackConfig, done); });
gulp.task('webpack:release', [], (done) => { runWebPack(webpackConfigRelease, done); });

gulp.task("clean", () => del([
        paths.DIST_TMP_SRCFILES,
        paths.DIST_MPK_FILE
    ], { force: true }));

gulp.task('compress', compress);

gulp.task("version:xml", () =>
    gulp.src(paths.PACKAGE_XML)
        .pipe(widgetBuilderHelper.xmlversion(argv.n))
        .pipe(gulp.dest("./src/")));

gulp.task("version:json", () =>
    gulp.src("./package.json")
        .pipe(gulpif(typeof argv.n !== "undefined", jsonTransform(function(data) {
            data.version = argv.n;
            return data;
        }, 2)))
        .pipe(gulp.dest("./")));

gulp.task("icon", (cb) => {
    const icon = (typeof argv.file !== "undefined") ? argv.file : "./icon.png";
    console.log("\nUsing this file to create a base64 string: " + gutil.colors.cyan(icon));
    gulp.src(icon)
        .pipe(intercept((file) => {
            console.log("\nCopy the following to your " + pkg.widget.name + ".xml (after description):\n\n" + gutil.colors.cyan("<icon>") + file.contents.toString("base64") + gutil.colors.cyan("<\/icon>") + "\n");
            cb();
        }));
});

gulp.task("paths", (done) => {
    gutil.log(`\n\n${JSON.stringify(paths, null, 4).replace(/\\\\/g, '\\')}\n`);
    done();
});

gulp.task("modeler", (cb) => {
    widgetBuilderHelper.runmodeler(
        MODELER_PATH, MODELER_ARGS,
        relPath(pkg.widget.testproject, pkg.widget.projectMPR),
    cb);
});

gulp.task("build", sequence('clean', ['webpack:release', 'copy:src'], 'compress'));
gulp.task("version", ["version:xml", "version:json"]);

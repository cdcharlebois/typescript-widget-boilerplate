"use strict";

const webpackConfig = require("./webpack.config");
const webpackConfigRelease = {};
Object.assign(webpackConfigRelease, webpackConfig, {
    devtool: false
});

module.exports = function (grunt) {
    var pkg = grunt.file.readJSON("package.json");
    grunt.initConfig({

        watch: {
            updateWidgetFiles: {
                files: [ "./dist/tmp/src/**/*" ],
                tasks: [ "webpack:develop", "compress:dist", "copy:distDeployment", "copy:mpk" ],
                options: {
                    debounceDelay: 250,
                    livereload: true
                }
            },
            sourceFiles: {
                files: [ "./src/**/*" ],
                tasks: [ "copy:source" ]
            }
        },

        compress: {
            dist: {
                options: {
                    archive: "./dist/" + pkg.version + "/" + pkg.widget.name + ".mpk",
                    mode: "zip"
                },
                files: [ {
                    expand: true,
                    date: new Date(),
                    store: false,
                    cwd: "./dist/tmp/src",
                    src: [ "**/*" ]
                } ]
            }
        },

        copy: {
            distDeployment: {
                files: [ {
                    dest: pkg.widget.testproject + "deployment/web/widgets",
                    cwd: "./dist/tmp/src/",
                    src: [ "**/*" ],
                    expand: true
                } ]
            },
            mpk: {
                files: [ {
                    dest: pkg.widget.testproject + "widgets",
                    cwd: "./dist/" + pkg.version + "/",
                    src: [ pkg.widget.name + ".mpk" ],
                    expand: true
                } ]
            },
            source: {
                files: [ {
                    dest: "./dist/tmp/src",
                    cwd: "./src/",
                    src: [ "**/*", "!**/*.ts", "!**/*.css" ],
                    expand: true
                } ]
            }
        },

        webpack: {
            develop: webpackConfig,
            release: webpackConfigRelease
        },

        clean: {
            build: [
                "./dist/" + pkg.version + "/" + pkg.widget.name + "/*",
                "./dist/tmp/**/*",
                pkg.widget.testproject + "deployment/web/widgets/" + pkg.widget.name + "/*",
                pkg.widget.testproject + "widgets/" + pkg.widget.name + ".mpk"
            ]
        },

        checkDependencies: {
            this: {}
        }
    });

    grunt.loadNpmTasks("grunt-check-dependencies");
    grunt.loadNpmTasks("grunt-contrib-clean");
    grunt.loadNpmTasks("grunt-contrib-compress");
    grunt.loadNpmTasks("grunt-contrib-copy");
    grunt.loadNpmTasks("grunt-contrib-watch");
    grunt.loadNpmTasks("grunt-webpack");

    grunt.registerTask("default", [ "clean build", "watch" ]);
    grunt.registerTask(
        "clean build",
        "Compiles all the assets and copies the files to the dist directory.",
        [ "checkDependencies", "clean:build", "webpack:develop", "compress:dist", "copy:mpk" ]
    );
    grunt.registerTask(
        "release",
        "Compiles all the assets and copies the files to the dist directory. Minified without source mapping",
        [ "checkDependencies", "clean:build", "webpack:release", "compress:dist", "copy:mpk" ]
    );
    grunt.registerTask("build", [ "clean build" ]);
};

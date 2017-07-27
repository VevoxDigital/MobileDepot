'use strict'

const DATE = new Date()
const pkg = require('./package.json')

const SRC_DIR = 'src'
const COMPILE_DIR = '.tmp/target'

const buildFiles = {
  babel: { expand: true, cwd: SRC_DIR, src: [ '**/*.js' ], dest: COMPILE_DIR },
  browserify: { },
  package: { }
}
buildFiles.browserify[COMPILE_DIR + '/index.js'] = [ COMPILE_DIR + '/**/*.js' ]
buildFiles.package[COMPILE_DIR + '/package.json'] = [ 'package.json' ]

exports = module.exports = grunt => {
  grunt.initConfig({
    // settings
    app: pkg,
    time: DATE.toUTCString(),
    year: DATE.getFullYear(),

    // -----------------------------
    // JavaScript compilation
    babel: {
      // Compiles ES2015 (ES6) into browser-supported "regular" js, then minifies
      es2015: {
        options: {
          presets: [ 'es2015', 'babili' ]
        },
        files: [ buildFiles.babel ]
      }
    },

    browserify: {
      options: {
        external: [ 'jquery' ]
      },
      // compile all common files into one file
      target: {
        files: buildFiles.browserify
      }
    },

    // -----------------------------
    // HTML Pre-parsing
    pug: {
      build: {
        options: {
          data: {
            app: pkg,
            buildDate: DATE
          }
        },
        files: [
          { expand: true, cwd: 'res/view', src: [ '*.pug' ], dest: COMPILE_DIR, ext: '.html' }
        ]
      }
    },

    // -----------------------------
    // CSS Pre-parsing
    sass: {
      options: {
        outputStyle: 'compressed'
      },
      build: {
        files: [
          { expand: true, cwd: 'res', src: 'style/**/*.scss', dest: COMPILE_DIR, ext: '.css' }
        ]
      }
    },

    // -----------------------------
    // Misc
    clean: {
      tmp: [ '.tmp/' ],
      browserify: [ COMPILE_DIR ],
      target: [ 'target/' ],
      www: [ 'target/www' ]
    },

    copy: {
      resources: {
        files: [
          { expand: true, cwd: 'res', src: [ 'asset/**' ], dest: COMPILE_DIR }
        ]
      },
      target: {
        files: {
          'target/package.json': 'package.json',
          'target/www/package.json': 'package.json',
          'target/config.xml': 'config.xml'
        }
      }
    },

    move: {
      www: {
        dest: 'target/www',
        src: COMPILE_DIR
      }
    },

    shell: {
      install: {
        command: 'cd target && npm i --production --prefix ./www && cordova prepare'
      }
    }
  })

  grunt.loadNpmTasks('grunt-babel')
  grunt.loadNpmTasks('grunt-browserify')
  grunt.loadNpmTasks('grunt-contrib-clean')
  grunt.loadNpmTasks('grunt-contrib-copy')
  grunt.loadNpmTasks('grunt-contrib-pug')
  grunt.loadNpmTasks('grunt-move')
  grunt.loadNpmTasks('grunt-sass')
  grunt.loadNpmTasks('grunt-shell')

  grunt.registerTask('compile', [
    'pug:build',
    'sass:build',
    'copy:resources',
    'babel:es2015',
    'browserify:target',
    'clean:www',
    'move:www',
    'copy:target',
    'shell:install'
  ])
  grunt.registerTask('prepare', [
    'clean:target',
    'compile',
    'clean:tmp'
  ])
}

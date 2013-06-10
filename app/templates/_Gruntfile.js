'use strict';

module.exports = function(grunt) {
  // Project configuration.
  grunt.initConfig({
    // Metadata.
    pkg: grunt.file.readJSON('package.json'),
    banner: '',
    // Task configuration.
    clean: {
      dist:{
        src: ['dist/**']
      }
    },
    concat: {
      options: {
        banner: '<%%= banner %>',
        stripBanners: true
      },
      dist: {
        src: ['dev/scripts/libs/require.min.js', '<%%= concat.dist.dest %>'],
        dest: 'dist/scripts/require.js'
      },
    },
    uglify: {
      options: {
        banner: ''
      },
      dist: {
        src: '<%%= concat.dist.dest %>',
        dest: 'dist/scripts/require.min.js'
      },
    },
    qunit: {
      files: ['test/**/*.html']
    },
    jshint: {
      gruntfile: {
        options: {
          jshintrc: '.jshintrc'
        },
        src: 'Gruntfile.js'
      },
      dev: {
        options: {
          jshintrc: 'dev/scripts/.jshintrc'
        },
        src: ['dev/scripts/**/*.js']
      },
      test: {
        options: {
          jshintrc: 'test/.jshintrc'
        },
        src: ['test/**/*.js']
      },
    },
    less:{
      compile:{
        options: {
            paths: ["dev/styles/"],
            compress: true
        },
        files: [{
          expand:true, 
          cwd:'dev/styles',
          src:['**/*.less'],
          dest:'dev/styles',
          ext:'.css'
        }]
      }
    },
    watch: {
      script: {
        files: ['dev/scripts/**/*.js'],
        tasks: ['jshint:dev', 'qunit']
      },
      compass:{
        files: ['dev/styles/**/*.less'],
        tasks: ['less']
      },
      test: {
        files: 'test/**/*.js',
        tasks: ['jshint:test', 'qunit']
      }
    },
    requirejs: {
      compile:{
        options: {
          baseUrl:'dev/',
          name:'scripts/config',
          mainConfigFile: 'dev/scripts/config.js',
          out: '<%%= concat.dist.dest %>',
          optimize: 'none'
        }
      }
    },
    imagemin: {                          // Task
      dist: {                            // Target
        options: {                       // Target options
          optimizationLevel: 3
        },
        files: [{
          expand:true,
          cwd:'dev/',
          src:['**/*.png', '**/*.jpg'],
          dest:'dist/'
        }]
      }
    },
    htmlmin: {
      dist: {
        options: {
          /*removeCommentsFromCDATA: true,
          // https://github.com/yeoman/grunt-usemin/issues/44
          //collapseWhitespace: true,
          collapseBooleanAttributes: true,
          removeAttributeQuotes: true,
          removeRedundantAttributes: true,
          useShortDoctype: true,
          removeEmptyAttributes: true,
          removeOptionalTags: true*/
        },
        files: [{
          expand: true,
          cwd: 'dev',
          src: ['**/*.html', '!**/vendors/**/*.html'],
          dest: 'dist/'
        }]
      }
    },
    copy:{
      dist:{
        files:[{expand: true, cwd:'dev/', src: ['**', '!**/images/*.*', '!**/*.html', '!**/*.less', '!scripts/**/*.js', 'scripts/**/*.min.js'], dest: 'dist/'}]
      }
    },
    connect: {
      options: {
        keepalive: true,
        port: 8000
      }
    }
  });

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-qunit');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-requirejs');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-imagemin');
  grunt.loadNpmTasks('grunt-contrib-htmlmin');

  // Default task.
  grunt.registerTask('default', ['jshint', 'qunit', 'less']);
  grunt.registerTask('build', ['requirejs', 'less', 'clean:dist', 'copy:dist', 'requirejs', 'concat', 'uglify', 'imagemin:dist', 'htmlmin:dist']);
};

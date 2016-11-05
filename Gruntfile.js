module.exports = function(grunt) {

  grunt.loadNpmTasks('grunt-aws-s3');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-htmlmin');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-imagemin');
  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-prettify');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-compress');
  grunt.loadNpmTasks('grunt-concurrent');
  grunt.loadNpmTasks('grunt-shell');
  grunt.loadNpmTasks('grunt-contrib-clean');

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    //s3settings: grunt.file.readJSON('s3settingsprod.json'), //-- READS THE PROD CREDENTIALS TO DEPLOY TO PROD ---//
    s3settings: grunt.file.readJSON('s3settings.json'),

    //------- AWS -------//
    aws_s3: {
      options: {
       accessKeyId: '<%= s3settings.key %>',
        secretAccessKey: '<%= s3settings.secret %>',
        region: '<%= s3settings.region %>',
        uploadConcurrency: 5,
        downloadConcurrency: 5
      },
      img: {
        options: {
          bucket: '<%= s3settings.bucket %>',
          differential: true // Only uploads the files that have changed
        },
        files: [
          {expand: true, cwd: 'deploy/img/', src: ['**/*.{png,jpg,jpeg,JPG}'], dest: 'img/', params: {CacheControl: 'max-age=31536000, public'}},
        ]
      },
      svg: {
        options: {
          bucket: '<%= s3settings.bucket %>',
          differential: false // Only uploads the files that have changed
        },
        files: [
          {expand: true, cwd: 'deploy/img/', src: ['**/*.svg'], dest: 'img/', params: {CacheControl: 'max-age=31536000, public'}},
        ]
      },
      html: {
        options: {
          bucket: '<%= s3settings.bucket %>',
          differential: true // Only uploads the files that have changed
        },
        files: [
          //{expand: true, cwd: 'deploy/', src: ['*.html'], dest: '', params: {CacheControl: 'max-age=31536000, public', ContentEncoding: 'gzip'}},
          {expand: true, cwd: 'deploy/', src: ['*.html'], dest: '', params: {CacheControl: 'max-age=31536000, public'}},

        ]
      },
      js: {
        options: {
          bucket: '<%= s3settings.bucket %>',
          differential: true // Only uploads the files that have changed
        },
        files: [
          //{expand: true, cwd: 'deploy/', src: ['*.html'], dest: '', params: {CacheControl: 'max-age=31536000, public', ContentEncoding: 'gzip'}},
          {expand: true, cwd: 'deploy/js/', src: ['whfnp.min.js'], dest: 'js/', params: {CacheControl: 'max-age=31536000, public'}},

        ]
      },
      css: {
        options: {
          bucket: '<%= s3settings.bucket %>',
          differential: true // Only uploads the files that have changed
        },
        files: [
          //{expand: true, cwd: 'deploy/css/', src: ['**'], dest: '', params: {CacheControl: 'max-age=31536000, public', ContentEncoding: 'gzip'}},
          {expand: true, cwd: 'deploy/css/', src: ['**'], dest: 'css/', params: {CacheControl: 'max-age=31536000, public'}},

        ]
      },
      download: {
        options: {
          bucket: '<%= s3settings.bucket %>',
        },
        files: [
          {dest: '/', cwd: 'backup/', action: 'download'},
        ]
      },
    },
    //------- CSS Minify -------//
    cssmin: {
      combine: {
        files: [
          {expand: true, cwd: 'src', src: ['**/*.css'], dest: 'deploy/'},
        ]
     }
    },
    //------- HTML Minify -------//
    htmlmin: {                                     // Task
      dist: {                                      // Target
        options: {                                 // Target options
          removeComments: true,
          collapseWhitespace: true,
        },
        files: [
          {expand: true, cwd: 'src/_site', src: ['**/*.html'], dest: 'deploy/'},
        ]
      }
    },
    //------- JS Paths ------//
    jspaths: {
      src: {
        js: 'src/js/**.js'
      },
      dest: {
        jsMin: 'src/js/whfnp.min.js'
      }
    },

    //------- JS Minify ------//
    uglify: {
      options: {
        compress: {},
        mangle: true,
        sourceMap: false
      },
      target: {
        src: '<%= jspaths.src.js %>',
        dest: '<%= jspaths.dest.jsMin %>'
      }
    },
    //------- Copy -------//
   copy: {
      main: {
        files: [
          // includes files within path
          {expand: true, cwd: 'src/', src: ['css'], dest: 'deploy/', filter: 'isFile'},
          {expand: true, cwd: 'src/', src: ['js'], dest: 'deploy/', filter: 'isFile'},
        ]
      },
      img: {
        files: [
          {expand: true, cwd: 'src/img', src: ['*.{png,jpg,jpeg,svg}'], dest: 'deploy/img/', filter: 'isFile'},
        ]
      }
    },
    //------- SASS -------//
    sass: {
      dev: {
         options: {
           style: 'expanded',
           //loadPath: 'node_modules/bootstrap-sass/assets/stylesheets'
         },
       },
      dist: {
        options: {
            style: 'compressed',
            loadPath: 'node_modules/bootstrap-sass/assets/stylesheets'
        },
        files: {
          'src/css/screen.css': 'src/sass/screen.scss'
        }
      }
    },
    //------- Watch SASS -> CSS -------//
    watch: {
      sass: {
        files: 'src/sass/**/*.scss',
        tasks: ['sass:dist']
      },
      js: {
        files: 'src/js/**/*.js',
        tasks: ['js']
      }
    },
    //------- IMAGE min -------//
    imagemin: {                          // Task
      dynamic: {                         // Another target
        files: [{
          expand: true,                  // Enable dynamic expansion
          cwd: 'src/img/',                   // Src matches are relative to this path
          src: ['**/*.{png,jpg,svg,jpeg}'],   // Actual patterns to match
          dest: 'deploy/img/'                  // Destination path prefix
        }]
      }
    },
    //-------- Prettify HTML ------//
    prettify: {
      options: {
        // Task-specific options go here.
      },
      html: {
        // Target-specific file lists and/or options go here.
        expand: true,
        cwd: 'src/',
        ext: '.html',
        src: ['*.html'],
        dest: 'src/'
      }
    },
    //-------- Compress HTML ------//
    compress: {
      main: {
        options: {
          mode: 'gzip'
        },
        files: [
          {expand: true, src: ['deploy/*.html'], dest: '', ext: '.html'},
          {expand: true, src: ['deploy/css/screen.css'], dest: '', ext: '.css'},
        ]
      }
    },
    shell: {
      jekyllBuild: {
        command: 'jekyll build --source src --destination src/_site'
      },
      jekyllServe: {
        command: 'jekyll serve --source src --destination src/_site --host 0.0.0.0 --port 8080'
      }
    },
    concurrent: {
      serve: [
          'clean',
          'default',
          'watch',
          'shell:jekyllServe'
      ],
      options: {
          logConcurrentOutput: true
      }
    },
    clean: {
      build: {
        src: ['src/js/whfnp.min.js', 'src/_site'],
       },
      js: {
        src: ['src/js/whfnp.min.js'],
      },
    },
  });


    grunt.registerTask('serve', ['concurrent:serve']);
    /** DEPLOY task deployes all changes, check individual tasks above to see what they do **/
    grunt.registerTask('deploy', [ 'aws_s3:css','aws_s3:html', 'aws_s3:img', 'aws_s3:svg']);
    /** IMG task processess ALL images from src to deploy and optimizes them **/
    grunt.registerTask('img', ['imagemin', 'copy:img']);
    grunt.registerTask('js', ['clean:js', 'uglify']);
    /** DEFAULT task that compiles, minifies and copies relevant files,
    images are not copied everytime as the current once on site are gzipped.
    Images are not an asset that changes often so there is a special task to copy**/
    grunt.registerTask('default', ['sass:dist', 'copy:main', 'cssmin', 'js', 'htmlmin']);

};


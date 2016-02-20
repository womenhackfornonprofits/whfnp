module.exports = function(grunt) {

grunt.loadNpmTasks('grunt-aws-s3');
grunt.loadNpmTasks('grunt-contrib-copy');
grunt.loadNpmTasks('grunt-contrib-htmlmin');
grunt.loadNpmTasks('grunt-contrib-cssmin');
grunt.loadNpmTasks('grunt-contrib-imagemin');
grunt.loadNpmTasks('grunt-contrib-sass');
grunt.loadNpmTasks('grunt-contrib-watch');
grunt.loadNpmTasks('grunt-browser-sync');
grunt.loadNpmTasks('grunt-prettify');
grunt.loadNpmTasks('grunt-contrib-compress');

grunt.initConfig({
  pkg: grunt.file.readJSON('package.json'),
  s3settings: grunt.file.readJSON('s3settingsprod.json'),
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
        {expand: true, cwd: 'deploy/img/', src: ['**/*.{png,jpg,jpeg}'], dest: 'img/', params: {CacheControl: 'max-age=31536000, public'}},
      ]
    },
    svg: {
      options: {
        bucket: '<%= s3settings.bucket %>',
        differential: true // Only uploads the files that have changed
      },
      files: [
        {expand: true, cwd: 'deploy/img/', src: ['**/*.svg'], dest: 'img/', params: {CacheControl: 'max-age=31536000, public', ContentEncoding: 'gzip'}},
      ]
    },
    html: {
      options: {
        bucket: '<%= s3settings.bucket %>',
        differential: false // Only uploads the files that have changed
      },
      files: [
        //{expand: true, cwd: 'deploy/', src: ['*.html'], dest: '', params: {CacheControl: 'max-age=31536000, public', ContentEncoding: 'gzip'}},
        {expand: true, cwd: 'deploy/', src: ['*.html'], dest: '', params: {CacheControl: 'max-age=31536000, public'}},

      ]
    },
    css: {
      options: {
        bucket: '<%= s3settings.bucket %>',
        differential: true // Only uploads the files that have changed
      },
      files: [
        //{expand: true, cwd: 'deploy/css/', src: ['**'], dest: '', params: {CacheControl: 'max-age=31536000, public', ContentEncoding: 'gzip'}},
        {expand: true, cwd: 'deploy/css/', src: ['**'], dest: '', params: {CacheControl: 'max-age=31536000, public'}},

      ]
    },
    download: {
      options: {
        bucket: '<%= s3settings.bucket %>',
      },
      files: [
        {dest: '/', cwd: 'backup/', action: 'download'},
      ]
    }
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
        {expand: true, cwd: 'src', src: ['**/*.html'], dest: 'deploy/'},
      ]
    }
  },
  //------- Copy -------//
  copy: {
    main: {
      files: [
        // includes files within path
        {expand: true, cwd: 'src/', src: ['**'], dest: 'deploy/', filter: 'isFile'},
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
    dist: {
      files: {
        'src/css/screen.css': 'src/sass/screen.scss'
      }
    }
  },
  //------- Watch SASS -> CSS -------//
  watch: {
    css: {
      files: 'src/sass/**/*.scss',
      tasks: ['sass']
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
  //------- BrowserSync ------//
  browserSync: {
    bsFiles: {
        src : 'css/*.css'
    },
    options: {
        server: {
            baseDir: "src/"
        }
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
  }
});

  grunt.registerTask('deploy', ['default','aws_s3:css','aws_s3:html', 'aws_s3:img', 'aws_s3:svg']);
  grunt.registerTask('download', ['aws_s3:download']);
  grunt.registerTask('img', ['imagemin', 'copy:img']);
  grunt.registerTask('default', ['sass', 'copy:main', 'cssmin', 'htmlmin']);


};
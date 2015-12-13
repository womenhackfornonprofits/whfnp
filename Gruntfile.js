module.exports = function(grunt) {

grunt.loadNpmTasks('grunt-aws-s3');
grunt.loadNpmTasks('grunt-contrib-concat');
grunt.loadNpmTasks('grunt-contrib-copy');
grunt.loadNpmTasks('grunt-contrib-htmlmin');
grunt.loadNpmTasks('grunt-contrib-cssmin');
grunt.loadNpmTasks('grunt-contrib-imagemin');
grunt.loadNpmTasks('grunt-contrib-sass');



grunt.initConfig({
  pkg: grunt.file.readJSON('package.json'),
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
    live: {
      options: {
        bucket: '<%= s3settings.bucket %>',
        differential: true // Only uploads the files that have changed
      },
      files: [
        {expand: true, cwd: 'deploy/', src: ['**'], dest: ''},
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
  //------- HTML Copy -------//
  copy: {
    main: {
      files: [
        // includes files within path
        {expand: false, src: ['*.css'], dest: 'src/stylesheets/', filter: 'isFile'},
      ]
    }
  },
  //------- SASS -------//
  sass: {
    dist: {
      files: {
        'src/stylesheets/screen.css': 'src/sass/screen.scss'
      }
    }
  },
  //------- IMAGE min -------//
  imagemin: {                          // Task
    dynamic: {                         // Another target
      files: [{
        expand: true,                  // Enable dynamic expansion
        cwd: 'src/img/',                   // Src matches are relative to this path
        src: ['**/*.{png,jpg}'],   // Actual patterns to match
        dest: 'deploy/img/'                  // Destination path prefix
      }]
    }
  },
});

  grunt.registerTask('deploy', ['default','aws_s3:live']);
  grunt.registerTask('download', ['aws_s3:download']);
  grunt.registerTask('default', ['cssmin', 'htmlmin']); // not working =/


};
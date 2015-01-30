// Imports
var gulp = require('gulp'),
    ngCache = require('gulp-angular-templatecache'),
    inject = require('gulp-inject'),
    sass = require('gulp-sass'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename'),
    clean = require('gulp-clean'),
    watch = require('gulp-watch'),
    sourcemaps = require('gulp-sourcemaps'),
    mainBowerFiles = require('main-bower-files'),
    karma = require('gulp-karma'),
    browserSync = require('browser-sync'),
    reload = browserSync.reload,
    historyApiFallback = require('connect-history-api-fallback'),
    ngdocs = require('gulp-ngdocs'),
    jade = require('gulp-jade'),
    path = require('path');

// Script Variables
var eventType = 'added'; // defaults to this so that it triggers the index task on startup

// Tasks
gulp.task('default', ['deploy'], function() {
 var watcher = gulp.watch(['!src/index.html', 'src/app/**/*', 'src/demo/**/*', 'src/module/**/*', 'src/.tmp/**/*'], function (e) {
  eventType = e.type;
  gulp.start('deploy');
 });
 gulp.watch('src/bower_components/**/*', ['karma-inject']);
});

gulp.task('deploy', ['dist'], function() {
  console.log("deploying TODO: ");
});

gulp.task('index', ['html-templates'], function () {
  if ( eventType !== 'added' ) { return true; }
  var target = gulp.src('./src/index.html');
  var sources = gulp.src(['./src/app/app.js', './src/module/module.js', './src/demo/demo.js', '!./src/bower_components/**/*', '!./src/**/*.spec.js', './src/**/*.js', './src/**/*.css', 'src/.tmp/**/*'], {read: false});
  target.pipe(inject(sources, {ignorePath: 'src', addRootSlash: false }))
  .pipe(inject(gulp.src(mainBowerFiles({ filter: /^((?!(angular-mocks.js)).)*$/ }), {read: false}), {ignorePath: 'src', addRootSlash: false, name: 'bower'}))
  .pipe(gulp.dest('./src'));

});

gulp.task('karma-inject', function () {
  var sources = gulp.src(['./src/app/app.js', '!./src/bower_components/**/*', './src/**/*.js', 'src/.tmp/**/*']);

  return gulp.src('./karma.conf.js')
    .pipe(inject(gulp.src(mainBowerFiles({ filter: /.js$/ })),{starttag: '// gulp-inject:mainBowerFiles', endtag: '// gulp-inject:mainBowerFiles:end', addRootSlash: false,
      transform: function (filepath, file, i, length) {
        return '  "' + filepath + '",';
      }}))
    .pipe(gulp.dest('./'));
});

gulp.task('dist', ['index','html-templates'], function(done) {
  return gulp.src(['!src/bower_components/**/*', 'src/app/app.js', 'src/module/module.js', '!src/**/*.spec.js','!src/demo/**/*.js', 'src/**/*.js', 'src/.tmp/*.js', 'src/module/**/*.js'])
    .pipe(concat('<%= config.get("name") %>.js'))
    .pipe(gulp.dest('dist'))
    .pipe(uglify())
    .pipe(rename('<%= config.get("name") %>.min.js'))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('dist'));
});

gulp.task('html-templates', ['sass', 'jade-templates'], function() {
   return gulp.src([ 'src/**/*.html', '!src/index.html' ])
     .pipe(ngCache({
        filename : '.tmp/templates.js',
        module : '<%= config.get("name") %>'
      }))
     .pipe(gulp.dest('src'));
});

gulp.task('jade-templates', function() {
  return gulp.src('src/**/*.jade')
    .pipe(jade())
    .pipe(ngCache({
      filename: '.tmp/jemplates.js',
      module: '<%= config.get("name") %>'
    }))
    .pipe(gulp.dest('src'));
});

gulp.task('serve', ['deploy'], function() {
  browserSync({
    server: {
      baseDir: 'src',
      middleware: [ historyApiFallback ],
      ghostMode: {
        clicks: true,
        forms: true,
        scroll: false
      }
    }
  });

  gulp.watch(['./**/*.html', './**/*.css', './**/*.js'], {cwd: 'src'}, reload);
  gulp.start('default');
});

// ngDocs related section
// use gulp ngdocs-serve to start the ngDocs server
gulp.task('ngdocs-build', function () {
  var options = {
    //scripts: ['src/app.js'],
    html5Mode: true,
    startPage: '/api',
    title: '<%= config.get("name") %>',
    image: "http://swiip.github.io/yeoman-angular/slides/img/yeoman-009.png",
    imageLink: "/api",
    titleLink: "http://localhost:3000"
  }
  return gulp.src(['src/**/*.js', '!src/bower_components/**/*'])
    .pipe(ngdocs.process(options))
    .pipe(gulp.dest('./ngDocs'));
});

gulp.task('ngdocs-serve', ['ngdocs-build'], function() {
  browserSync({
    port: 4000,
    server: {
      baseDir: 'ngDocs',
      middleware: [ historyApiFallback ]
    }
  });
  gulp.watch(['./**/*.html'], {cwd: 'ngDocs'}, reload);
});

gulp.task('sass', function () {
  var src = 'src/**/*.scss';
  return gulp.src(src)
      .pipe(sass())
      .pipe(concat('css' + '.css'))
      .pipe(gulp.dest('src/.tmp'));
});

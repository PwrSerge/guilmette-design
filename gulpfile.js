// Load plugins
var gulp = require('gulp'),
    source         = require('vinyl-source-stream'),
    browserify     = require('browserify'),
    buffer         = require('vinyl-buffer'),
    stylish        = require('jshint-stylish'),
    browserSync    = require('browser-sync'),
    pngcrush       = require('imagemin-pngcrush'),
    svgo           = require('imagemin-svgo'),
    styleguide     = require('sc5-styleguide'),
    mainBowerFiles = require('main-bower-files'),
    gulpFilter     = require('gulp-filter'),
    runSequence    = require('run-sequence'),
    sass           = require('gulp-ruby-sass'),
    gutil          = require('gulp-load-utils')(['colors', 'env', 'log', 'pipeline', 'lazypipe']),
    gp             = require('gulp-load-plugins')({
    pattern: ['gulp-*', 'gulp.*'],
    replaceString: /\bgulp[\-.]/
});

/* ==========================================================================
   CONFIGS
   ========================================================================== */

/*
   Paths
   ========================================================================== */

var paths = {
    scr: 'src',
    dest: 'dist',
    scripts: {
        src: 'src/scripts/**/*.js',
        dest: 'dist/scripts'
    },
    styles: {
        src: 'src/stylesheets/*.scss',
        dest: 'dist/css'
    },
    image: {
        src: ['src/image/*.png', 'src/image/*.jpg'],
        dest: 'dist/image'
    },
    html: {
        src: 'src/*.html',
        dest: 'dist/'
    }
};

/*
   fileinclude
   ========================================================================== */
var fileincludecfg = {
    prefix: '@@',
    basepath: '@file'
};

/*
   Baner
   ========================================================================== */
var packg = require('./package.json');
var banner = ['/**',
    ' * <%= packg.name %> - <%= packg.description %>',
    ' * @version v<%= packg.version %>',
    ' * @link <%= packg.homepage %>',
    ' * @license <%= packg.license %>',
    ' */',
    ''
].join('\n');

/*
   lazypipe tasks using gulp-load-utils
   ========================================================================== */
var sassTasks = gutil.lazypipe()

     .pipe(gp.autoprefixer, 'last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4')
    .pipe(gp.cssbeautify, {
        indent: '  ',
        openbrace: 'end-of-line',
        autosemicolon: true
    })
    .pipe(gp.uncss, ({
        html: ['src/index.html'],
        ignore: ['[class~="nav-"]', '[class~="inner-"]', '[class~="header-"]', '.inner-wrapper.open', '.nav-main.open', '.nav-main.nav-activated', '.inner-wrapper.nav-activated']
    }));


var cssminTasks = gutil.lazypipe()
    .pipe(gp.rename, {
        //basename: 'main',
        suffix: '.min'
    })
    .pipe(gp.minifyCss);
        //.pipe(gp.sourcemaps,  'write()');

var jsminTasks = gutil.lazypipe()
    .pipe(gp.rename, {
        suffix: '.min'
    })
    .pipe(gp.uglify);


/*
   Sass config
   ========================================================================== */
var sassconfig = function sassconfig (Container) {
   return {
            //style: 'expanded',
            container: Container,
            sourcemap: true,
            trace: true,
            quiet: true,
            lineNumbers: false,
            compass: true,
            require: ['susy', 'modular-scale', 'breakpoint']
        }
    };

/*
   Notify config
   ========================================================================== */
  var notifyconfig = function notifyconfig (Title,Message) {
   return {
     title: (gutil.colors.cyan.bold(Title)),
     message: (gutil.colors.green.bold(Message))
    }
};

/*
   SVG symbol config
   ========================================================================== */
var svgconfig = {
    svgId: 'icon-%f',
    className: '.icon-%f',
    fontSize: 16,
    css: false,
    svgoConfig: {
        removeViewBox: false,
        cleanupIDs: false
    }
};

// gulp.task('shorthand', shell.task([
//   'echo hello',
//   'echo world'
// ]))

/* ==========================================================================
   TEMPLATE
   ========================================================================== */

//Compile to HTML
// var swig = require('gulp-swig');

// gulp.task('templates', function() {
//   gulp.src('./lib/*.html')
//     .pipe(gp.swig())
//     .pipe(gulp.dest('./dist/'))
// });

// //Get data via JSON file, keyed on filename.
// var getJsonData = function(file) {
//   return require('./examples/' + path.basename(file.path) + '.json');
// };

// gulp.task('json-test', function() {
//   return gulp.src('./examples/test1.html')
//     .pipe(data(getJsonData))
//     .pipe(swig())
//     .pipe(gulp.dest('build'));
// });


/* ==========================================================================
   BOWER
   ========================================================================== */

// grab libraries files from bower_components and push in /src
gulp.task('bower', function() {
    var jsFilter = gulpFilter('*.js');
    var cssFilter = gulpFilter(['*.css', '*.scss']);
    var fontFilter = gulpFilter(['*.eot', '*.woff', '*.svg', '*.ttf']);

    return gulp.src(mainBowerFiles({
        debugging: true
    }))

    // grab vendor js files from bower_components and push in /src
    .pipe(jsFilter)
        .pipe(gulp.dest('src/scripts/vendor'))
        .pipe(jsFilter.restore())

    // grab vendor css files from bower_components and push in /src
    .pipe(cssFilter)
        .pipe(gulp.dest('src/stylesheets/vendor'))
        .pipe(cssFilter.restore())

    // grab vendor font files from bower_components and push in /src
    .pipe(fontFilter)
        .pipe(gp.flatten())
        .pipe(gulp.dest('src/fonts'))
});

/* ==========================================================================
   STYLEGUIDE (living style guide based on KSS notation)
   ========================================================================== */
gulp.task('gs-clean', function() {
    return gulp.src('src/styleguide/*', {
            read: false
        })
        .pipe(gp.rimraf());
});

gulp.task('gs-main', function() {
    return gulp.src('src/css/main.css')
        .pipe(gp.rename('styleguide.css'))
        .pipe(gulp.dest('src/styleguide'))
});

gulp.task('gs-styleguide', function() {
    var outputPath = 'src/styleguide';
    return gulp.src('src/stylesheets/components/*.scss')
        .pipe(styleguide({
            title: 'guilmettedesign Styleguide',
            server: true,
            rootPath: outputPath,
            styleVariables: 'src/stylesheets/helpers/_vars.scss',
            overviewPath: 'src/stylesheets/overview.md',
            sass: {
                lineNumbers: false,
                compass: true,
                trace: true,
                require: ['susy', 'modular-scale', 'breakpoint']
            },
            less: {
                // Options passed to gulp-less
            }
        }))
        .pipe(gulp.dest(outputPath));
});

gulp.task('styleguide', function() {
    runSequence('gs-clean', ['styles','gs-styleguide', 'gs-main']);
});

gulp.task('styleguide-watch', ['styleguide'], function() {
    // Start watching changes and update styleguide whenever changes are detected
    // Styleguide automatically detects existing server instance
    gulp.watch(('src/stylesheets/*'), ['styleguide']);
});

/* ==========================================================================
   STYLES
   ========================================================================== */
gulp.task('sass-site', function() {
    return sass('src/stylesheets/main.scss', sassconfig('gulp-ruby-sass-site'))
        .pipe(gp.plumber())
        .pipe(sassTasks())
        .pipe(gp.rename('main.css'))
        .pipe(gulp.dest('./src/css/'))
        .pipe(cssminTasks())
        .pipe(gp.sourcemaps.write())
        .pipe(gulp.dest('./dist/css/'))
        .pipe(browserSync.reload({
            stream: true
        }))
        .pipe(gp.notify(notifyconfig('STYLES','main style task complete')))
});

gulp.task('sass-print', function() {
    return sass('src/stylesheets/print.scss', sassconfig('gulp-ruby-sass-print'))
        .pipe(gp.plumber())
        .pipe(sassTasks())
        .pipe(gp.rename('print.css'))
        .pipe(gulp.dest('./src/css/'))
        .pipe(cssminTasks())
        .pipe(gp.sourcemaps.write())
        .pipe(gulp.dest('./dist/css/'))
        .pipe(browserSync.reload({
            stream: true
        }))
        .pipe(gp.notify(notifyconfig('STYLES','print style task complete')));
});
gulp.task('sass', ['sass-site', 'sass-print']);

/* ==========================================================================
   SCRIPTS
   ========================================================================== */
var getBundleName = function() {
    var name = require('./package.json').name;
    return name + '.' + 'min';
};

gulp.task('scripts', function() {

    var bundler = browserify({
        entries: ['./src/scripts/main.js'],
        debug: true
    });

    var bundle = function() {
        return bundler
            .bundle()
            .pipe(source(getBundleName() + '.js'))
            .pipe(buffer())
            .pipe(gp.sourcemaps.init({
                loadMaps: true
            }))
            // Add transformation tasks to the pipeline here.
            .pipe(gulp.dest('./src/scripts/'))
            .pipe(gp.uglify())
            .pipe(gp.sourcemaps.write('./'))
            .pipe(gulp.dest('./dist/scripts/'))
            .pipe(gp.notify(notifyconfig('SCRIPTS','browserify task complete')));
    };

    return bundle();
});

gulp.task('modernizr', function() {
    return gulp.src('src/scripts/vendor/modernizr.js') // js that needs to be placed in the head
        .pipe(jsminTasks())
        .pipe(gulp.dest(paths.scripts.dest + '/vendor'))
        .pipe(gp.notify(notifyconfig('modernizr','modernizr task complete')));
});

/* ==========================================================================
   IMAGES
   ========================================================================== */

gulp.task('image', ['sprites'], function() {
    return gulp.src(paths.image.src)
        .pipe(gp.changed(paths.image.dest))
        .pipe(gp.plumber())
        .pipe(gp.cache(gp.imagemin({
            optimizationLevel: 3,
            progressive: true,
            use: [pngcrush()],
            interlaced: true,
        })))
        .pipe(gp.size())
        .pipe(gulp.dest(paths.image.dest))
        .pipe(browserSync.reload({
            stream: true
        }))
        .pipe(gp.notify(notifyconfig('IMAGES','Image task complete')));
});

/* ==========================================================================
   SVG SPRITES
   ========================================================================== */

gulp.task('sprites', function() {
    return gulp.src('src/image/icons/*.svg')
        .pipe(gp.plumber())
        .pipe(gp.svgSymbols(svgconfig))
        .pipe(gp.size())
        .pipe(gulp.dest('dist/image/sprites'))
        .pipe(gp.notify({
            title: (gutil.colors.green.bold('IMAGES')),
            message: (gutil.colors.green.bold('Sprites task complete'))
        }));


});
/* ==========================================================================
   HTML
   ========================================================================== */
gulp.task('html', ['sass'], function() {
    return gulp.src('src/index.html')
        //.pipe(gp.changed(paths.html.src))
        .pipe(gp.plumber())
        .pipe(gp.fileInclude(fileincludecfg))
        //modernizr injection
        .pipe(gp.inject(gulp.src('./dist/scripts/vendor/modernizr*.min.js', {
            read: false
        }), {
            starttag: '<!-- inject:head:{{ext}} -->',
            ignorePath: 'dist/',
            addRootSlash: false
        }))
        // stylesheet and main javascripts injection
        .pipe(gp.inject(gulp.src(['./dist/css/*.min.css', './dist/scripts/*.min.js'], {
            read: false
        }), {
            ignorePath: ['src/', 'dist/'],
            addRootSlash: false
        }))
        .pipe(gp.size())
        .pipe(gulp.dest('./dist'))
        .pipe(browserSync.reload({
            stream: true
        }))
        .pipe(gp.notify({
            title: (gutil.colors.cyan.bold('HTML')),
            message: (gutil.colors.green.bold('HTML task complete'))
        }));

});
/* ==========================================================================
   CLEAN
   ========================================================================== */
gulp.task('clean', function() {
    return gulp.src('./dist/*', {
            read: false
        })
        .pipe(gp.rimraf());

});
/* ==========================================================================
   AWS PUBLISH
   ========================================================================== */
gulp.task('publish', function() {

    // create a new publisher
    var publisher = gp.awspublish.create({
        key: 'AKIAJXFBVOWZJCTIBP6Q',
        secret: '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',
        bucket: 'guilmettedesign.com'
    });

    // define custom headers
    var headers = {
        'Cache-Control': 'max-age=315360000, no-transform, public'
    };

    return gulp.src('./dist/**/*')

    // gzip, Set Content-Encoding headers and add .gz extension
    .pipe(gp.awspublish.gzip())
        .pipe(gp.rename(function(path) {
            path.dirname = '/' + path.dirname;
        }))

    // publisher will add Content-Length, Content-Type and Cache-Control headers
    // and if not specified will set x-amz-acl to public-read by default
    .pipe(publisher.publish(headers))

    // create a cache file to speed up consecutive uploads
    .pipe(publisher.cache())

    //sync bucket files
    //.pipe(publisher.sync())

    // print upload updates to console
    .pipe(gp.awspublish.reporter({
        states: ['create', 'update', 'delete']
    }));
});

/* ==========================================================================
   BUMP VERSION
   ========================================================================== */
gulp.task('bump', function() {
    return gulp.src(['./package.json', './bower.json'])
        .pipe(gp.bump())
        .pipe(gulp.dest('./'));
});

/* ==========================================================================
   BROWSER_SYNC
   ========================================================================== */
gulp.task('browser-sync', function() {
    browserSync.init(null, {
        server: {
            baseDir: './dist'
        }
    });
});

/* ==========================================================================
   WATCH
   ========================================================================== */
gulp.task('watch', ['browser-sync'], function() {
    // //opens the index page in default browser
    // gulp.start('url');

    // Watch .scss files
    gulp.watch('src/stylesheets/**/*.scss', ['sass']);

    // Watch .js files
    gulp.watch('src/scripts/**/*.js', ['scripts']);

    // Watch image files
    gulp.watch('dist/image/**/*', ['image']);

    // Watch .html files
    gulp.watch('src/*.html', ['html']);


});

/* ==========================================================================
   BUILD TASK
   ========================================================================== */
gulp.task('build', function() {
    runSequence('clean', ['browserify', 'modernizr', 'scripts', 'image', 'html']);
});

/* ==========================================================================
   DEFAULT TASK
   ========================================================================== */
gulp.task('default', function() {
    runSequence('clean', ['scripts', 'image', 'html'], 'watch');
});

// Load plugins
var gulp = require('gulp'),
    stylish = require('jshint-stylish'),
    browserSync = require('browser-sync'),
    pngcrush = require('imagemin-pngcrush'),
    svgo = require('imagemin-svgo'),
    mainBowerFiles = require('main-bower-files'),
    gulpFilter = require('gulp-filter'),
    runSequence = require('run-sequence'),
    gutil = require('gulp-load-utils')(['colors', 'env', 'log', 'pipeline','lazypipe']),
    gp = require('gulp-load-plugins')({
           pattern: ['gulp-*', 'gulp.*'],
           replaceString: /\bgulp[\-.]/
    });


/*******************************************************************************
 *CONFIGS
 ******************************************************************************/

//Paths
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

//Initialize the notifier
var growlNotifier = gp.notifyGrowl({
    hostname: '127.0.0.1' // IP or Hostname to notify, default to localhost
});

// fileinclude
var fileincludecfg = {
    prefix: '@@',
    basepath: '@file'
};

//Banner
var packg = require('./package.json');
var banner = ['/**',
    ' * <%= packg.name %> - <%= packg.description %>',
    ' * @version v<%= packg.version %>',
    ' * @link <%= packg.homepage %>',
    ' * @license <%= packg.license %>',
    ' */',
    ''
].join('\n');

//lazypipe tasks using gulp-load-utils
var sassTasks = gutil.lazypipe()
   .pipe(gp.rubySass, {
        //style: 'expanded',
        //sourcemap: true,
        lineNumbers: false,
        compass: true,
        trace: true,
        require: ['susy', 'modular-scale', 'breakpoint']
    })
   .pipe(gp.autoprefixer, 'last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4')
   .pipe(gp.cssbeautify, {
        indent: '  ',
        openbrace: 'end-of-line',
        autosemicolon: true
    })
   .pipe(gp.uncss, ({
        html: ['src/index.html'],
        ignore: ['[class~="nav-"]', '[class~="inner-"]', '[class~="header-"]', '.inner-wrapper.open ', '.nav-main.open', '.nav-main.nav-activated', '.inner-wrapper.nav-activated']
    }));


var cssminTasks = gutil.lazypipe()
    .pipe(gp.rename, {
        suffix: '.min'
    })
    .pipe(gp.minifyCss);

var jsminTasks = gutil.lazypipe()
    .pipe(gp.rename, {
        suffix: '.min'
    })
    .pipe(gp.uglify);



/*******************************************************************************
 *BOWER
 ******************************************************************************/
// grab libraries files from bower_components, minify and push in /public
gulp.task('libs', function() {
    var jsFilter = gulpFilter('*.js');
    var cssFilter = gulpFilter('*.css');
    var fontFilter = gulpFilter(['*.eot', '*.woff', '*.svg', '*.ttf']);

    return gulp.src(mainBowerFiles({
        debugging: true
    }))

    // grab vendor js files from bower_components, minify and push in /public
    .pipe(jsFilter)
        .pipe(gulp.dest('src/scripts/vendor'))
    // .pipe(gp.uglify())
    // .pipe(gp.rename({
    //     suffix: ".min"
    // }))
    .pipe(gulp.dest('src/scripts/vendor'))
        .pipe(jsFilter.restore())

    // grab vendor css files from bower_components, minify and push in /public
    .pipe(cssFilter)
        .pipe(gulp.dest('src/stylesheets/vendor'))
        .pipe(cssminTasks())
        .pipe(gulp.dest('src/stylesheets/vendor'))
        .pipe(cssFilter.restore())

    // grab vendor font files from bower_components and push in /public
    .pipe(fontFilter)
        .pipe(gp.flatten())
        .pipe(gulp.dest('src/fonts'))
});

/*******************************************************************************
 *STYLES
 ******************************************************************************/

gulp.task('styles', function() {
    return gulp.src(paths.styles.src)
        //.pipe(gp.changed(paths.styles.dest))
        // .pipe(plumber(function(error) {
        //     gutil.log(gutil.colors.red(error.message));
        //     this.emit('end');
        // }))
        .pipe(gp.plumber())
        .pipe(sassTasks())
        .pipe(gulp.dest('src/css'))
        .pipe(cssminTasks())
        .pipe(gulp.dest('src/css'))
        .pipe(gulp.dest(paths.styles.dest))
        .pipe(browserSync.reload({
            stream: true
        }))
        .pipe(growlNotifier({
            title: 'STYLES.',
            message: 'Styles task complete'
        }));
});

/*******************************************************************************
 *SCRIPTS
 ******************************************************************************/
gulp.task('scripts-concat', function() {
    return gulp.src(['src/scripts/vendor/jquery.js','src/scripts/main.js','src/scripts/vendor/*.js' ,'!src/scripts/vendor/modernizr.js'])
    .pipe(gp.plumber())
    .pipe(gp.jshint())
    .pipe(gp.jshint.reporter(stylish, { verbose: true }))
    .pipe(gp.sourcemaps.init()) //  minify and concatenates vendor plugins and libraries
    .pipe(jsminTasks())
    .pipe(gp.concat('main.min.js', {newLine:'\n\n'}))
    .pipe(gp.sourcemaps.write('../scripts/maps', {
      sourceMappingURLPrefix: 'https://guilmettedesign.com'
    }))
    .pipe(gp.size())
    .pipe(gulp.dest(paths.scripts.dest))
});

gulp.task('scripts', ['scripts-concat'], function() {
    return gulp.src('src/scripts/vendor/modernizr.js')   // js that needs to be placed in the head
    .pipe(jsminTasks())
    .pipe(gulp.dest(paths.scripts.dest + '/vendor'))
    .pipe(browserSync.reload({
        stream: true,
    }))
        .pipe(growlNotifier({
            title: 'SCRIPTS.',
            message: 'Scripts task complete'
        }));
});

/*******************************************************************************
 *IMAGES
 ******************************************************************************/
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
        .pipe(growlNotifier({
            title: 'IMAGES.',
            message: 'Image task complete'
        }));
});

/*******************************************************************************
 *SVG SPRITES
 ******************************************************************************/

var config = {
    svgId: 'icon-%f',
    className: '.icon-%f',
    fontSize: 16,
    css: false,
    svgoConfig: {
        removeViewBox: false,
        cleanupIDs: false
    }
};

gulp.task('sprites', function() {
    return gulp.src('src/image/icons/*.svg')
        .pipe(gp.plumber())
        .pipe(gp.svgSymbols(config))
        .pipe(gp.size())
        .pipe(gulp.dest('src/image/sprites'))
        .pipe(gulp.dest('dist/image/sprites'))
        .pipe(growlNotifier({
            title: 'SPRITES.',
            message: 'Sprites task complete'
        }));

});

/*******************************************************************************
 *HTML
 ******************************************************************************/

gulp.task('html', ['styles'], function() {
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
        .pipe(size())
        .pipe(gulp.dest('./dist'))
        .pipe(browserSync.reload({
            stream: true
        }))
        .pipe(growlNotifier({
            title: 'HTML.',
            message: 'HTML task complete'
        }));
});

/*******************************************************************************
 *CLEAN
 ******************************************************************************/

gulp.task('clean', function() {
    return gulp.src('./dist/*', {
            read: false
        })
        .pipe(gp.rimraf());

});

/*******************************************************************************
 *AWS PUBLISH
 ******************************************************************************/

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
        // ...
    };

    return gulp.src('./dist/**/*')

    // gzip, Set Content-Encoding headers and add .gz extension
    //.pipe(awspublish.gzip({ ext: '.gz' }))

    .pipe(gp.rename(function(path) {
        path.dirname = '/' + path.dirname;
    }))

    // publisher will add Content-Length, Content-Type and Cache-Control headers
    // and if not specified will set x-amz-acl to public-read by default
    .pipe(publisher.publish(headers))

    // create a cache file to speed up consecutive uploads
    .pipe(publisher.cache())

    //sync bucket files
    // .pipe(publisher.sync())

    // print upload updates to console
    .pipe(gp.awspublish.reporter({
        states: ['create', 'update', 'delete']
    }));
});

/*******************************************************************************
 *BUMP VERSION
 ******************************************************************************/

gulp.task('bump', function() {
    return gulp.src(['./package.json', './bower.json'])
        .pipe(gp.bump())
        .pipe(gulp.dest('./'));
});


/*******************************************************************************
 *BROWSER_SYNC
 ******************************************************************************/

gulp.task('browser-sync', function() {
    browserSync.init(null, {
        server: {
            baseDir: "./dist"
        }
    });
});

/*******************************************************************************
 *WATCH
 ******************************************************************************/

gulp.task('watch', ['browser-sync'], function() {
    // //opens the index page in default browser
    // gulp.start('url');

    // Watch .scss files
    gulp.watch('src/stylesheets/**/*.scss', ['styles']);

    // Watch .js files
    gulp.watch('src/scripts/**/*.js', ['scripts']);

    // Watch image files
    gulp.watch('dist/image/**/*', ['image']);

    // Watch .html files
    gulp.watch('src/*.html', ['html']);


});

/*******************************************************************************
 * BUILD TASK
 ******************************************************************************/

gulp.task('build', function() {
    runSequence('clean', ['scripts', 'image', 'html']);
});

/*******************************************************************************
 * DEFAULT TASK
 ******************************************************************************/

gulp.task('default', function() {
    runSequence('clean', ['scripts', 'image', 'html'], 'watch');
});
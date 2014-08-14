// Load plugins
var gulp = require('gulp'),
    sass = require('gulp-ruby-sass'),
    autoprefixer = require('gulp-autoprefixer'),
    minifycss = require('gulp-minify-css'),
    uglify = require('gulp-uglify'),
    imagemin = require('gulp-imagemin'),
    jshint = require('gulp-jshint'),
    stylish = require('jshint-stylish'),
    rename = require('gulp-rename'),
    concat = require('gulp-concat'),
    clean = require('gulp-clean'),
    growl = require('gulp-notify-growl'),
    cache = require('gulp-cache'),
    changed = require('gulp-changed'),
    awspublish = require('gulp-awspublish'),
    header = require('gulp-header'),
    cssbeautify = require('gulp-cssbeautify'),
    browserSync = require('browser-sync'),
    svgSymbols = require('gulp-svg-symbols'),
    fileinclude = require('gulp-file-include'),
    svgmin = require('gulp-svgmin'),
    uncss = require('gulp-uncss'),
    pngcrush = require('imagemin-pngcrush'),
    inject = require("gulp-inject"),
    mainBowerFiles = require('main-bower-files'),
    size = require('gulp-filesize'),
    flatten = require('gulp-flatten'),
    gulpFilter = require('gulp-filter'),
    lazypipe = require('lazypipe'),
    runSequence = require('run-sequence'),
    plumber = require('gulp-plumber');




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
        src: 'src/image/**/*',
        dest: 'dist/image'
    },
    html: {
        src: 'src/*.html',
        dest: 'dist/'
    }
};

//Initialize the notifier
var growlNotifier = growl({
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

//lazypipe tasks

var sassTasks = lazypipe()
    .pipe(sass, {
        //style: 'expanded',
        //sourcemap: true,
        lineNumbers: false,
        compass: true,
        trace: true,
        require: ['susy', 'modular-scale', 'breakpoint']
    })
    .pipe(autoprefixer, 'last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4')
    .pipe(cssbeautify, {
        indent: '  ',
        openbrace: 'end-of-line',
        autosemicolon: true
    })
    .pipe(uncss, ({
        html: ['src/index.html']
    }));


var cssminTasks = lazypipe()
    .pipe(rename, {
        suffix: '.min'
    })
    .pipe(minifycss);

var jsminTasks = lazypipe()
    .pipe(jshint)
    .pipe(jshint.reporter, stylish)
    .pipe(rename, {
        suffix: '.min'
    })
    .pipe(uglify);


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
        .pipe(uglify())
        .pipe(rename({
            suffix: ".min"
        }))
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
        .pipe(flatten())
        .pipe(gulp.dest(paths.src + '/fonts'))
});

/*******************************************************************************
 *STYLES
 ******************************************************************************/

gulp.task('styles', function(cb) {
    return gulp.src(paths.styles.src)
        //.pipe(changed(paths.styles.dest))
        .pipe(plumber())
        .pipe(sassTasks())
        .pipe(gulp.dest(paths.styles.dest))
        .pipe(cssminTasks())
        .pipe(gulp.dest(paths.styles.dest))
        .pipe(growlNotifier({
            title: 'STYLES.',
            message: 'Styles task complete'
        }));
    cb(err);

});

/*******************************************************************************
 *SCRIPTS
 ******************************************************************************/

gulp.task('scripts', ['styles'], function(cb) {
    var filter = gulpFilter(['*.js', '!src/scripts/vendor']);
    return gulp.src(paths.scripts.src)
        //.pipe(changed(paths.scripts.dest))
        .pipe(filter)
        .pipe(plumber())
        .pipe(concat('main.js'))
        .pipe(header(banner, {
            packg: packg
        }))
        .pipe(jsminTasks())
        .pipe(gulp.dest(paths.scripts.dest))
        .pipe(filter.restore())
        .pipe(gulp.dest(paths.scripts.dest))
        .pipe(browserSync.reload({
            stream: true,
            once: true
        }))
        .pipe(growlNotifier({
            title: 'SCRIPTS.',
            message: 'Scripts task complete'
        }));
    cb(err);

});

/*******************************************************************************
 *IMAGES
 ******************************************************************************/

gulp.task('image', function() {
    return gulp.src(paths.image.src)
        //.pipe(changed(paths.image.dest))
        .pipe(plumber())
        .pipe(cache(imagemin({
            optimizationLevel: 3,
            progressive: true,
            svgoPlugins: [{
                removeViewBox: false
            }],
            use: [pngcrush()],
            interlaced: true
        })))
        .pipe(size())
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
};

gulp.task('sprites', function() {
    return gulp.src('src/image/icons/*.svg')
        .pipe(plumber())
        .pipe(svgSymbols(config))
        .pipe(size())
        .pipe(gulp.dest('src/image/sprites'))
        .pipe(growlNotifier({
            title: 'SPRITES.',
            message: 'Sprites task complete'
        }));

});

/*******************************************************************************
 *HTML
 ******************************************************************************/

gulp.task('html', ['scripts'], function() {
    return gulp.src('src/index.html')
        //.pipe(changed(paths.html.src))
        .pipe(plumber())
        .pipe(fileinclude(fileincludecfg))
        .pipe(inject(gulp.src('./dist/scripts/vendor/modernizr*.min.js', {
            read: false
        }), {
            starttag: '<!-- inject:head:{{ext}} -->',
            ignorePath: 'dist/',
            addRootSlash: false
        }))
        .pipe(inject(gulp.src(['./dist/css/*.min.css', './dist/scripts/**/*.min.js', './dist/css/*.min.css', '!./dist/scripts/vendor/modernizr*.min.js'], {
            read: false
        }), {
            ignorePath: 'dist/',
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

gulp.task('clean', function(cb) {
    return gulp.src(['dist/'], {
            read: false
        })
        .pipe(clean());
    cb(err);
});

/*******************************************************************************
 *AWS PUBLISH
 ******************************************************************************/

gulp.task('publish', function() {

    // create a new publisher
    var publisher = awspublish.create({
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

    .pipe(rename(function(path) {
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
    .pipe(awspublish.reporter({
        states: ['create', 'update', 'delete']
    }));
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

gulp.task('build', function(cb) {
    runSequence('clean', ['styles', 'scripts', 'image', 'html'], cb);
});

/*******************************************************************************
 * DEFAULT TASK
 ******************************************************************************/

gulp.task('default', ['build', 'watch']);
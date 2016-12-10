var gulp = require('gulp'),
    sass = require('gulp-sass'),//sass编译
    imagemin = require('gulp-imagemin'),//图片压缩
    browserSync = require('browser-sync'),//浏览器同步
    concat = require('gulp-concat'),   //合并文件
    uglify = require('gulp-uglify'),   //js压缩
    rename = require('gulp-rename'),  //文件重命名
    inject = require('gulp-inject');

var destDir = './dist';
var srcImageDir = './src/images/**';//图片目录
var imageFiles = [
    srcImageDir + '/*.jpg',
    srcImageDir + '/*.png',
    srcImageDir + '/*.gif'
];

gulp.task('default', ['develop']);

//图片压缩
gulp.task('image', function () {
    return gulp.src(imageFiles)
        .pipe(imagemin())
        .pipe(gulp.dest(destDir + '/images/'));
});

gulp.task('js', function () {
    var jsFiles = [
        './src/js/*.js',
        './src/js/utils/*.js'
    ];

    gulp.src(jsFiles)
        .pipe(concat('fireworks.min.js'))
        //.pipe(uglify())
        .pipe(gulp.dest(destDir + '/js/'));

    var libFiles = [
        './src/js/libs/**/*.*'
    ];
    return gulp.src(libFiles)
        .pipe(gulp.dest(destDir + '/js/libs'));
});

gulp.task('html', function () {
    return gulp.src('./src/**/*.html')
        .pipe(gulp.dest(destDir));
});

gulp.task('css', function () {
    return gulp.src('./src/sass/**/*.scss')
        .pipe(sass({outputStyle: 'expanded'}))//expanded 正常排版，compressed 压缩
        .pipe(concat('fireworks.min.css'))
        .pipe(gulp.dest(destDir + '/css'));
});


gulp.task('browser-sync', ['image', 'js', 'html', 'css'], function () {//注册任务
    gulp.watch("./src/sass/**/*.scss", ['css']);
    gulp.watch("./src/**/*.html", ['html']);
    gulp.watch("./src/js/**/*.js", ['js']);
    gulp.watch(imageFiles, ['image']);

    browserSync({//调用API
        files: "./dist/**/*.*",//监听dist目录
        server: {
            baseDir: "./dist"
        },
        port: 5000
    });

    gulp.watch("./dist/**/*.*").on('change', browserSync.reload);
});

gulp.task('inject', ['css', 'html', 'js', 'image'], function () {
    var target = gulp.src('./dist/*.html');
    // It's not necessary to read the files (will speed up things), we're only after their paths:
    var sources = gulp.src(['./dist/js/*.js', './dist/css/**/*.css'], {read: false, relative: true, addPrefix: './'});

    return target.pipe(inject(sources))
        .pipe(gulp.dest('./dist'));
});

//开发
gulp.task('develop', ['browser-sync']);

//发布
gulp.task('release', function () {
    //打包
});
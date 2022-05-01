import gulp from 'gulp';
import plumber from 'gulp-plumber';
import less from 'gulp-less';
import postcss from 'gulp-postcss';
import csso from 'postcss-csso';
import autoprefixer from 'autoprefixer';
import browser from 'browser-sync';
import rename from 'gulp-rename';
import htmlmin from 'gulp-htmlmin';
import squoosh from 'gulp-libsquoosh';
import svgo from 'gulp-svgmin';
import svgstore from 'gulp-svgstore';
import del from 'del';

// Styles

export const styles = () => {
  return gulp.src('source/less/style.less', { sourcemaps: true })
    .pipe(plumber())
    .pipe(less())
    .pipe(postcss([
      autoprefixer(),
      csso()
    ]))
    .pipe(rename('style.min.css'))
    .pipe(gulp.dest('build/css', { sourcemaps: '.' }))
    .pipe(browser.stream());
}

//html

const html=()=> {
  return gulp.src('source/*.html')
  .pipe(htmlmin('collapsWhitespace: true }'))
  .pipe(gulp.dest('build'));
}

//images

const optimizeImages=()=> {
  return gulp.src('source/img/*.{jpg,png}')
  .pipe(gulp.dest('build/img'));
}

const copy = (done) => {
  gulp.src([
    'source/fonts/*.{woff2,woff}',
    'source/*.ico',
  ], {
    base: 'source'
  })
    .pipe(gulp.dest('build'))
  done();
}

//WebP

const createWebp=()=> {
  return gulp.src('source/img/*{jpg,png}')
  .pipe(squoosh({
    webp: {}
  }))
  .pipe(gulp.dest('build/img'));
}
//svg

export const svg=()=> {
  return gulp.src('source/img/*.svg')
  .pipe(svgo())
  .pipe(gulp.dest('build/img'));
}
const sprite=()=> {
  return gulp.src('source/img/icons/*.svg')
  .pipe(svgo())
  .pipe(svgstore({
    inlineSvg: true
  }))
  .pipe(rename('sprite.SVG'))
  .pipe(gulp.dest('build/img'));
}
// Server

const server = (done) => {
  browser.init({
    server: {
      baseDir: 'build'
    },
    cors: true,
    notify: false,
    ui: false,
  });
  done();
}

//clean

const clean = () => {
  return del("build");
};

//reload

const reload = (done) => {
  browser.reload();
  done();
}

// Watcher

const watcher = () => {
  gulp.watch('source/less/**/*.less', gulp.series(styles));
  gulp.watch("source/*.html", gulp.series(html, reload));
}

export const build = gulp.series (
  clean,
  copy,
  optimizeImages,
  gulp.parallel (
    styles,
    html,
    svg,
    sprite,
    createWebp
  ),
)

export default gulp.series(
  build, styles, server, watcher
);

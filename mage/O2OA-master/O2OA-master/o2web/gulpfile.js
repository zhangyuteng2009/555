var gulp = require('gulp'),
    //var deleted = require('gulp-deleted');
    del = require('del'),
    //uglify = require('gulp-tm-uglify'),
    uglify = require('gulp-uglify-es').default,
    rename = require('gulp-rename'),
    changed = require('gulp-changed'),
    gulpif = require('gulp-if'),
    minimist = require('minimist'),
    ftp = require('gulp-ftp'),
    sftp = require('gulp-sftp-up4'),
    JSFtp = require('jsftp'),
    gutil = require('gulp-util'),
    fs = require("fs"),
    concat = require('gulp-concat'),
    shell = require('gulp-shell');
//let uglify = require('gulp-uglify-es').default;
var through2 = require('through2');
var path = require('path');
var nodePath = path;
//var sourceMap = require('gulp-sourcemaps');
var git = require('gulp-git');

var assetRev = require('gulp-tm-asset-rev');
var apps = require('./gulpapps.js');

var ftpconfig;
try{
    ftpconfig = require('./gulpconfig.js');
}catch(e){
    ftpconfig = {
        "dev": {
            'upload': '',
            'location': 'E:/o2server/servers/webServer/',
            'host': '',
            'user': '',
            'pass': '',
            "port": 22,
            "remotePath": "/data/o2server/servers/webServer/",
            "dest": "dest"
        }
    };
}

var supportedLanguage = ["zh-cn", "en"];

var o_options = minimist(process.argv.slice(2), {//upload: local ftp or sftp
    string: ["ev", "upload", "location", "host", "user", "pass", "port", "remotePath", "dest", "src", "lp"]
});
function getEvOptions(ev){
    options.ev = ev;
    return (ftpconfig[ev]) || {
        'location': '',
        'host': '',
        'user': '',
        'pass': '',
        "port": null,
        "remotePath": "",
        "dest": "dest",
        "upload": ""
    }
}
function setOptions(op1, op2){
    if (!op2) op2 = {};
    options.upload = op1.upload || op2.upload || "";
    options.location = op1.location || op2.location || "";
    options.host = op1.host || op2.host || "";
    options.user = op1.user || op2.user || "";
    options.pass = op1.pass || op2.pass || "";
    options.port = op1.port || op2.port || "";
    options.remotePath = op1.remotePath || op2.remotePath || "";
    options.dest = op1.dest || op2.dest || "dest";
    options.lp = op1.lp || op2.lp || "zh-cn";
    options.src = op1.src || op2.src || "";
}
var options = {};
setOptions(o_options, getEvOptions(o_options.ev));

var appTasks = [];

function createDefaultTask(path, isMin, thisOptions) {
    var pkgPath = nodePath.resolve('source', path, 'package.json');
    if (fs.existsSync(pkgPath)){
        var pkg = require(pkgPath);
        if (pkg.scripts['o2-deploy']){
            gulp.task(path, gulp.series(shell.task('npm run o2-deploy', {cwd: nodePath.resolve('source', path), verbose:true}), function(cb){
                var option = thisOptions || options;
                var dest = ['dest/' + path + '/**/*'];
                return gulp.src(dest)
                    .pipe(gulpif((option.upload == 'local' && option.location != ''), gulp.dest(option.location + path + '/')))
                    .pipe(gulpif((option.upload == 'ftp' && option.host != ''), ftp({
                        host: option.host,
                        user: option.user || 'anonymous',
                        pass: option.pass || '@anonymous',
                        port: option.port || 21,
                        remotePath: (option.remotePath || '/') + path
                    })))
                    .pipe(gulpif((option.upload == 'sftp' && option.host != ''), sftp({
                        host: option.host,
                        user: option.user || 'anonymous',
                        pass: option.pass || null,
                        port: option.port || 22,
                        remotePath: (option.remotePath || '/') + path
                    })))
                    .pipe(gutil.noop());
            }));
            return '';
        }
    }
    gulp.task(path, function (cb) {
        //var srcFile = 'source/' + path + '/**/*';
        var option = thisOptions || options;

        var src;
        var dest = option.dest+'/' + path + '/';

        let ev = option.ev
        var evList = Object.keys(ftpconfig).map((i)=>{ return (i==ev) ? "*"+i : i; });

        if (isMin){
            var src_min = ['source/' + path + '/**/*.js', '!**/*.spec.js', '!**/test/**'];
            var src_move = ['source/' + path + '/**/*', '!**/*.spec.js', '!**/test/**'];

            gutil.log("Move-Uglify", ":", gutil.colors.green(gutil.colors.blue(path), gutil.colors.white('->'), dest));

            return gulp.src(src_min)
                .pipe(changed(dest))
                .pipe(uglify())
                .pipe(rename({ extname: '.min.js' }))
                .pipe(gulpif((option.upload == 'local' && option.location != ''), gulp.dest(option.location + path + '/')))
                .pipe(gulpif((option.upload == 'ftp' && option.host != ''), ftp({
                    host: option.host,
                    user: option.user || 'anonymous',
                    pass: option.pass || '@anonymous',
                    port: option.port || 21,
                    remotePath: (option.remotePath || '/') + path
                })))
                .pipe(gulpif((option.upload == 'sftp' && option.host != ''), sftp({
                    host: option.host,
                    user: option.user || 'anonymous',
                    pass: option.pass || null,
                    port: option.port || 22,
                    remotePath: (option.remotePath || '/') + path
                })))
                .pipe(gulpif((option.ev == "dev" || option.ev == "pro") ,gulp.dest(dest)))

                .pipe(gulp.src(src_move))
                .pipe(changed(dest))
                .pipe(gulpif((option.upload == 'local' && option.location != ''), gulp.dest(option.location + path + '/')))
                .pipe(gulpif((option.upload == 'ftp' && option.host != ''), ftp({
                    host: option.host,
                    user: option.user || 'anonymous',
                    pass: option.pass || '@anonymous',
                    port: option.port || 21,
                    remotePath: (option.remotePath || '/') + path
                })))
                .pipe(gulpif((option.upload == 'sftp' && option.host != ''), sftp({
                    host: option.host,
                    user: option.user || 'anonymous',
                    pass: option.pass || null,
                    port: option.port || 22,
                    remotePath: (option.remotePath || '/') + path
                })))
                .pipe(gulp.dest(dest))
                .pipe(gutil.noop());
        }else{
            src = ['source/' + path + '/**/*', '!**/*.spec.js', '!**/test/**'];
            gutil.log("Move", ":", gutil.colors.green(gutil.colors.blue(path), gutil.colors.white('->'), dest));
            return gulp.src(src)
                .pipe(changed(dest))
                .pipe(gulpif((option.upload == 'local' && option.location != ''), gulp.dest(option.location + path + '/')))
                .pipe(gulpif((option.upload == 'ftp' && option.host != ''), ftp({
                    host: option.host,
                    user: option.user || 'anonymous',
                    pass: option.pass || '@anonymous',
                    port: option.port || 21,
                    remotePath: (option.remotePath || '/') + path
                })))
                .pipe(gulpif((option.upload == 'sftp' && option.host != ''), sftp({
                    host: option.host,
                    user: option.user || 'anonymous',
                    pass: option.pass || null,
                    port: option.port || 22,
                    remotePath: (option.remotePath || '/') + path
                })))
                .pipe(gulp.dest(dest))
                .pipe(gutil.noop());
        }
    });
}

function createXFormConcatTask(path, isMin, thisOptions) {
    gulp.task(path+" : concat", function(){
        var option = thisOptions || options;
        var src = [
            'source/o2_core/o2/widget/AttachmentController.js',
            'source/o2_core/o2/xScript/Macro.js',
            'source/o2_core/o2/widget/Tab.js',
            'source/o2_core/o2/widget/O2Identity.js',
            'source/' + path + '/Form.js',
            'source/' + path + '/$Module.js',
            'source/' + path + '/$Input.js',
            'source/' + path + '/Div.js',
            'source/' + path + '/Combox.js',
            'source/' + path + '/DatagridMobile.js',
            'source/' + path + '/DatagridPC.js',
            'source/' + path + '/DatatablePC.js',
            'source/' + path + '/DatatableMobile.js',
            'source/' + path + '/Textfield.js',
            'source/' + path + '/Personfield.js',
            'source/' + path + '/Button.js',
            'source/' + path + '/ViewSelector.js',
            'source/' + path + '/*.js',
            'source/x_component_process_Work/Processor.js',
            '!source/' + path + '/Office.js'
        ];
        var dest = option.dest+'/' + path + '/';
        return gulp.src(src, {sourcemaps: true})
            //.pipe(sourceMap.init())
            .pipe(concat('$all.js'))
            .pipe(gulpif((option.upload == 'local' && option.location != ''), gulp.dest(option.location + path + '/')))
            .pipe(gulpif((option.upload == 'ftp' && option.host != ''), ftp({
                host: option.host,
                user: option.user || 'anonymous',
                pass: option.pass || '@anonymous',
                port: option.port || 21,
                remotePath: (option.remotePath || '/') + path
            })))
            .pipe(gulpif((option.upload == 'sftp' && option.host != ''), sftp({
                host: option.host,
                user: option.user || 'anonymous',
                pass: option.pass || null,
                port: option.port || 22,
                remotePath: (option.remotePath || '/') + path
            })))
            .pipe(gulp.dest(dest))
            .pipe(concat('$all.min.js'))
            .pipe(uglify())
            //.pipe(sourceMap.write(""))
            .pipe(gulpif((option.upload == 'local' && option.location != ''), gulp.dest(option.location + path + '/')))
            .pipe(gulpif((option.upload == 'ftp' && option.host != ''), ftp({
                host: option.host,
                user: option.user || 'anonymous',
                pass: option.pass || '@anonymous',
                port: option.port || 21,
                remotePath: (option.remotePath || '/') + path
            })))
            .pipe(gulpif((option.upload == 'sftp' && option.host != ''), sftp({
                host: option.host,
                user: option.user || 'anonymous',
                pass: option.pass || null,
                port: option.port || 22,
                remotePath: (option.remotePath || '/') + path
            })))
            .pipe(gulp.dest(dest, {sourcemaps: '.'}))
    });
}

function createCMSXFormConcatTask(path, isMin, thisOptions) {
    var processPath = "x_component_process_Xform";
    gulp.task(path+" : concat", function(){
        var option = thisOptions || options;
        var src = [
            'source/o2_core/o2/widget/AttachmentController.js',
            // 'source/o2_core/o2/xScript/CMSEnvironment.js',
            'source/o2_core/o2/xScript/CMSMacro.js',
            'source/o2_core/o2/widget/Tab.js',
            'source/o2_core/o2/widget/O2Identity.js',
            'source/o2_core/o2/widget/ImageLazyLoader.js',
            'source/o2_core/o2/widget/ImageViewer.js',
            'source/' + processPath + '/Form.js',
            'source/' + processPath + '/$Module.js',
            'source/' + processPath + '/$Input.js',
            'source/' + processPath + '/Div.js',
            //'source/' + processPath + '/Combox.js',
            'source/' + processPath + '/DatagridMobile.js',
            'source/' + processPath + '/DatagridPC.js',
            'source/' + processPath + '/DatatablePC.js',
            'source/' + processPath + '/DatatableMobile.js',
            'source/' + processPath + '/Textfield.js',
            //'source/' + processPath + '/Personfield.js',
            'source/' + processPath + '/Button.js',
            //'source/' + processPath + '/ViewSelector.js',
            'source/' + processPath + '/Org.js',
            // 'source/' + processPath + '/*.js',
            'source/' + processPath + '/Actionbar.js',
            //'source/' + processPath + '/Address.js',
            'source/' + processPath + '/Attachment.js',
            'source/' + processPath + '/Calendar.js',
            'source/' + processPath + '/Checkbox.js',
            'source/' + processPath + '/Datagrid.js',
            'source/' + processPath + '/Datatable.js',
            'source/' + processPath + '/Datatemplate.js',
            'source/' + processPath + '/Htmleditor.js',
            //'source/' + processPath + '/Iframe.js',
            'source/' + processPath + '/Label.js',
            'source/' + processPath + '/Number.js',
            'source/' + processPath + '/Common.js',
            'source/' + processPath + '/Image.js',
            'source/' + processPath + '/ImageClipper.js',
            'source/' + processPath + '/WritingBoard.js',
            'source/' + processPath + '/Html.js',
            'source/' + processPath + '/Radio.js',
            'source/' + processPath + '/Select.js',
            //'source/' + processPath + '/Stat.js',
            //'source/' + processPath + '/Statement.js',
            //'source/' + processPath + '/StatementSelector.js',
            //'source/' + processPath + '/Subform.js',
            'source/' + processPath + '/Tab.js',
            'source/' + processPath + '/Table.js',
            'source/' + processPath + '/Textarea.js',
            'source/' + processPath + '/$ElModule.js',
            'source/' + processPath + '/$Elinput.js',
            'source/' + processPath + '/Elcascader.js',
            'source/' + processPath + '/Elradio.js',
            'source/' + processPath + '/Elcheckbox.js',
            'source/' + processPath + '/Elcommon.js',
            'source/' + processPath + '/Elcontainer.js',
            'source/' + processPath + '/Elicon.js',
            'source/' + processPath + '/Elinput.js',
            'source/' + processPath + '/Elnumber.js',
            'source/' + processPath + '/Elselect.js',
            'source/' + processPath + '/Elslider.js',
            'source/' + processPath + '/Elswitch.js',
            'source/' + processPath + '/Elautocomplete.js',
            'source/' + processPath + '/Elbutton.js',
            'source/' + processPath + '/Eltime.js',
            'source/' + processPath + '/Eldate.js',
            'source/' + processPath + '/Eldatetime.js',
            'source/' + processPath + '/Elrate.js',
            'source/' + processPath + '/Elcolorpicker.js',
            'source/' + processPath + '/Eltree.js',
            'source/' + processPath + '/Eldropdown.js',
            'source/' + processPath + '/Elcarousel.js',
            //'source/' + processPath + '/Tree.js',
            //'source/' + processPath + '/View.js',
            // 'source/x_component_process_Work/Processor.js',
            // '!source/' + processPath + '/Office.js'


            'source/o2_core/o2/widget/SimpleToolbar.js',
            'source/' + path + '/ModuleImplements.js',
            'source/' + path + '/Package.js',
            'source/' + path + '/Form.js',
            //'source/' + path + '/widget/Comment.js',
            'source/' + path + '/widget/Log.js',
            'source/' + path + '/Org.js',
            'source/' + path + '/Author.js',
            'source/' + path + '/Reader.js',
            'source/' + path + '/Textfield.js',
            'source/' + path + '/Actionbar.js',
            'source/' + path + '/Attachment.js',
            'source/' + path + '/Button.js',
            'source/' + path + '/Calendar.js',
            'source/' + path + '/Checkbox.js',
            'source/' + path + '/Datagrid.js',
            'source/' + path + '/Datatable.js',
            'source/' + path + '/Datatemplate.js',
            'source/' + path + '/Htmleditor.js',
            'source/' + path + '/ImageClipper.js',
            'source/' + path + '/WritingBoard.js',
            'source/' + path + '/Label.js',
            'source/' + path + '/Number.js',
            'source/' + path + '/Radio.js',
            'source/' + path + '/Select.js',
            'source/' + path + '/Tab.js',
            'source/' + path + '/Table.js',
            'source/' + path + '/Textarea.js',
            'source/' + path + '/Elcascader.js',
            'source/' + path + '/Elradio.js',
            'source/' + path + '/Elcheckbox.js',
            'source/' + path + '/Elcommon.js',
            'source/' + path + '/Elcontainer.js',
            'source/' + path + '/Elicon.js',
            'source/' + path + '/Elinput.js',
            'source/' + path + '/Elnumber.js',
            'source/' + path + '/Elselect.js',
            'source/' + path + '/Elslider.js',
            'source/' + path + '/Elswitch.js',
            'source/' + path + '/Elautocomplete.js',
            'source/' + path + '/Elbutton.js',
            'source/' + path + '/Eltime.js',
            'source/' + path + '/Eldate.js',
            'source/' + path + '/Eldatetime.js',
            'source/' + path + '/Elrate.js',
            'source/' + path + '/Elcolorpicker.js',
            'source/' + path + '/Eltree.js',
            'source/' + path + '/Eldropdown.js',
            'source/' + path + '/Elcarousel.js',

            //'source/' + path + '/Personfield.js',
            //'source/' + path + '/Readerfield.js',
            //'source/' + path + '/Authorfield.js',
            //'source/' + path + '/Orgfield.js',
            // 'source/' + path + '/*.js',
            // '!source/' + path + '/Office.js'
        ];
        var dest = option.dest+'/' + path + '/';
        return gulp.src(src, {sourcemaps: true})
            //.pipe(sourceMap.init())
            .pipe(concat('$all.js'))
            .pipe(gulpif((option.upload == 'local' && option.location != ''), gulp.dest(option.location + path + '/')))
            .pipe(gulpif((option.upload == 'ftp' && option.host != ''), ftp({
                host: option.host,
                user: option.user || 'anonymous',
                pass: option.pass || '@anonymous',
                port: option.port || 21,
                remotePath: (option.remotePath || '/') + path
            })))
            .pipe(gulpif((option.upload == 'sftp' && option.host != ''), sftp({
                host: option.host,
                user: option.user || 'anonymous',
                pass: option.pass || null,
                port: option.port || 22,
                remotePath: (option.remotePath || '/') + path
            })))
            .pipe(gulp.dest(dest))
            .pipe(concat('$all.min.js'))
            .pipe(uglify())
            //.pipe(sourceMap.write(""))
            .pipe(gulpif((option.upload == 'local' && option.location != ''), gulp.dest(option.location + path + '/')))
            .pipe(gulpif((option.upload == 'ftp' && option.host != ''), ftp({
                host: option.host,
                user: option.user || 'anonymous',
                pass: option.pass || '@anonymous',
                port: option.port || 21,
                remotePath: (option.remotePath || '/') + path
            })))
            .pipe(gulpif((option.upload == 'sftp' && option.host != ''), sftp({
                host: option.host,
                user: option.user || 'anonymous',
                pass: option.pass || null,
                port: option.port || 22,
                remotePath: (option.remotePath || '/') + path
            })))
            .pipe(gulp.dest(dest, {sourcemaps: '.'}))
    });
}

function createO2ConcatTask(path, isMin, thisOptions) {
    gulp.task(path+" : concat", function(){
        var option = thisOptions || options;
        var src = [
            'source/' + path + '/polyfill.js',
            'source/o2_lib/mootools/mootools-1.6.0_all.js',
            'source/o2_lib/mootools/plugin/mBox.js',
            'source/' + path + '/o2.js'
        ];
        var dest = option.dest+'/' + path + '/';
        return gulp.src(src, {sourcemaps: true})
            //.pipe(sourceMap.init())
            .pipe(concat('o2.js'))
            .pipe(gulpif((option.upload == 'local' && option.location != ''), gulp.dest(option.location + path + '/')))
            .pipe(gulpif((option.upload == 'ftp' && option.host != ''), ftp({
                host: option.host,
                user: option.user || 'anonymous',
                pass: option.pass || '@anonymous',
                port: option.port || 21,
                remotePath: (option.remotePath || '/') + path
            })))
            .pipe(gulpif((option.upload == 'sftp' && option.host != ''), sftp({
                host: option.host,
                user: option.user || 'anonymous',
                pass: option.pass || null,
                port: option.port || 22,
                remotePath: (option.remotePath || '/') + path
            })))
            .pipe(gulp.dest(dest))
            .pipe(concat('o2.min.js'))
            .pipe(uglify())
            //.pipe(rename({ extname: '.min.js' }))
            //.pipe(sourceMap.write(""))
            .pipe(gulpif((option.upload == 'local' && option.location != ''), gulp.dest(option.location + path + '/')))
            .pipe(gulpif((option.upload == 'ftp' && option.host != ''), ftp({
                host: option.host,
                user: option.user || 'anonymous',
                pass: option.pass || '@anonymous',
                port: option.port || 21,
                remotePath: (option.remotePath || '/') + path
            })))
            .pipe(gulpif((option.upload == 'sftp' && option.host != ''), sftp({
                host: option.host,
                user: option.user || 'anonymous',
                pass: option.pass || null,
                port: option.port || 22,
                remotePath: (option.remotePath || '/') + path
            })))
            .pipe(gulp.dest(dest, {sourcemaps: '.'}))
    });

    gulp.task(path+".xDesktop : concat", function(){
        var option = thisOptions || options;
        var src = [
            'source/'+path+'/o2/widget/Common.js',
            'source/'+path+'/o2/widget/Dialog.js',
            'source/'+path+'/o2/widget/UUID.js',
            'source/'+path+'/o2/xDesktop/Common.js',
            'source/'+path+'/o2/xDesktop/Actions/RestActions.js',
            'source/'+path+'/o2/xAction/RestActions.js',
            'source/'+path+'/o2/xDesktop/Access.js',
            'source/'+path+'/o2/xDesktop/Dialog.js',
            'source/'+path+'/o2/xDesktop/Menu.js',
            'source/'+path+'/o2/xDesktop/UserData.js',
            'source/x_component_Template/MPopupForm.js',
            'source/'+path+'/o2/xDesktop/Authentication.js',
            'source/'+path+'/o2/xDesktop/Dialog.js',
            'source/'+path+'/o2/xDesktop/Window.js',
            'source/x_component_Common/Main.js'
        ];
        var dest = option.dest+'/' + path + '/o2/xDesktop/';
        return gulp.src(src, {sourcemaps: true})
            //.pipe(sourceMap.init())
            .pipe(concat('$all.js'))
            .pipe(gulpif((option.upload == 'local' && option.location != ''), gulp.dest(option.location + path + '/o2/xDesktop/')))
            .pipe(gulpif((option.upload == 'ftp' && option.host != ''), ftp({
                host: option.host,
                user: option.user || 'anonymous',
                pass: option.pass || '@anonymous',
                port: option.port || 21,
                remotePath: (option.remotePath || '/') + path+"/o2/xDesktop/"
            })))
            .pipe(gulpif((option.upload == 'sftp' && option.host != ''), sftp({
                host: option.host,
                user: option.user || 'anonymous',
                pass: option.pass || null,
                port: option.port || 22,
                remotePath: (option.remotePath || '/') + path+"/o2/xDesktop/"
            })))
            .pipe(gulp.dest(dest))
            .pipe(concat('$all.min.js'))
            .pipe(uglify())
            //.pipe(rename({ extname: '.min.js' }))
            //.pipe(sourceMap.write(""))
            .pipe(gulpif((option.upload == 'local' && option.location != ''), gulp.dest(option.location + path + '/o2/xDesktop/')))
            .pipe(gulpif((option.upload == 'ftp' && option.host != ''), ftp({
                host: option.host,
                user: option.user || 'anonymous',
                pass: option.pass || '@anonymous',
                port: option.port || 21,
                remotePath: (option.remotePath || '/') + path+"/o2/xDesktop/"
            })))
            .pipe(gulpif((option.upload == 'sftp' && option.host != ''), sftp({
                host: option.host,
                user: option.user || 'anonymous',
                pass: option.pass || null,
                port: option.port || 22,
                remotePath: (option.remotePath || '/') + path+"/o2/xDesktop/"
            })))
            .pipe(gulp.dest(dest, {sourcemaps: '.'}))
    });

    gulp.task(path+" : bundle", function(){
        var option = thisOptions || options;
        var src = [
            'source/' + path + '/polyfill.js',
            'source/o2_lib/mootools/mootools-1.6.0_all.js',
            'source/o2_lib/mootools/plugin/mBox.js',
            'source/' + path + '/o2.js',
            'source/x_desktop/js/base.js',
            'source/x_desktop/js/base_loader.js',
            'source/o2_core/o2/xScript/PageEnvironment.js',
            "source/o2_core/o2/framework.js"
        ];
        var dest = option.dest+'/' + path + '/';
        return gulp.src(src, {sourcemaps: true})
            //.pipe(sourceMap.init())
            .pipe(concat('bundle.js'))
            .pipe(gulpif((option.upload == 'local' && option.location != ''), gulp.dest(option.location + path + '/')))
            .pipe(gulpif((option.upload == 'ftp' && option.host != ''), ftp({
                host: option.host,
                user: option.user || 'anonymous',
                pass: option.pass || '@anonymous',
                port: option.port || 21,
                remotePath: (option.remotePath || '/') + path
            })))
            .pipe(gulpif((option.upload == 'sftp' && option.host != ''), sftp({
                host: option.host,
                user: option.user || 'anonymous',
                pass: option.pass || null,
                port: option.port || 22,
                remotePath: (option.remotePath || '/') + path
            })))
            .pipe(gulp.dest(dest))
            .pipe(concat('bundle.min.js'))
            .pipe(uglify())
            //.pipe(rename({ extname: '.min.js' }))
            //.pipe(sourceMap.write(""))
            .pipe(gulpif((option.upload == 'local' && option.location != ''), gulp.dest(option.location + path + '/')))
            .pipe(gulpif((option.upload == 'ftp' && option.host != ''), ftp({
                host: option.host,
                user: option.user || 'anonymous',
                pass: option.pass || '@anonymous',
                port: option.port || 21,
                remotePath: (option.remotePath || '/') + path
            })))
            .pipe(gulpif((option.upload == 'sftp' && option.host != ''), sftp({
                host: option.host,
                user: option.user || 'anonymous',
                pass: option.pass || null,
                port: option.port || 22,
                remotePath: (option.remotePath || '/') + path
            })))
            .pipe(gulp.dest(dest, {sourcemaps: '.'}))
    });
}

function concat_Actions(){
    return through2.obj(function (file, enc, cb) {
        debugger;
        if (file.isNull()) {
            this.push(file);
            return cb();
        }

        if (file.isStream()) {
            this.emit('error', new gutil.PluginError(PLUGIN_NAME, 'Streaming not supported'));
            return cb();
        }
        var content = file.contents.toString();

        var o = path.parse(file.path);
        var name = o.name;
        content = "var actionJson = "+content;
        content = content+"\nif (!o2.xAction.RestActions.Action[\""+name+"\"]) o2.xAction.RestActions.Action[\""+name+"\"] = new Class({Extends: o2.xAction.RestActions.Action});";
        content = content+"\no2.Actions.actions[\""+name+"\"] = new o2.xAction.RestActions.Action[\""+name+"\"](\""+name+"\", actionJson);";

        file.contents = new Buffer.from(content);
        this.push(file);
        cb();
    });
}
function concat_Style(){
    return through2.obj(function (file, enc, cb) {
        if (file.isNull()) {
            this.push(file);
            return cb();
        }

        if (file.isStream()) {
            this.emit('error', new gutil.PluginError(PLUGIN_NAME, 'Streaming not supported'));
            return cb();
        }
        var content = file.contents.toString();
        //name = ".."+file.path.replace(process.cwd(), "").replace(/\\/g, "/").substring("/source".length);
        var name = file.path.replace(process.cwd(), "").replace(/\\/g, "/")
        name = ".."+name.substring(name.indexOf("/source")+7);
        content = "var csskey = encodeURIComponent(\""+name+"\");\no2.widget.css[csskey]="+content;

        file.contents = new Buffer.from(content);
        this.push(file);
        cb();
    });
}

function createBaseWorkConcatStyleTask(path){
    gulp.task(path+".base_work : style", function(){
        return gulp.src([
            "source/x_component_process_Work/$Main/default/css.wcss",
            "source/x_component_process_Xform/$Form/default/css.wcss",
            "source/o2_core/o2/widget/$Tab/mobileForm/css.wcss",
            "source/o2_core/o2/widget/$Menu/tab/css.wcss",
            "source/o2_core/o2/widget/$Tab/form/css.wcss",
            "source/x_component_process_Xform/$Form/default/doc.wcss",
            "source/o2_core/o2/widget/$Toolbar/documentEdit/css.wcss",
            "source/o2_core/o2/widget/$Toolbar/documentEdit_side/css.wcss"
        ])
            .pipe(concat_Style())
            .pipe(concat('js/base_work_style_temp.js'))
            .pipe(gulp.dest('source/x_desktop/'))
    })
}

function createBaseWorkConcatActionTask(path){
    gulp.task(path+".base_work : action", function(){
        return gulp.src([
            "source/o2_core/o2/xAction/services/x_organization_assemble_authentication.json",
            "source/o2_core/o2/xAction/services/x_processplatform_assemble_surface.json",
            "source/o2_core/o2/xAction/services/x_organization_assemble_control.json",
            "source/o2_core/o2/xAction/services/x_query_assemble_surface.json",
            "source/o2_core/o2/xAction/services/x_cms_assemble_control.json",
            "source/o2_core/o2/xAction/services/x_program_center.json",
            "source/o2_core/o2/xAction/services/x_organization_assemble_personal.json"
        ])
            .pipe(concat_Actions())
            .pipe(concat('js/base_work_actions_temp.js'))
            .pipe(gulp.dest('source/x_desktop/'))
    })
}
function createBaseWorkConcatDelTempTask(path) {
    gulp.task(path+".base_work : clean", function(cb){
        var dest = [
            'source/'+path+'/js/base_work_actions_temp.js',
            'source/'+path+'/js/base_work_style_temp.js'
        ];
        return del(dest, cb);
    });
}

function createBaseWorkConcatBodyTask(path, isMin, thisOptions) {
    gulp.task(path+".base_work : concat", function(){
        var option = thisOptions || options;
        var src = [
            'source/' + path + '/js/base_concat_head.js',
            // 'source/o2_core/o2/lp/'+(option.lp || 'zh-cn')+'.js',
            // 'source/x_component_process_Work/lp/'+(option.lp || 'zh-cn')+'.js',
            // 'source/x_component_process_Xform/lp/'+(option.lp || 'zh-cn')+'.js',
            // 'source/x_component_Selector/lp/'+(option.lp || 'zh-cn')+'.js',

            'source/' + path + '/js/base_work_style_temp.js',

            'source/o2_core/o2/widget/Common.js',
            'source/o2_core/o2/widget/Dialog.js',
            'source/o2_core/o2/widget/UUID.js',
            'source/o2_core/o2/widget/Menu.js',
            'source/o2_core/o2/widget/Toolbar.js',
            'source/o2_core/o2/xDesktop/Common.js',
            'source/o2_core/o2/xDesktop/Actions/RestActions.js',
            'source/o2_core/o2/xAction/RestActions.js',
            'source/o2_core/o2/xDesktop/Access.js',
            'source/o2_core/o2/xDesktop/Dialog.js',
            'source/o2_core/o2/xDesktop/Menu.js',
            'source/o2_core/o2/xDesktop/UserData.js',
            'source/x_component_Template/MPopupForm.js',
            'source/o2_core/o2/xDesktop/Authentication.js',
            'source/o2_core/o2/xDesktop/Window.js',
            'source/x_component_Common/Main.js',
            'source/x_component_process_Work/Main.js',
            'source/x_component_Selector/package.js',
            'source/x_component_Selector/Person.js',
            'source/x_component_Selector/Identity.js',
            'source/x_component_Selector/Unit.js',
            'source/x_component_Selector/IdentityWidthDuty.js',
            'source/x_component_Selector/IdentityWidthDutyCategoryByUnit.js',
            'source/x_component_Selector/UnitWithType.js',
            'source/o2_core/o2/xScript/Actions/UnitActions.js',
            'source/o2_core/o2/xScript/Actions/ScriptActions.js',
            'source/o2_core/o2/xScript/Actions/CMSScriptActions.js',
            'source/o2_core/o2/xScript/Actions/PortalScriptActions.js',
            'source/o2_core/o2/xScript/Environment.js',
            'source/x_component_Template/MTooltips.js',
            'source/x_component_Template/MSelector.js',

            'source/o2_core/o2/xAction/services/x_organization_assemble_authentication.js',
            'source/o2_core/o2/xAction/services/x_processplatform_assemble_surface.js',
            'source/o2_core/o2/xAction/services/x_cms_assemble_control.js',
            'source/o2_core/o2/xAction/services/x_organization_assemble_control.js',
            'source/o2_core/o2/xAction/services/x_query_assemble_surface.js',
            'source/o2_core/o2/xAction/services/x_organization_assemble_personal.js',

            'source/' + path + '/js/base_work_actions_temp.js',

            'source/' + path + '/js/base.js',
            'source/' + path + '/js/base_loader.js'
        ];
        var dest = option.dest+'/' + path + '/';
        return gulp.src(src, {sourcemaps: true})
            //.pipe(sourceMap.init())
            .pipe(concat('js/base_work.js'))
            .pipe(gulpif((option.upload == 'local' && option.location != ''), gulp.dest(option.location + path + '/')))
            .pipe(gulpif((option.upload == 'ftp' && option.host != ''), ftp({
                host: option.host,
                user: option.user || 'anonymous',
                pass: option.pass || '@anonymous',
                port: option.port || 21,
                remotePath: (option.remotePath || '/') + path
            })))
            .pipe(gulpif((option.upload == 'sftp' && option.host != ''), sftp({
                host: option.host,
                user: option.user || 'anonymous',
                pass: option.pass || null,
                port: option.port || 22,
                remotePath: (option.remotePath || '/') + path
            })))
            .pipe(gulp.dest(dest))

            .pipe(concat('js/base_work.min.js'))
            .pipe(uglify())
            //.pipe( sourceMap.write("") )
            .pipe(gulpif((option.upload == 'local' && option.location != ''), gulp.dest(option.location + path + '/')))
            .pipe(gulpif((option.upload == 'ftp' && option.host != ''), ftp({
                host: option.host,
                user: option.user || 'anonymous',
                pass: option.pass || '@anonymous',
                port: option.port || 21,
                remotePath: (option.remotePath || '/') + path
            })))
            .pipe(gulpif((option.upload == 'sftp' && option.host != ''), sftp({
                host: option.host,
                user: option.user || 'anonymous',
                pass: option.pass || null,
                port: option.port || 22,
                remotePath: (option.remotePath || '/') + path
            })))
            .pipe(gulp.dest(dest, {sourcemaps: '.'}))
    });
}
function createBaseWorkConcatLanguageTask(path, thisOptions, language){
    gulp.task(path+".base_lp : "+language, function(){
        var option = thisOptions || options;
        var src = [
            'source/o2_core/o2/lp/'+(language)+'.js',
            'source/x_component_process_Work/lp/'+(language)+'.js',
            'source/x_component_process_Xform/lp/'+(language)+'.js',
            'source/x_component_Selector/lp/'+(language)+'.js',
            'source/x_component_Template/lp/'+(language)+'.js',
            'source/x_component_portal_Portal/lp/'+(language)+'.js',
            'source/x_component_cms_Document/lp/'+(language)+'.js',
            'source/x_component_cms_Xform/lp/'+(language)+'.js',
        ];
        var dest = option.dest+'/' + path + '/';
        return gulp.src(src, {allowEmpty: true, sourcemaps: true})
            //.pipe(sourceMap.init())
            .pipe(concat('js/base_lp_'+language+'.js'))
            .pipe(gulpif((option.upload == 'local' && option.location != ''), gulp.dest(option.location + path + '/')))
            .pipe(gulpif((option.upload == 'ftp' && option.host != ''), ftp({
                host: option.host,
                user: option.user || 'anonymous',
                pass: option.pass || '@anonymous',
                port: option.port || 21,
                remotePath: (option.remotePath || '/') + path
            })))
            .pipe(gulpif((option.upload == 'sftp' && option.host != ''), sftp({
                host: option.host,
                user: option.user || 'anonymous',
                pass: option.pass || null,
                port: option.port || 22,
                remotePath: (option.remotePath || '/') + path
            })))
            .pipe(gulp.dest(dest))

            .pipe(uglify())
            .pipe(concat('js/base_lp_'+language+'.min.js'))
            //.pipe( sourceMap.write("") )
            .pipe(gulpif((option.upload == 'local' && option.location != ''), gulp.dest(option.location + path + '/')))
            .pipe(gulpif((option.upload == 'ftp' && option.host != ''), ftp({
                host: option.host,
                user: option.user || 'anonymous',
                pass: option.pass || '@anonymous',
                port: option.port || 21,
                remotePath: (option.remotePath || '/') + path
            })))
            .pipe(gulpif((option.upload == 'sftp' && option.host != ''), sftp({
                host: option.host,
                user: option.user || 'anonymous',
                pass: option.pass || null,
                port: option.port || 22,
                remotePath: (option.remotePath || '/') + path
            })))
            .pipe(gulp.dest(dest, {sourcemaps: '.'}))
    });
}
function createBaseWorkConcatTask(path, isMin, thisOptions){
    createBaseWorkConcatActionTask(path);
    createBaseWorkConcatStyleTask(path);
    createBaseWorkConcatBodyTask(path, isMin, thisOptions);
    createBaseWorkConcatDelTempTask(path);
    gulp.task( path+".base_work", gulp.series(path+".base_work : action", path+".base_work : style", path+".base_work : concat", lpTasks, path+".base_work : clean"));
}

function createBasePortalConcatStyleTask(path){
    gulp.task(path+".base_portal : style", function(){
        return gulp.src([
            "source/x_component_process_Work/$Main/default/css.wcss",
            "source/x_component_portal_Portal/$Main/default/css.wcss",
            "source/x_component_process_Xform/$Form/default/css.wcss",
            "source/o2_core/o2/widget/$Tab/mobileForm/css.wcss",
            "source/o2_core/o2/widget/$Menu/tab/css.wcss"
        ])
            .pipe(concat_Style())
            .pipe(concat('js/base_portal_style_temp.js'))
            .pipe(gulp.dest('source/x_desktop/'))
    })
}

function createBasePortalConcatActionTask(path){
    gulp.task(path+".base_portal : action", function(){
        return gulp.src([
            "source/o2_core/o2/xAction/services/x_organization_assemble_authentication.json",
            "source/o2_core/o2/xAction/services/x_portal_assemble_surface.json",
            "source/o2_core/o2/xAction/services/x_processplatform_assemble_surface.json",
            "source/o2_core/o2/xAction/services/x_organization_assemble_control.json",
            "source/o2_core/o2/xAction/services/x_query_assemble_surface.json",
            "source/o2_core/o2/xAction/services/x_cms_assemble_control.json",
            "source/o2_core/o2/xAction/services/x_program_center.json",
            "source/o2_core/o2/xAction/services/x_organization_assemble_personal.json"
        ])
            .pipe(concat_Actions())
            .pipe(concat('js/base_portal_actions_temp.js'))
            .pipe(gulp.dest('source/x_desktop/'))
    })
}
function createBasePortalConcatDelTempTask(path) {
    gulp.task(path+".base_portal : clean", function(cb){
        var dest = [
            'source/'+path+'/js/base_portal_actions_temp.js',
            'source/'+path+'/js/base_portal_style_temp.js'
        ];
        return del(dest, cb);
    });
}

function createBasePortalConcatBodyTask(path, isMin, thisOptions) {
    gulp.task(path+".base_portal : concat", function(){
        var option = thisOptions || options;
        var src = [
            'source/' + path + '/js/base_concat_head.js',
            //'source/o2_core/o2/lp/'+(option.lp || 'zh-cn')+'.js',

            'source/' + path + '/js/base_portal_style_temp.js',

            'source/o2_core/o2/widget/Common.js',
            'source/o2_core/o2/widget/Dialog.js',
            'source/o2_core/o2/widget/UUID.js',
            'source/o2_core/o2/widget/Menu.js',
            'source/o2_core/o2/widget/Toolbar.js',
            'source/o2_core/o2/xDesktop/Common.js',
            'source/o2_core/o2/xDesktop/Actions/RestActions.js',
            'source/o2_core/o2/xAction/RestActions.js',
            'source/o2_core/o2/xDesktop/Access.js',
            'source/o2_core/o2/xDesktop/Dialog.js',
            'source/o2_core/o2/xDesktop/Menu.js',
            'source/o2_core/o2/xDesktop/UserData.js',
            'source/x_component_Template/MPopupForm.js',
            'source/o2_core/o2/xDesktop/Authentication.js',
            'source/o2_core/o2/xDesktop/Window.js',

            'source/x_component_Common/Main.js',

            // 'source/x_component_process_Work/lp/'+(option.lp || 'zh-cn')+'.js',
            // 'source/x_component_portal_Portal/lp/'+(option.lp || 'zh-cn')+'.js',
            // 'source/x_component_process_Xform/lp/'+(option.lp || 'zh-cn')+'.js',
            // 'source/x_component_Selector/lp/'+(option.lp || 'zh-cn')+'.js',

            'source/x_component_portal_Portal/Main.js',

            'source/x_component_Selector/package.js',
            'source/x_component_Selector/Person.js',
            'source/x_component_Selector/Identity.js',
            'source/x_component_Selector/Unit.js',
            'source/x_component_Selector/IdentityWidthDuty.js',
            'source/x_component_Selector/IdentityWidthDutyCategoryByUnit.js',
            'source/x_component_Selector/UnitWithType.js',

            'source/o2_core/o2/xScript/Actions/UnitActions.js',
            'source/o2_core/o2/xScript/Actions/ScriptActions.js',
            'source/o2_core/o2/xScript/Actions/CMSScriptActions.js',
            'source/o2_core/o2/xScript/Actions/PortalScriptActions.js',
            'source/o2_core/o2/xScript/PageEnvironment.js',

            'source/o2_core/o2/xAction/services/x_organization_assemble_authentication.js',
            'source/o2_core/o2/xAction/services/x_processplatform_assemble_surface.js',
            'source/o2_core/o2/xAction/services/x_cms_assemble_control.js',
            'source/o2_core/o2/xAction/services/x_organization_assemble_control.js',
            'source/o2_core/o2/xAction/services/x_query_assemble_surface.js',
            'source/o2_core/o2/xAction/services/x_organization_assemble_personal.js',

            'source/' + path + '/js/base_portal_actions_temp.js',

            'source/' + path + '/js/base.js',
            'source/' + path + '/js/base_loader.js'
        ];
        var dest = option.dest+'/' + path + '/';
        return gulp.src(src, {sourcemaps: true})
            //.pipe(sourceMap.init())
            .pipe(concat('js/base_portal.js'))
            .pipe(gulpif((option.upload == 'local' && option.location != ''), gulp.dest(option.location + path + '/')))
            .pipe(gulpif((option.upload == 'ftp' && option.host != ''), ftp({
                host: option.host,
                user: option.user || 'anonymous',
                pass: option.pass || '@anonymous',
                port: option.port || 21,
                remotePath: (option.remotePath || '/') + path
            })))
            .pipe(gulpif((option.upload == 'sftp' && option.host != ''), sftp({
                host: option.host,
                user: option.user || 'anonymous',
                pass: option.pass || null,
                port: option.port || 22,
                remotePath: (option.remotePath || '/') + path
            })))
            .pipe(gulp.dest(dest))
            // .pipe(gulp.src(src))
            .pipe(concat('js/base_portal.min.js'))
            .pipe(uglify())
            //.pipe( sourceMap.write("") )
            // .pipe(rename({ extname: '.min.js' }))
            .pipe(gulpif((option.upload == 'local' && option.location != ''), gulp.dest(option.location + path + '/')))
            .pipe(gulpif((option.upload == 'ftp' && option.host != ''), ftp({
                host: option.host,
                user: option.user || 'anonymous',
                pass: option.pass || '@anonymous',
                port: option.port || 21,
                remotePath: (option.remotePath || '/') + path
            })))
            .pipe(gulpif((option.upload == 'sftp' && option.host != ''), sftp({
                host: option.host,
                user: option.user || 'anonymous',
                pass: option.pass || null,
                port: option.port || 22,
                remotePath: (option.remotePath || '/') + path
            })))
            .pipe(gulp.dest(dest, {sourcemaps: '.'}))
    });
}
function createBasePortalConcatTask(path, isMin, thisOptions){
    createBasePortalConcatActionTask(path);
    createBasePortalConcatStyleTask(path);
    createBasePortalConcatBodyTask(path, isMin, thisOptions);
    createBasePortalConcatDelTempTask(path);
    gulp.task( path+".base_portal", gulp.series(path+".base_portal : action", path+".base_portal : style", path+".base_portal : concat", lpTasks, path+".base_portal : clean"));
}


function createBaseDocumentConcatActionTask(path){
    gulp.task(path+".base_document : action", function(){
        return gulp.src([
            "source/o2_core/o2/xAction/services/x_organization_assemble_authentication.json",
            "source/o2_core/o2/xAction/services/x_organization_assemble_control.json",
            "source/o2_core/o2/xAction/services/x_cms_assemble_control.json",
            "source/o2_core/o2/xAction/services/x_program_center.json",
            "source/o2_core/o2/xAction/services/x_organization_assemble_personal.json"
        ])
            .pipe(concat_Actions())
            .pipe(concat('js/base_document_actions_temp.js'))
            .pipe(gulp.dest('source/x_desktop/'))
    })
}

function createBaseDocumentConcatStyleTask(path){
    gulp.task(path+".base_document : style", function(){
        return gulp.src([
            "source/x_component_cms_Document/$Main/default/css.wcss",
            "source/x_component_cms_Xform/$Form/default/css.wcss",
            "source/o2_core/o2/widget/$AttachmentController/default/css.wcss"
        ])
            .pipe(concat_Style())
            .pipe(concat('js/base_document_style_temp.js'))
            .pipe(gulp.dest('source/x_desktop/'))
    })
}

function createBaseDocumentConcatBodyTask(path, isMin, thisOptions) {
    gulp.task(path+".base_document : concat", function(){
        var option = thisOptions || options;
        var src = [
            'source/' + path + '/js/base_concat_head.js',
            //'source/o2_core/o2/lp/'+(option.lp || 'zh-cn')+'.js',

            'source/' + path + '/js/base_document_style_temp.js',

            'source/o2_core/o2/widget/Common.js',
            'source/o2_core/o2/widget/Dialog.js',
            'source/o2_core/o2/widget/UUID.js',
            'source/o2_core/o2/widget/Menu.js',
            'source/o2_core/o2/widget/Mask.js',
            'source/o2_core/o2/xDesktop/Common.js',
            'source/o2_core/o2/xDesktop/Actions/RestActions.js',
            'source/o2_core/o2/xAction/RestActions.js',
            'source/o2_core/o2/xDesktop/Access.js',
            'source/o2_core/o2/xDesktop/Dialog.js',
            'source/o2_core/o2/xDesktop/Menu.js',
            'source/o2_core/o2/xDesktop/UserData.js',
            'source/x_component_Template/MPopupForm.js',
            'source/o2_core/o2/xDesktop/Authentication.js',
            'source/o2_core/o2/xDesktop/Window.js',

            'source/x_component_Common/Main.js',

            // 'source/x_component_cms_Document/lp/'+(option.lp || 'zh-cn')+'.js',
            // 'source/x_component_process_Xform/lp/'+(option.lp || 'zh-cn')+'.js',
            // 'source/x_component_Selector/lp/'+(option.lp || 'zh-cn')+'.js',
            // 'source/x_component_cms_Xform/lp/'+(option.lp || 'zh-cn')+'.js',

            'source/x_component_cms_Document/Main.js',

            'source/x_component_Selector/package.js',

            'source/o2_core/o2/xScript/Actions/UnitActions.js',
            'source/o2_core/o2/xScript/Actions/CMSScriptActions.js',
            'source/o2_core/o2/xScript/CMSEnvironment.js',

            'source/o2_core/o2/xAction/services/x_organization_assemble_authentication.js',
            'source/o2_core/o2/xAction/services/x_cms_assemble_control.js',
            'source/o2_core/o2/xAction/services/x_organization_assemble_control.js',
            'source/o2_core/o2/xAction/services/x_organization_assemble_personal.js',

            'source/' + path + '/js/base_document_actions_temp.js',

            'source/' + path + '/js/base.js',
            'source/' + path + '/js/base_loader.js'
        ];
        var dest = option.dest+'/' + path + '/';
        return gulp.src(src, {sourcemaps: true})
            //.pipe(sourceMap.init())
            .pipe(concat('js/base_document.js'))
            .pipe(gulpif((option.upload == 'local' && option.location != ''), gulp.dest(option.location + path + '/')))
            .pipe(gulpif((option.upload == 'ftp' && option.host != ''), ftp({
                host: option.host,
                user: option.user || 'anonymous',
                pass: option.pass || '@anonymous',
                port: option.port || 21,
                remotePath: (option.remotePath || '/') + path
            })))
            .pipe(gulpif((option.upload == 'sftp' && option.host != ''), sftp({
                host: option.host,
                user: option.user || 'anonymous',
                pass: option.pass || null,
                port: option.port || 22,
                remotePath: (option.remotePath || '/') + path
            })))
            .pipe(gulp.dest(dest))
            // .pipe(gulp.src(src))
            .pipe(concat('js/base_document.min.js'))
            .pipe(uglify())
            //.pipe( sourceMap.write("") )
            // .pipe(rename({ extname: '.min.js' }))
            .pipe(gulpif((option.upload == 'local' && option.location != ''), gulp.dest(option.location + path + '/')))
            .pipe(gulpif((option.upload == 'ftp' && option.host != ''), ftp({
                host: option.host,
                user: option.user || 'anonymous',
                pass: option.pass || '@anonymous',
                port: option.port || 21,
                remotePath: (option.remotePath || '/') + path
            })))
            .pipe(gulpif((option.upload == 'sftp' && option.host != ''), sftp({
                host: option.host,
                user: option.user || 'anonymous',
                pass: option.pass || null,
                port: option.port || 22,
                remotePath: (option.remotePath || '/') + path
            })))
            .pipe(gulp.dest(dest, {sourcemaps: '.'}))
    });
}

function createBaseDocumentConcatDelTempTask(path) {
    gulp.task(path+".base_document : clean", function(cb){
        var dest = [
            'source/'+path+'/js/base_document_actions_temp.js',
            'source/'+path+'/js/base_document_style_temp.js'
        ];
        return del(dest, cb);
    });
}

function createBaseDocumentConcatTask(path, isMin, thisOptions){
    createBaseDocumentConcatActionTask(path);
    createBaseDocumentConcatStyleTask(path);
    createBaseDocumentConcatBodyTask(path, isMin, thisOptions);
    createBaseDocumentConcatDelTempTask(path);
    gulp.task( path+".base_document", gulp.series(path+".base_document : action", path+".base_document : style", path+".base_document : concat", lpTasks, path+".base_document : clean"));
}



function createBaseConcatTask(path, isMin, thisOptions){
    gulp.task(path+".base", function(){
        var option = thisOptions || options;
        var src = [
            'source/' + path + '/js/base.js',
            'source/o2_core/o2/xScript/PageEnvironment.js',
            'source/o2_core/o2/framework.js',
            'source/' + path + '/js/base_loader.js'
        ];
        var dest = option.dest+'/' + path + '/';
        return gulp.src(src, {sourcemaps: true})
            //.pipe(sourceMap.init())
            .pipe(concat('js/base.js'))
            .pipe(gulpif((option.upload == 'local' && option.location != ''), gulp.dest(option.location + path + '/')))
            .pipe(gulpif((option.upload == 'ftp' && option.host != ''), ftp({
                host: option.host,
                user: option.user || 'anonymous',
                pass: option.pass || '@anonymous',
                port: option.port || 21,
                remotePath: (option.remotePath || '/') + path
            })))
            .pipe(gulpif((option.upload == 'sftp' && option.host != ''), sftp({
                host: option.host,
                user: option.user || 'anonymous',
                pass: option.pass || null,
                port: option.port || 22,
                remotePath: (option.remotePath || '/') + path
            })))
            .pipe(gulp.dest(dest))
            // .pipe(gulp.src(src))
            .pipe(concat('js/base.min.js'))
            .pipe(uglify())
            //.pipe( sourceMap.write("") )
            // .pipe(rename({ extname: '.min.js' }))
            .pipe(gulpif((option.upload == 'local' && option.location != ''), gulp.dest(option.location + path + '/')))
            .pipe(gulpif((option.upload == 'ftp' && option.host != ''), ftp({
                host: option.host,
                user: option.user || 'anonymous',
                pass: option.pass || '@anonymous',
                port: option.port || 21,
                remotePath: (option.remotePath || '/') + path
            })))
            .pipe(gulpif((option.upload == 'sftp' && option.host != ''), sftp({
                host: option.host,
                user: option.user || 'anonymous',
                pass: option.pass || null,
                port: option.port || 22,
                remotePath: (option.remotePath || '/') + path
            })))
            .pipe(gulp.dest(dest, {sourcemaps: '.'}))
    });
}

var lpTasks = [];
function getAppTask(path, isMin, thisOptions) {
    if (path==="x_component_process_Xform") {
        createDefaultTask(path, isMin, thisOptions);
        createXFormConcatTask(path, isMin, thisOptions);
        return gulp.series(path, path + " : concat");
    }else if (path==="x_component_cms_Xform"){
        createDefaultTask(path, isMin, thisOptions);
        createCMSXFormConcatTask(path, isMin, thisOptions);
        return gulp.series(path, path+" : concat");
    }else if (path==="o2_core"){
        createDefaultTask(path, isMin, thisOptions);
        createO2ConcatTask(path, isMin, thisOptions);
        return gulp.series(path, path+" : concat", path+".xDesktop : concat",  path+" : bundle");
    }else if (path==="x_desktop") {
        createDefaultTask(path, isMin, thisOptions);

        supportedLanguage.forEach(function(lp){
            createBaseWorkConcatLanguageTask(path, thisOptions, lp);
            lpTasks.push(path+".base_lp : "+lp);
        });

        createBaseWorkConcatTask(path, isMin, thisOptions);
        createBasePortalConcatTask(path, isMin, thisOptions);
        createBaseDocumentConcatTask(path, isMin, thisOptions);
        createBaseConcatTask(path, isMin, thisOptions);
        return gulp.series(path, path+".base_work", path+".base_portal", path+".base_document", path+".base");
        //return gulp.series(path, path+".base_work : concat");
    }else{
        createDefaultTask(path, isMin, thisOptions);
        return gulp.series(path);
    }
}

//var taskObj = {};
apps.map(function (app) {
    var taskName;
    var isMin = (app.tasks.indexOf("min")!==-1);
    taskName = app.folder;
    appTasks.push(taskName);
    gulp.task(taskName, getAppTask(app.folder, isMin));

    // //var isMin = (app.tasks.indexOf("min")!==-1);
    // taskName = app.folder+"_release";
    // //appTasks.push(taskName);
    // gulp.task(taskName, getAppTask(app.folder, isMin, release_options));
});

// Object.keys(taskObj).map(function(k){
//     exports[k] = parallel(taskObj[k]);
// });

//exports[app.folder] = parallel(minTask, moveTask);

function getCleanTask(path) {
    return function (cb) {
        if (path){
            var dest = (path=="/") ? options.dest+"/" : options.dest+'/' + path + '/';
            gutil.log("Clean", ":", gutil.colors.red(dest));
            del.sync(dest, cb);
            cb();
        }else{
            cb();
        }
    }
}

function cleanRemoteFtp(f, cb) {
    var file = options.remotePath + f;

    var ftp = new JSFtp({
        host: options.host,
        user: options.user || 'anonymous',
        pass: options.pass || null,
        port: options.port || 21
    });

    ftp.raw('dele ' + file, function (err) {
        if (err) { cb(); return; }
        if (file.substring(file.length - 3).toLowerCase() == ".js") {
            file = file.replace('.js', ".min.js");
            ftp.raw('dele ' + file, function (err) {
                if (err) { cb(); return; }

                if (file.indexOf("/") != -1) {
                    var p = file.substring(0, file.lastIndexOf("/"));
                    ftp.raw('rmd ' + p, function (err) {
                        if (err) { cb(); return; }

                        ftp.raw.quit();
                        cb();
                    });
                }

            });
        } else {
            if (file.indexOf("/") != -1) {
                var pPath = file.substring(0, file.lastIndexOf("/"));
                ftp.raw('rmd ' + pPath, function (err) {
                    if (err) { cb(); return; }
                    ftp.raw.quit();
                    cb();
                });
            }
        }
    });
}
function cleanRemoteLocal(f, cb) {
    var file = options.location + f;
    del(file, { force: true, dryRun: true }, function () {
        if (file.substring(file.length - 3).toLowerCase() == ".js") {
            var minfile = file.replace('.js', ".min.js");
            del(minfile, { force: true, dryRun: true }, function () {
                var p = file.substring(0, file.lastIndexOf("/"));
                fs.rmdir(p, function (err) {
                    if (err) { }
                    cb();
                })
            });
        } else {
            var p = file.substring(0, file.lastIndexOf("/"));
            fs.rmdir(p, function (err) {
                if (err) { }
                cb();
            })
        }
    });
}

function getCleanRemoteTask(path) {
    return function (cb) {
        if (options.upload) {
            var file = path.replace(/\\/g, "/");
            file = file.substring(file.indexOf("source/") + 7);

            if (options.upload == 'local' && options.location != '') cleanRemoteLocal(file, cb);
            if (options.upload == 'ftp' && options.host != '') cleanRemoteFtp(file, cb);
        } else {
            if (cb) cb();
        }
    }
}

function getWatchTask(path) {
    return (path) ? function (cb) {
        gutil.log("watch", ":", gutil.colors.green(path, "is watching ..."));
        gulp.watch(['source/' + path + '/**/*', "!./**/test/**"], { "events": ['addDir', 'add', 'change'] }, gulp.parallel([path]));
    } : function(cb){cb();};
}

gulp.task("clean", getCleanTask(options.src))
gulp.task("watch", getWatchTask(options.src));

gulp.task("index", function () {
    var src = ['source/favicon.ico', 'source/index.html'];
    var dest = options.dest;
    return gulp.src(src)
        .pipe(changed(dest))
        .pipe(gulpif((options.upload == 'local' && options.location != ''), gulp.dest(options.location + '/')))
        .pipe(gulpif((options.upload == 'ftp' && options.host != ''), ftp({
            host: options.host,
            user: options.user || 'anonymous',
            pass: options.pass || '@anonymous',
            port: options.port || 21,
            remotePath: (options.remotePath || '/')
        })))
        .pipe(gulpif((options.upload == 'sftp' && options.host != ''), ftp({
            host: options.host,
            user: options.user || 'anonymous',
            pass: options.pass || null,
            port: options.port || 22,
            remotePath: (options.remotePath || '/')
        })))
        .pipe(gulp.dest(dest))
        .pipe(gutil.noop());
});
gulp.task("cleanAll", getCleanTask('/'));

function getGitV(){
    var tagPromise = new Promise(function(s){
        git.exec({args : 'describe --tag'}, function (err, stdout) {
            var v = stdout.substring(0, stdout.lastIndexOf("-"));
            s(v);
        });
    });
    var revPromise = new Promise(function(s){
        git.exec({args : 'rev-parse --short HEAD'}, function (err, hash) {
            s(hash.trim());
        });
    });
    return Promise.all([tagPromise,revPromise])
}

gulp.task("o2:new-v:html", function () {
    var path = "x_desktop";
    var src = 'source/x_desktop/*.html';
    var dest = options.dest + '/x_desktop/';

    return getGitV().then(function(arr) {
        return gulp.src(src)
            .pipe(assetRev({"verConnecter": arr[0], "md5": arr[1]}))
            .pipe(gulpif((options.upload == 'local' && options.location != ''), gulp.dest(options.location + path + '/')))
            .pipe(gulpif((options.upload == 'ftp' && options.host != ''), ftp({
                host: options.host,
                user: options.user || 'anonymous',
                pass: options.pass || '@anonymous',
                port: options.port || 21,
                remotePath: (options.remotePath || '/') + path
            })))
            .pipe(gulpif((options.upload == 'sftp' && options.host != ''), sftp({
                host: options.host,
                user: options.user || 'anonymous',
                pass: options.pass || null,
                port: options.port || 22,
                remotePath: (options.remotePath || '/') + path
            })))
            .pipe(gulp.dest(dest))
            .pipe(gutil.noop());
    });
});

gulp.task("o2:new-v:o2", function () {
    var path = "o2_core";
    var src = options.dest +'/o2_core/o2.js';
    var dest = options.dest +'/o2_core/';

    return getGitV().then(function(arr){
        var v = arr[0]+"-"+arr[1];

        return gulp.src(src)
            .pipe(assetRev({"verConnecter": arr[0], "md5": arr[1], "replace": true}))
            .pipe(gulpif((options.upload == 'local' && options.location != ''), gulp.dest(options.location + path + '/')))
            .pipe(gulpif((options.upload == 'ftp' && options.host != ''), ftp({
                host: options.host,
                user: options.user || 'anonymous',
                pass: options.pass || '@anonymous',
                port: options.port || 21,
                remotePath: (options.remotePath || '/') + path
            })))
            .pipe(gulpif((options.upload == 'sftp' && options.host != ''), sftp({
                host: options.host,
                user: options.user || 'anonymous',
                pass: options.pass || null,
                port: options.port || 22,
                remotePath: (options.remotePath || '/') + path
            })))
            .pipe(gulp.dest(dest))
            .pipe(uglify())
            .pipe(rename({ extname: '.min.js' }))
            .pipe(gulpif((options.upload == 'local' && options.location != ''), gulp.dest(options.location + path + '/')))
            .pipe(gulpif((options.upload == 'ftp' && options.host != ''), ftp({
                host: options.host,
                user: options.user || 'anonymous',
                pass: options.pass || '@anonymous',
                port: options.port || 21,
                remotePath: (options.remotePath || '/') + path
            })))
            .pipe(gulpif((options.upload == 'sftp' && options.host != ''), sftp({
                host: options.host,
                user: options.user || 'anonymous',
                pass: options.pass || null,
                port: options.port || 22,
                remotePath: (options.remotePath || '/') + path
            })))
            .pipe(gulp.dest(dest))
            .pipe(gutil.noop());
    });
});
gulp.task("o2:new-v", gulp.parallel("o2:new-v:o2", "o2:new-v:html"));


gulp.task("git_clean", function (cb) {
    var dest = 'D:/O2/github/huqi1980/o2oa/o2web/source/';
    del(dest, { dryRun: true, force: true }, cb);
});

gulp.task("git_dest", function () {
    var dest = "D:/O2/github/huqi1980/o2oa/o2web/source";
    return gulp.src(["source/**/*", "!./**/test/**"])
        .pipe(changed(dest))
        .pipe(gulp.dest(dest))
});
gulp.task("git", gulp.series('git_clean', 'git_dest'));

gulp.task("default", gulp.series(gulp.parallel(appTasks, 'index'), "o2:new-v"));

function build(){
    options.ev = "p";
    options.upload = o_options.upload || "";
    options.location = o_options.location || uploadOptions.location;
    options.host = o_options.host || uploadOptions.host;
    options.user = o_options.user || uploadOptions.user;
    options.pass = o_options.pass || uploadOptions.pass;
    options.port = o_options.port || uploadOptions.port;
    options.remotePath = o_options.remotePath || uploadOptions.remotePath;
    options.dest = o_options.dest || uploadOptions.dest || "dest";
};
gulp.task("build", gulp.series("clean", gulp.parallel(appTasks, 'index'), "o2:new-v"))

gulp.task("temp_o2", function(){
    return gulp.src("source/x_test/o2.js")
        .pipe(uglify())
        .pipe(rename({ extname: '.min.js' }))
        .pipe(gulp.dest("source/x_test/"))
        .pipe(gutil.noop());
})

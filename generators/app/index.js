var generators = require('yeoman-generator');
var chalk = require('chalk');
var yosay = require('yosay');

var generatorWebappUtils = require('../../util/generator-webapp-utils.js');

module.exports = generators.Base.extend({

  constructor: function () {
    generators.Base.apply(this, arguments);
  },

  promptProjectType: function () {
    var done = this.async();

    this.log(yosay(
      'Welcome to the ' + chalk.red('angular-webapp') + ' generator!'
    ));

    this.prompt({
      type: 'list',
      name: 'projectType',
      message: 'What type of project will this be ?',
      choices: [
      "Angular Web App",
      "Module to be included in other Angular Web Apps"
      ],
      filter: function (val) {
        var filterMap = {
          "Angular Web App": 'Webapp',
          "Module to be included in other Angular Web Apps": 'Module'
        }
        return filterMap[val];
      },
      store: true,
    }, function (answers) {
      this.log(answers);
      this.log(answers.projectType);
      this.projectType = answers.projectType;
      done();
    }.bind(this));
  },

  promptProjectDependencies: function () {
    var done = this.async();

    this.prompt({
      type: 'checkbox',
      name: 'projectDependencies',
      message: 'Select which packages you would like to preconfigure with this project',
      choices: [
      "angular/bootstrap-ui",
      "ngRoute",
      "ngResource",
      "angular-local-storage",
      "angular-translate",
      "moment.js"
      ],
      filter: function (val) {
        var filterMap = {
          "angular/bootstrap-ui": 'TODO',
          "ngRoute": 'TODO',
          "ngResource": 'TODO',
          "angular-local-storage": 'TODO',
          "angular-translate": 'TODO',
          "moment.js": 'TODO'
        }
        return filterMap[val];
      },
      store: true,
    }, function (answers) {
      this.log(answers.projectType);
      this.projectDependencies = answers.projectDependencies;
      done();
    }.bind(this));
  },


  promptProjectName: function () {
    var done = this.async();
    this.prompt({
      type    : 'input',
      name    : 'name',
      message : 'Enter a name for your ' + this.projectType + ' project.',
      store   : true,
      default : this.appname
    }, function (answers) {
      this.log(answers.name);
      this.config.set('name', answers.name);
      done();
    }.bind(this));
  },

  promptAngularVersion: function () {
    var done = this.async();
    this.prompt({
      type: 'input',
      name: 'angularVersion',
      message: 'Which angular version would you like to use ? (eg: 1.2.28)',
      store: true,
      default: '1.3.8',
    }, function (answers) {
      this.log(answers.angularVersion);
      this.angularVersion = answers.angularVersion;
      done();
    }.bind(this));
  },
  scaffoldProjectBase: function () {
    //
    // project setup
    //
    this.template('gulpfile.js', 'gulpfile.js');
    this.template('gitignore', '.gitignore');
    this.template('bower.json', 'bower.json');
    this.template('bowerrc', '.bowerrc');
    this.template('jshintrc', '.jshintrc');
    this.template('travis.yml', '.travis.yml');
    this.template('package.json', 'package.json');
    this.template('karma.conf.js', 'karma.conf.js');
    this.template('editorconfig', '.editorconfig');

  },

  scaffoldModule: function () {
    if ( this.projectType === "Webapp" ) { return; }
    this.template('src/demo/demo.js', 'src/demo/demo.js');
    this.template('src/module/module.js', 'src/module/module.js');
    this.template('src/demo/index.html', 'src/index.html');

    this.template('src/demo/demo.controller.js', 'src/demo/demo.controller.js');

    this.template('src/demo/main.html', 'src/demo/main.html');
    this.template('src/demo/header.html', 'src/demo/header.html');
    this.template('src/demo/footer.html', 'src/demo/footer.html');
    this.composeWith('angular-webapp:route', { options: { path: generatorWebappUtils.sanitizePath('src/module/exampleRoute'), name: 'exampleRoute' }});
  },

  scaffoldApp: function () {
    if ( this.projectType === "Module" ) { return; }
    this.template('src/app/app.js', 'src/app/app.js');
    this.template('src/index.html', 'src/index.html');

    //
    // main route /
    //
    this.composeWith('angular-webapp:controller', {
      options: {
        path: generatorWebappUtils.sanitizePath('src/app/main'),
        injections: [],
        scopeMethods: [],
        createTemplate: 'false',
        name: 'mainCtrl'
      }
    });

    this.template('src/app/main/main.html', 'src/app/main/main.html');
    this.template('src/app/main/header.html', 'src/app/main/header.html');
    this.template('src/app/main/footer.html', 'src/app/main/footer.html');

    this.template('src/app/app.scss', 'src/app/app.scss');

    //
    // example route /exampleRoute
    //
    this.composeWith('angular-webapp:route', { options: { path: generatorWebappUtils.sanitizePath('src/app/exampleRoute'), name: 'exampleRoute' }});
    this.directory('src/tmp', 'src/.tmp');
  },

  install: function () {
    var name = this.name;
    this.installDependencies({
      callback: function () {
        this.spawnCommand('gulp', ['karma-inject','index','ngdocs-build']).on('close', function (code) {
          console.log(chalk.bold.green('\nFinished setting up ' + name + ' run gulp to get started\n'));
          console.log(chalk.bold.yellow('docs :') + chalk.red(' https://github.com/kosz/generator-angular-webapp') + '\n' );

          console.log(chalk.bold.yellow('quick start :'));

          console.log(chalk.yellow(' gulp serve') + chalk.green(' - opens up a live reload server, and runs the ') + chalk.cyan('watchers'));
          console.log(chalk.yellow(' gulp') + chalk.green(' - runs the ') + chalk.cyan('watchers') + chalk.green(' but does not open a server'));
          console.log(chalk.yellow(' npm test') + chalk.green(' - runs the jasmine spec suite') + chalk.gray(' alternate command: karma start karma.conf.js'));
          console.log(chalk.yellow(' gulp ngdocs-serve') + chalk.green(' - compiles ngDocs from your comments, and opens up a server, serving the documentation page\n'));

        });
      }.bind(this)
    });
  }

});

var generators = require('yeoman-generator');
var chalk = require('chalk');
var yosay = require('yosay');
var generatorWebappUtils = require('../../util/generator-webapp-utils.js');
var reusablePrompts = require('../../util/reusable-prompts.js');

module.exports = generators.Base.extend({

  constructor: function () {

    generators.Base.apply(this, arguments);

    this.argument('controllerName', { type: String, required: false });
    if ( this.controllerName === undefined ) { this.controllerName = this.options.name; }
    this.path = this.options.path;

    this.injections = this.options.injections;
    this.scopeMethods = this.options.scopeMethods;
    this.createTemplate = this.options.createTemplate;
  
    this.generatorWebappUtils = generatorWebappUtils;

  },

  helloWorld: function () {
    if (this.options.path) { return; }
    this.log(yosay(
      'This will generate a ' + chalk.yellow('controller') + ', a ' + chalk.green('template') + ' and a ' + chalk.yellow('spec') + ' file'
    ));
  },

  promptPath: function() { 
    if (!this.path) { reusablePrompts.promptPath.apply(this); }
  },

  promptInjections: reusablePrompts.promptInjections, 

  promptScopeMethods: reusablePrompts.promptScopeMethods,

  promptTemplateCreation: reusablePrompts.promptTemplateCreation,

  promptControllerAs: function () {
    
    if (this.scopeMethods.length > 0) { 
      var done = this.async();

      this.prompt({
        type: 'list',
        name: 'controllerAs',
        message: 'Are you going to be using the controllerAs pattern ? ( use $scope if unsure )',
        choices: [
        "Use $scope",
        "Use this, and declare controller as in your html"
        ],
        filter: function (val) {
          var filterMap = {
            "Use $scope": 'false', 
            "Use this, and declare controller as in your html": 'true'
          }
          return filterMap[val];
        },  
        store: true,
      }, function (answers) {
        this.controllerAs = answers.controllerAs;
        done();
      }.bind(this));
    } else { 
      this.controllerAs = 'false'; //TODO: not thrilled with this 
    } 

  },

  processTemplates: function () {

    this.template('controller.controller.js', generatorWebappUtils.sanitizePath(this.path) + this.controllerName + '.controller.js');
    this.template('controller.controller.spec.js', generatorWebappUtils.sanitizePath(this.path) + this.controllerName + '.controller.spec.js');

    if ( this.createTemplate === 'true' ) { // refactor to use boolean not strings
      this.composeWith('angular-webapp:template', { options: { path: generatorWebappUtils.sanitizePath(this.path), name: this.controllerName.replace("ctrl","").replace("Ctrl","").replace("Controller","") }});
    }

  }

});

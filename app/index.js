'use strict';
var util = require('util');
var path = require('path');
var yeoman = require('yeoman-generator');


var CoralGenerator = module.exports = function CoralGenerator(args, options, config) {
  yeoman.generators.Base.apply(this, arguments);

  this.on('end', function () {
    this.installDependencies({ skipInstall: options['skip-install'] });
  });

  this.pkg = JSON.parse(this.readFileAsString(path.join(__dirname, '../package.json')));
};

util.inherits(CoralGenerator, yeoman.generators.NamedBase);

CoralGenerator.prototype.askFor = function askFor() {
  var cb = this.async();

  // welcome message
  var welcome =
  '\n     _-----_' +
  '\n    |       |' +
  '\n    |' + '--(o)--'.red + '|   .--------------------------.' +
  '\n   `---------´  |    ' + 'Welcome to Yeoman,'.yellow.bold + '    |' +
  '\n    ' + '( '.yellow + '_' + '´U`'.yellow + '_' + ' )'.yellow + '   |   ' + 'ladies and gentlemen!'.yellow.bold + '  |' +
  '\n    /___A___\\   \'__________________________\'' +
  '\n     |  ~  |'.yellow +
  '\n   __' + '\'.___.\''.yellow + '__' +
  '\n ´   ' + '`  |'.red + '° ' + '´ Y'.red + ' `\n';

  console.log(welcome);

  var prompts = [{
    name: 'appName',
    message: 'What do you want to call your app?'
  }];

  this.prompt(prompts, function (err, props) {
    if (err) {
      return this.emit('error', err);
    }

    this.appName = props.appName;

    cb();
  }.bind(this));
};

CoralGenerator.prototype.app = function app() {
  this.template('_README.md', 'README.md');

  this.template('_package.json', 'package.json');
  this.template('_bower.json', 'bower.json');
  this.template('_config.json', 'config.json');

  this.template('_Gruntfile.js', 'Gruntfile.js');

  this.template('bowerrc', '.bowerrc');
  this.template('editorconfig', '.editorconfig');
  this.template('gitignore', '.gitignore');
  this.template('jshintrc', '.jshintrc');

  this.directory('test/', 'test/');
  this.directory('dev/', 'dev/');
};

CoralGenerator.prototype.projectfiles = function projectfiles() {
  this.copy('editorconfig', '.editorconfig');
  this.copy('jshintrc', '.jshintrc');
};

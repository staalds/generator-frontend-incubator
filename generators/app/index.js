'use strict';
var yo = require('yeoman-generator'),
	chalk = require('chalk'),
	yosay = require('yosay'),
	mkdirp = require('mkdirp'),
	path = require('path'),
	config = require('./config.json');

////////////////////////////////////////////////////////////////////////////////////////////
// initializing - Your initialization methods (checking current project state, getting configs, etc)
// prompting - Where you prompt users for options (where you'd call this.prompt())
// configuring - Saving configurations and configure the project (creating .editorconfig files and other metadata files)
// default - If the method name doesn't match a priority, it will be pushed to this group.
// writing - Where you write the generator specific files (routes, controllers, etc)
// conflicts - Where conflicts are handled (used internally)
// install - Where installation are run (npm, bower)
// end - Called last, cleanup, say good bye, etc
///////////////////////////////////////////////////////////////////////////////////////////

module.exports = yo.generators.Base.extend({
	constructor: function (arg, options) {
		yo.generators.Base.apply(this, arguments);
		this.settings = config;
	},
	prompting: function () {
		var done = this.async();

		// Have Yeoman greet the user.
		this.log(yosay(
			'Welcome to the ' + chalk.bold(chalk.green('frontend-incubator')) + ' generator!'
		));

		var prompts = [{
			name: 'projectName',
			message: 'What is the name of your project?',
			default: path.basename(process.cwd())
		}, {
			name: 'projectVersion',
			message: 'What is version of your project?',
			default: '1.0.0'
		}, {
			name: 'es2015orLoose',
			message: 'Which babel preset do you want to use?',
			default: 'es2015-loose',
			type: 'list',
			choices: [{
				name: 'es2015-loose'
			}, {
				name: 'es2015'
			}]
		}, {
			name: 'dependencies',
			message: 'Select the dependencies you want to install:',
			type: 'checkbox',
			choices: [{
				name: 'fastdom'
			}, {
				name: 'fastclick'
			}, {
				name: 'jquery'
			}]
		}, {
			name: 'itcss',
			message: 'Do you want to use ITCSS?',
			default: true,
			type: 'confirm'
		}, {
			name: 'useDefaultConfig',
			message: 'Would you like to use the default incubator configuration?',
			default: true,
			type: 'confirm'
		}];

		//var extraPrompts = [{
		//	name: 'sourceRoot',
		//	message: 'What is the root of your sources?',
		//	default: this.settings.paths.src.root
		//}];

		this.prompt(prompts, function (props) {
			this.props = props;

			if (!props.useDefaultConfig) {
				console.log('This feature is not yet implemented. Using default instead');
				// @TODO: ask extra questions to the user here
				//var that = this;
				//this.prompt(extraPrompts, function (/*extraProps*/) {
				//that.extraProps = extraProps;
				done();
				//});
			} else {
				// To access props later use this.props.someOption;

				done();
			}
		}.bind(this));
	},

	writing: function () {

		this.fs.copyTpl(
			this.templatePath('package.json'),
			this.destinationPath('package.json'), {
				name: this.props.projectName,
				version: this.props.projectVersion
			}
		);

		this.fs.copyTpl(
			this.templatePath('config.json'),
			this.destinationPath('config.json'), {
				paths: this.settings.paths,
				esVersion: this.props.es2015orLoose
			}
		);

		this.fs.copyTpl(
			this.templatePath('README.md'),
			this.destinationPath('README.md'), {
				name: this.props.projectName,
				useDefaultConfig: this.props.useDefaultConfig
			}
		);

		var simpleCopyFiles = ['.editorconfig', '.gitattributes', '.gitignore', '.jshintrc', 'gulpfile.js', 'tasks.json'];
		for (var i = 0; i < simpleCopyFiles.length; i++) {
			this.fs.copyTpl(
				this.templatePath(simpleCopyFiles[i]),
				this.destinationPath(simpleCopyFiles[i])
			);
		}

		var paths = this.settings.paths.src,
			keep = '/.keep',
			keepText = 'remove this file when you\'ve added content to this folder',
			stylePath = paths.root + '/' + paths.asset.scss;

		this.fs.write(paths.root + '/' + paths.asset.javascript + keep, keepText);
		this.fs.write(paths.root + '/' + paths.asset.image + keep, keepText);
		this.fs.write(paths.root + '/' + paths.asset.font + keep, keepText);

		if (this.props.itcss) {
			this.fs.write(stylePath + '/settings/_settings.scss', '// import all settings here');
			this.fs.write(stylePath + '/tools/_tools.scss', '// import all tools here');
			this.fs.write(stylePath + '/generic/_generic.scss', '// import all generic styles here');
			this.fs.write(stylePath + '/base/_base.scss', '// import all base styles here');
			this.fs.write(stylePath + '/components/_components.scss', '// import all component styles here');
			this.fs.write(stylePath + '/theme/_theme.scss', '// import all theme styles here');
			this.fs.write(stylePath + '/trumps/_trumps.scss', '// import all trumps here');
			this.fs.copy(this.templatePath('src/asset/scss/itcss.scss'), this.destinationPath(stylePath + '/style.scss'))
		} else {
			this.fs.write(stylePath + keep, keepText);
		}

		this.fs.write(paths.root + '/' + paths.prototype.template + keep, keepText);
		this.fs.write(paths.root + '/' + paths.prototype.data + keep, keepText);
		this.fs.write(paths.root + '/' + paths.prototype.webroot + keep, keepText);

		// @TODO [issue 4](https://bitbucket.org/incentro-ondemand/generator-frontend-incubator/issues/4/load-kss-template-from-server-instead-of)
		var KSSDir = paths.root + '/' + paths.patternLibrary.root;
		this.bulkDirectory(KSSDir, KSSDir);
	},

	install: function () {
		// install extra dependencies:
		var dependencies = this.props.dependencies;
		if (dependencies && dependencies.length > 0) {
			this.npmInstall(dependencies, { save: true });
		}
		// yeoman defaults with bower so turn it off here
		this.installDependencies({bower: false});
	},
	end: function () {
		this.log(yosay(
			'Thank you for using ' + chalk.bold(chalk.green('frontend-incubator')) + ' generator!'
		));
	}
});

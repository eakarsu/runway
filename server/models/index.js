const User = require('./User');
const Project = require('./Project');
const Asset = require('./Asset');
const VideoGeneration = require('./VideoGeneration');
const ImageGeneration = require('./ImageGeneration');
const Template = require('./Template');
const Script = require('./Script');
const Storyboard = require('./Storyboard');
const Voiceover = require('./Voiceover');
const StylePreset = require('./StylePreset');
const Export = require('./Export');
const Spreadsheet = require('./Spreadsheet');
const FinancialModel = require('./FinancialModel');
const Plan = require('./Plan');
const Report = require('./Report');
const Scenario = require('./Scenario');
const Integration = require('./Integration');

// User associations
User.hasMany(Project, { foreignKey: 'userId' });
Project.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Asset, { foreignKey: 'userId' });
Asset.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(VideoGeneration, { foreignKey: 'userId' });
VideoGeneration.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(ImageGeneration, { foreignKey: 'userId' });
ImageGeneration.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Template, { foreignKey: 'userId' });
Template.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Script, { foreignKey: 'userId' });
Script.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Storyboard, { foreignKey: 'userId' });
Storyboard.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Voiceover, { foreignKey: 'userId' });
Voiceover.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(StylePreset, { foreignKey: 'userId' });
StylePreset.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Export, { foreignKey: 'userId' });
Export.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Spreadsheet, { foreignKey: 'userId' });
Spreadsheet.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(FinancialModel, { foreignKey: 'userId' });
FinancialModel.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Plan, { foreignKey: 'userId' });
Plan.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Report, { foreignKey: 'userId' });
Report.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Scenario, { foreignKey: 'userId' });
Scenario.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Integration, { foreignKey: 'userId' });
Integration.belongsTo(User, { foreignKey: 'userId' });

// Project associations
Project.hasMany(Storyboard, { foreignKey: 'projectId' });
Storyboard.belongsTo(Project, { foreignKey: 'projectId' });

Project.hasMany(Export, { foreignKey: 'projectId' });
Export.belongsTo(Project, { foreignKey: 'projectId' });

module.exports = {
  User,
  Project,
  Asset,
  VideoGeneration,
  ImageGeneration,
  Template,
  Script,
  Storyboard,
  Voiceover,
  StylePreset,
  Export,
  Spreadsheet,
  FinancialModel,
  Plan,
  Report,
  Scenario,
  Integration,
};

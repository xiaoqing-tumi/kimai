
require('./sass/_app.scss');

// ------ Kimai itself ------
require('./js/KimaiWebLoader.js');
global.KimaiPaginatedBoxWidget = require('./js/widgets/KimaiPaginatedBoxWidget').default;
global.KimaiPageLoader = require('./js/widgets/KimaiPageLoader').default;
global.KimaiReloadPageWidget = require('./js/widgets/KimaiReloadPageWidget').default;
global.KimaiColor = require('./js/widgets/KimaiColor').default;
global.KimaiStorage = require('./js/widgets/KimaiStorage').default;

/*global QUnit*/

jQuery.sap.require("sap.ui.qunit.qunit-css");
jQuery.sap.require("sap.ui.thirdparty.qunit");
jQuery.sap.require("sap.ui.qunit.qunit-junit");
QUnit.config.autostart = false;

sap.ui.require([
	"sap/ui/test/Opa5",
	"Jet/ControlTaskChimburArtem/test/integration/pages/Common",
	"sap/ui/test/opaQunit",
	"Jet/ControlTaskChimburArtem/test/integration/pages/Worklist",
	"Jet/ControlTaskChimburArtem/test/integration/pages/Object",
	"Jet/ControlTaskChimburArtem/test/integration/pages/NotFound",
	"Jet/ControlTaskChimburArtem/test/integration/pages/Browser",
	"Jet/ControlTaskChimburArtem/test/integration/pages/App"
], function (Opa5, Common) {
	"use strict";
	Opa5.extendConfig({
		arrangements: new Common(),
		viewNamespace: "Jet.ControlTaskChimburArtem.view."
	});

	sap.ui.require([
		"Jet/ControlTaskChimburArtem/test/integration/WorklistJourney",
		"Jet/ControlTaskChimburArtem/test/integration/ObjectJourney",
		"Jet/ControlTaskChimburArtem/test/integration/NavigationJourney",
		"Jet/ControlTaskChimburArtem/test/integration/NotFoundJourney"
	], function () {
		QUnit.start();
	});
});
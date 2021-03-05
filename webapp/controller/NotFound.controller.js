sap.ui.define([
		"Jet/ControlTaskChimburArtem/controller/BaseController"
	], function (BaseController) {
		"use strict";

		return BaseController.extend("Jet.ControlTaskChimburArtem.controller.NotFound", {

			/**
			 * Navigates to the worklist when the link is pressed
			 * @public
			 */
			onLinkPressed : function () {
				this.getRouter().navTo("worklist");
			}

		});

	}
);
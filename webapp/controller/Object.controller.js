/*global location*/
sap.ui.define([
	"Jet/ControlTaskChimburArtem/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/routing/History",
	"Jet/ControlTaskChimburArtem/model/formatter",
	'sap/m/MessageToast',
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/core/Fragment"
], function(
	BaseController,
	JSONModel,
	History,
	formatter,
	MessageToast,
	Filter,
	FilterOperator,
	Fragment
) {
	"use strict";

	return BaseController.extend("Jet.ControlTaskChimburArtem.controller.Object", {

		formatter: formatter,

		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */

		/**
		 * Called when the worklist controller is instantiated.
		 * @public
		 */
		onInit: function() {
			// Model used to manipulate control states. The chosen values make sure,
			// detail page is busy indication immediately so there is no break in
			// between the busy indication for loading the view's meta data
			var iOriginalBusyDelay,
				oViewModel = new JSONModel({
					busy: true,
					delay: 0,
					inputValidation:{
						SubGroupText:""
					}
					
				});

			this.getRouter().getRoute("object").attachPatternMatched(this._onObjectMatched, this);

			// Store original busy indicator delay, so it can be restored later on
			iOriginalBusyDelay = this.getView().getBusyIndicatorDelay();
			this.setModel(oViewModel, "objectView");
			this.getOwnerComponent().getModel().metadataLoaded().then(function() {
				// Restore original busy indicator delay for the object view
				oViewModel.setProperty("/delay", iOriginalBusyDelay);
			});
		},

		/* =========================================================== */
		/* event handlers                                              */
		/* =========================================================== */

		/**
		 * Event handler  for navigating back.
		 * It there is a history entry we go one step back in the browser history
		 * If not, it will replace the current entry of the browser history with the worklist route.
		 * @public
		 */
		onNavBack: function() {
			var sPreviousHash = History.getInstance().getPreviousHash();

			if (sPreviousHash !== undefined) {
				history.go(-1);
			} else {
				this.getRouter().navTo("worklist", {}, true);
			}
		},

		/* =========================================================== */
		/* internal methods                                            */
		/* =========================================================== */

		/**
		 * Binds the view to the object path.
		 * @function
		 * @param {sap.ui.base.Event} oEvent pattern match event in route 'object'
		 * @private
		 */
		_onObjectMatched: function(oEvent) {
			var sObjectId = oEvent.getParameter("arguments").objectId;
			this.getModel().metadataLoaded().then(function() {
				var sObjectPath = this.getModel().createKey("zjblessons_base_Groups", {
					GroupID: sObjectId
				});
				this._bindView("/" + sObjectPath);
				MessageToast.show(sObjectId);
			}.bind(this));

		},

		/**
		 * Binds the view to the object path.
		 * @function
		 * @param {string} sObjectPath path to the object to be bound
		 * @private
		 */
		_bindView: function(sObjectPath) {
			var oViewModel = this.getModel("objectView"),
				oDataModel = this.getModel();

			this.getView().bindElement({
				path: sObjectPath,
				events: {
					change: this._onBindingChange.bind(this),
					dataRequested: function() {
						oDataModel.metadataLoaded().then(function() {
							// Busy indicator on view should only be set if metadata is loaded,
							// otherwise there may be two busy indications next to each other on the
							// screen. This happens because route matched handler already calls '_bindView'
							// while metadata is loaded.
							oViewModel.setProperty("/busy", true);
						});
					},
					dataReceived: function() {
						oViewModel.setProperty("/busy", false);
					}
				}
			});
		},

		_onBindingChange: function() {
			var oView = this.getView(),
				oViewModel = this.getModel("objectView"),
				oElementBinding = oView.getElementBinding();

			// No data for the binding
			if (!oElementBinding.getBoundContext()) {
				this.getRouter().getTargets().display("objectNotFound");
				return;
			}

			var oResourceBundle = this.getResourceBundle(),
				oObject = oView.getBindingContext().getObject(),
				sObjectId = oObject.GroupID,
				sObjectName = oObject.Created;

			oViewModel.setProperty("/busy", false);

			oViewModel.setProperty("/shareSendEmailSubject",
				oResourceBundle.getText("shareSendEmailObjectSubject", [sObjectId]));
			oViewModel.setProperty("/shareSendEmailMessage",
				oResourceBundle.getText("shareSendEmailObjectMessage", [sObjectName, sObjectId, location.href]));
		},
		onSearch: function(oEvent) {
			if (oEvent.getParameters().refreshButtonPressed) {
				// Search field's 'refresh' button has been pressed.
				// This is visible if you select any master list item.
				// In this case no new search is triggered, we only
				// refresh the list binding.
				this.onRefresh();
			} else {
				var aTableSearchState = [];
				var sQuery = oEvent.getParameter("query");

				if (sQuery && sQuery.length > 0) {
					aTableSearchState = [new Filter("SubGroupText", FilterOperator.Contains, sQuery)];
					
				}

				this._applySearch(aTableSearchState);
			}

		},
		_applySearch: function(aTableSearchState) {
			var oTable = this.byId("table"),
				oViewModel = this.getModel("objectPageView");
			oTable.getBinding("items").filter(aTableSearchState, "Application");
			// changes the noDataText of the list in case there are no filter results
			if (aTableSearchState.length !== 0) {
				oViewModel.setProperty("/tableNoDataText", this.getResourceBundle().getText("worklistNoDataWithSearchText"));
			}
		},
		onSubGroupDialogOpen: function() {
			var oView = this.getView();

			// create dialog lazily
			if (!this.pSubGroupDialog) {
				this.pSubGroupDialog = Fragment.load({
					id: oView.getId(),
					name: "Jet.ControlTaskChimburArtem.view.SubGroupDialog",
					controller: this
				}).then(function(oDialog) {
					// connect dialog to the root view of this component (models, lifecycle)
					oView.addDependent(oDialog);
					return oDialog;
				});
			}
			this.pSubGroupDialog.then(function(oDialog) {
				oDialog.open();
			});
		},
		onCloseSubGroupDialog: function() {
			this.byId("SubGroupDialog").close();
		
			
		
			this.getModel('objectView').setProperty("/inputValidation/SubGroupText", "");

		},

		onSubGroupSave: function() {

			var oModel = this.getOwnerComponent().getModel();

			var oItemRow = {

				GroupID:this.getView().getBindingContext().getProperty("GroupID"),
				SubGroupText: this.getModel('objectView').getProperty("/inputValidation/SubGroupText"),
				Version: "A",
				
			
				Language: "RU"
			};

			var infoMB = this.getView().getModel("i18n").getResourceBundle().getText("infoMB");
			var sStatusSuccessi18n = this.getView().getModel("i18n").getResourceBundle().getText("messageBoxSuccsess");
			var messageBoxError = this.getView().getModel("i18n").getResourceBundle().getText("messageBoxUpdateError");
			oModel.create("/zjblessons_base_SubGroups", oItemRow, {
				success: function() {
					sap.m.MessageBox.show(sStatusSuccessi18n, {
						icon: sap.m.MessageBox.Icon.SUCCESS,
						title: infoMB
					});

				},
				error: function() {
					sap.m.MessageBox.error(messageBoxError);
				}
			});

			this.onCloseSubGroupDialog();
		}
	

	});

});
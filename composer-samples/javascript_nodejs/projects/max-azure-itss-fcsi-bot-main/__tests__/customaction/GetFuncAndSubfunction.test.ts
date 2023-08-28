import {
	StringExpression,
	StringExpressionConverter,
	ObjectExpression,
	ObjectExpressionConverter,
} from "adaptive-expressions";
import { expect } from "chai";
import sinon, { SinonStub } from "sinon";
import "mocha";
import { GetFuncAndSubfunction } from "custom-actions/src/GetFuncAndSubfunction";
import { DialogContext } from "botbuilder-dialogs";

describe("Get Function and Subfunction", async () => {
	let sandbox: sinon.SinonSandbox;
	beforeEach(() => {
		sandbox = sinon.createSandbox();
	});
	afterEach(() => {
		sandbox.restore();
	});

	it("should end dialog if fails to fetch function and sub function details for Good Intent Score", async () => {
		const dialog = new GetFuncAndSubfunction();
		expect(dialog.id).equals("GetFuncAndSubfunction");

		const intents =  dialog.getConverter("intents");
        const products = dialog.getConverter("products");
        const blobData = dialog.getConverter("blobData");
        const queuesOpen = dialog.getConverter("queuesOpen");
        const genesysEntitiesDetected = dialog.getConverter("genesysEntitiesDetected");
        const resultProperty = dialog.getConverter("resultProperty");

		
  
		expect(intents).instanceOf(ObjectExpressionConverter);
		expect(products).instanceOf(ObjectExpressionConverter);
		expect(blobData).instanceOf(ObjectExpressionConverter);
		expect(queuesOpen).instanceOf(ObjectExpressionConverter);
		expect(genesysEntitiesDetected).instanceOf(ObjectExpressionConverter);		
		expect(resultProperty).instanceOf(StringExpressionConverter);


		dialog.intents = new ObjectExpression([
			[ 'Troubleshoot MS Domain Password Issues', '0.9808432' ],   
			[ 'Login issue', '0.68883795' ],
			[ 'System Lockout', '0.32994387' ],
			[ 'Windows Hello Issue', '0.18082696' ],
			[ 'Outlook Configuration Issue', '0.17154115' ],
			[ 'Timesheets and Reporting Issue', '0.13701992' ],
			[ 'Computer or Desktop or Laptop Slow', '0.10909064' ],      
			[ 'VDI Connectivity Issue', '0.10445849' ],
			[ 'New Printer SetUp or Configuration Issue', '0.08682166' ],
			[ 'MS Authenticator Issue', '0.06971634' ],
			[ 'Admin Access Issue', '0.06883381' ],
			[ 'Access Request Issue', '0.058014262' ],
			[ 'App or Charts Configuration Issue', '0.053067576' ],      
			[ 'Mailbox Issue', '0.049649328' ],
			[ 'Outlook Not Working', '0.037232824' ]
		  ]);

		dialog.products = new ObjectExpression(	[ 'Secure', 'Domains' ]	);

		dialog.blobData = new ObjectExpression(	
			{
				Password: {
				  intents: [
					'MS id request',
					'MS Authenticator Issue',
					'Troubleshoot MS Domain Password Issues',
					'Smartcard Issue',
					'PIN change/Reset',
					'Access Request Issue',
					'Login issue',
					'Windows Hello Issue',
					'Account Lock Issue',
					'Credentials Issue',
					'Password Issue',
					'System Lockout'
				  ],
				  ProductToSubfunctionMapping: {
					'Domains': 'MSPassword',
					'MyID Optum Portal (Smart Card)': 'Smartcard',
					'Microsoft Windows Hello for Business': 'WinHello',
					'Default': 'OtherPassword'
				  }
				},
				Network: {
				  intents: [
					'Citrix or VDI Slow',
					'Slow or No Response',
					'Connectivity Issue',
					'VDI Connectivity Issue',
					'VDI Configuration Specs',
					'How to map a network drive'
				  ],
				  ProductToSubfunctionMapping: {
					'Cisco AnyConnect VPN Client': 'VPN',
					'Citrix (myappsremote.optum.com)': 'Citrix',
					'CITRIX (MYAPPS-ECC.OPTUM.COM)': 'Citrix',
					'Hardware': 'NetworkDrive',
					'Default': 'OtherConnect'
				  }
				}
			  }
		);

		dialog.queuesOpen = new ObjectExpression(	[ 'Password', 'Network' ]	);

		dialog.genesysEntitiesDetected = new ObjectExpression(	[ 'Password', 'Network' ]	);

        dialog.resultProperty = new StringExpression('dialog.res');

          const setValueFake = sinon.fake();
          const endDialogFake = sinon.fake();

          const dc = ({
                state: {
                    setValue: setValueFake,
                },
                endDialog: endDialogFake
          } as unknown) as DialogContext;
          
          await dialog.beginDialog(dc);
          sinon.assert.calledOnceWithExactly(setValueFake, sinon.match.any, 
			{ 
				found: true, 
				function: 'Password', 
				subfunction: 'MSPassword' 
			}
		  );
          sinon.assert.calledOnce(endDialogFake);


	});

	it("should end dialog if fetches function and sub function details for low Intent Score", async () => {
		const dialog = new GetFuncAndSubfunction();
		expect(dialog.id).equals("GetFuncAndSubfunction");

		const intents =  dialog.getConverter("intents");
        const products = dialog.getConverter("products");
        const blobData = dialog.getConverter("blobData");
        const queuesOpen = dialog.getConverter("queuesOpen");
        const genesysEntitiesDetected = dialog.getConverter("genesysEntitiesDetected");
        const resultProperty = dialog.getConverter("resultProperty");

		
  
		expect(intents).instanceOf(ObjectExpressionConverter);
		expect(products).instanceOf(ObjectExpressionConverter);
		expect(blobData).instanceOf(ObjectExpressionConverter);
		expect(queuesOpen).instanceOf(ObjectExpressionConverter);
		expect(genesysEntitiesDetected).instanceOf(ObjectExpressionConverter);		
		expect(resultProperty).instanceOf(StringExpressionConverter);


		dialog.intents = new ObjectExpression([
			[ 'Audio or Headset issue', '0.20171753' ],
			[ 'Computer or Desktop or Laptop Slow', '0.12982012' ],
			[ 'Connectivity Issue', '0.11089489' ],
			[ 'System Lockout', '0.028979896' ],
			[ 'Outlook Configuration Issue', '0.025200654' ],
			[ 'App or Charts Configuration Issue', '0.023601288' ],
			[ 'Damage/Replacement Request Issue', '0.021707153' ],
			[ 'Admin Access Issue', '0.01994969' ],
			[ 'Hardware Issue', '0.01905329' ],
			[ 'New Printer SetUp or Configuration Issue', '0.018299' ],
			[ 'Troubleshoot MS Domain Password Issues', '0.017777538' ],
			[ 'Login issue', '0.01620224' ],
			[ 'Access Request Issue', '0.014556534' ],
			[ 'Windows Hello Issue', '0.013306656' ]
		  ]);

		dialog.products = new ObjectExpression(	[   'Cisco anyconnect vpn client',
		'Headset',
		'Hardware',
		'Cisco AnyConnect VPN Client'
	   ]	);

		dialog.blobData = new ObjectExpression(	
			{
				Password: {
				  intents: [
					'MS id request',
					'MS Authenticator Issue',
					'Troubleshoot MS Domain Password Issues',
					'Smartcard Issue',
					'PIN change/Reset',
					'Access Request Issue',
					'Login issue',
					'Windows Hello Issue',
					'Account Lock Issue',
					'Credentials Issue',
					'Password Issue',
					'System Lockout'
				  ],
				  ProductToSubfunctionMapping: {
					'Domains': 'MSPassword',
					'MyID Optum Portal (Smart Card)': 'Smartcard',
					'Microsoft Windows Hello for Business': 'WinHello',
					'Default': 'OtherPassword'
				  }
				},
				Network: {
				  intents: [
					'Citrix or VDI Slow',
					'Slow or No Response',
					'Connectivity Issue',
					'VDI Connectivity Issue',
					'VDI Configuration Specs',
					'How to map a network drive'
				  ],
				  ProductToSubfunctionMapping: {
					'Cisco AnyConnect VPN Client': 'VPN',
					'Citrix (myappsremote.optum.com)': 'Citrix',
					'CITRIX (MYAPPS-ECC.OPTUM.COM)': 'Citrix',
					'Hardware': 'NetworkDrive',
					'Default': 'OtherConnect'
				  }
				}
			  }
		);

		dialog.queuesOpen = new ObjectExpression(	[ 'Password', 'Network' ]	);

		dialog.genesysEntitiesDetected = new ObjectExpression(	[ 'Network' ]	);

        dialog.resultProperty = new StringExpression('dialog.res');

          const setValueFake = sinon.fake();
          const endDialogFake = sinon.fake();

          const dc = ({
                state: {
                    setValue: setValueFake,
                },
                endDialog: endDialogFake
          } as unknown) as DialogContext;
          
          await dialog.beginDialog(dc);
          sinon.assert.calledOnceWithExactly(setValueFake, sinon.match.any, 
			{ 
				found: false, 
				function: '', 
				subfunction: '' 
			}
		  );
          sinon.assert.calledOnce(endDialogFake);


	});

	it("should end dialog if fetches function and sub function details for Workstation and MacSupport", async () => {
		const dialog = new GetFuncAndSubfunction();
		expect(dialog.id).equals("GetFuncAndSubfunction");

		const intents =  dialog.getConverter("intents");
        const products = dialog.getConverter("products");
        const blobData = dialog.getConverter("blobData");
        const queuesOpen = dialog.getConverter("queuesOpen");
        const genesysEntitiesDetected = dialog.getConverter("genesysEntitiesDetected");
        const resultProperty = dialog.getConverter("resultProperty");

		
  
		expect(intents).instanceOf(ObjectExpressionConverter);
		expect(products).instanceOf(ObjectExpressionConverter);
		expect(blobData).instanceOf(ObjectExpressionConverter);
		expect(queuesOpen).instanceOf(ObjectExpressionConverter);
		expect(genesysEntitiesDetected).instanceOf(ObjectExpressionConverter);		
		expect(resultProperty).instanceOf(StringExpressionConverter);


		dialog.intents = new ObjectExpression([
			[ 'How to map a network drive', '0.8880158' ],
 			[ 'Computer or Desktop or Laptop Slow', '0.8717423' ],      
  			[ 'Slow or No Response', '0.19175597' ],
  			[ 'Connectivity Issue', '0.16321366' ],
  			[ 'System Lockout', '0.0494685' ],
  			[ 'Issues sending receiving email', '0.030794764' ],        
  			[ 'Application Install or uninstall issue', '0.029305134' ],
  			[ 'Audio or Headset issue', '0.027882235' ],
  			[ 'Restart Issue', '0.026896197' ],
  			[ 'Troubleshoot MS Domain Password Issues', '0.015771205' ],
  			[ 'ICUE Issue', '0.01569238' ],
  			[ 'Outlook Configuration Issue', '0.015156406' ],
  			[ 'Admin Access Issue', '0.013990327' ],
  			[ 'Access Request Issue', '0.012884917' ]
		  ]);

		dialog.products = new ObjectExpression(	[   'Mac computer', 'Hardware'  ]	);

		dialog.blobData = new ObjectExpression(	
			{
				Password: {
				  intents: [
					'Access Request Issue',
					'Account Lock Issue',
					'Credentials Issue',
					'Login issue',
					'MS id request',
					'MS Authenticator Issue',
					'Windows Hello Issue',
					'Password Issue',
					'PIN change/Reset',
					'Smartcard Issue',
					'System Lockout',
					'Troubleshoot MS Domain Password Issues',
					'GridCard Issues'
				  ],
				  ProductToSubfunctionMapping: {
					Domains: 'MSPassword',
					'MyID Optum Portal (Smart Card)': 'Smartcard',
					'Microsoft Windows Hello for Business': 'WinHello',
					Default: 'OtherPassword'
				  }
				},
				Network: {
				  intents: [
					'Citrix or VDI Slow',
					'Connectivity Issue',
					'Slow or No Response',
					'How to map a network drive',
					'VDI Configuration Specs',
					'VDI Connectivity Issue'
				  ],
				  ProductToSubfunctionMapping: {
					'Cisco AnyConnect VPN Client': 'VPN',
					'Citrix (myappsremote.optum.com)': 'Citrix',
					'CITRIX (MYAPPS-ECC.OPTUM.COM)': 'Citrix',
					NetworkDrive: 'NetworkDrive',
					Default: 'OtherConnect'
				  }
				},
				Applications: {
				  intents: [
					'Application Install or uninstall issue',
					'Application Issue',
					'Application Configuration Issue',
					'Call Connectivity/Drop Issue',
					'Claims Issue',
					'Issues sending receiving email',
					'Mail Archive Access Issue',
					'Mailbox Issue',
					'Outlook Configuration Issue',
					'Outlook Not Working',
					'ICUE Issue',
					'Unable to join/schedule meetings issue',
					'Unable to share screen issue',
					'Video Issue',
					'Macro Express issue',
					'PCOMM issue',
					'App or Charts Configuration Issue',
					'Aux Issue',
					'Calendar issue',
					'Access Request Issue',
					'Cancel a secure request',
					'Course Error Issue',
					'Course Status Update Issue',
					'Course Video Issue',
					'Distribution List Related Issue',
					'Flash Player Issue',
					'Global Address List /(GAL/) Related Issue',
					'Group membership',
					'Invoice issue',
					'issues with Microsoft Teams',
					'Launch Issue',
					'Portal Data Update Issue',
					'Status of secure request',
					'Submit bulk request',
					'Timesheets and Reporting Issue',
					'Unable to edit or open files',
					'Unable to login to WWE',
					'Unable to save or send or receive files',
					'Fidelity issue',
					'Update an Application Non-User ID'
				  ],
				  ProductToSubfunctionMapping: {
					AppStore: 'AppStore',
					'Microsoft Outlook': 'Outlook',
					'VCC Desktop': 'VCCD',
					'OneDrive O365': 'O365',
					'Genesys Workspace (WWE)': 'GenesysWorkspace',
					Default: 'OtherApp'
				  }
				},
				Workstation: {
				  intents: [
					'Hardware Issue',
					'Laptop charge / power on issue',
					'Monitor / Display Issue',
					'New Printer SetUp or Configuration Issue',
					'Laptop heating Fan Issue',
					'Microsoft Edge Issue',
					'Replacement Computer Program',
					'BSOD',
					'Disk Space',
					'Windows Search Issue',
					'Prompting for Recovery Key ID'
				  ],
				  ProductToSubfunctionMapping: {
					Hardware: 'Hardware',
					'Windows 10': 'Win10',
					'Microsoft Edge': 'WebBrowser',
					'Google Chrome': 'WebBrowser',
					'Internet Explorer': 'WebBrowser',
					Default: 'OtherWorkStation'
				  }
				},
				MACSupport: { intents: [], ProductToSubfunctionMapping: {} },
				'Workstation-MACSupport': {
				  intents: [
					'Hardware Issue',
					'Laptop charge / power on issue',
					'Monitor / Display Issue',
					'New Printer SetUp or Configuration Issue',
					'Laptop heating Fan Issue',
					'Microsoft Edge Issue',
					'Replacement Computer Program',
					'Admin Access Issue',
					'Audio or Headset issue',
					'Battery Issue',
					'Camera Issue',
					'Computer or Desktop or Laptop Slow',
					'Damage/Replacement Request Issue',
					'Intel Firmware',
					'Restart Issue',
					'System Issue',
					'System Reimage'
				  ],
				  ProductToSubfunctionMapping: {}
				}
			  }
		);

		dialog.queuesOpen = new ObjectExpression(	[ 'Password',
		'Applications',
		'Network',
		'Workstation',
		'MACSupport',
		'Ticket Status',
		'Other Issue'  ]	);

		dialog.genesysEntitiesDetected = new ObjectExpression(	[ 'MACSupport', 'Workstation' ]	);

        dialog.resultProperty = new StringExpression('dialog.res');

          const setValueFake = sinon.fake();
          const endDialogFake = sinon.fake();

          const dc = ({
                state: {
                    setValue: setValueFake,
                },
                endDialog: endDialogFake
          } as unknown) as DialogContext;
          
          await dialog.beginDialog(dc);
          sinon.assert.calledOnceWithExactly(setValueFake, sinon.match.any, 
			{ 
				found: true, 
				function: 'MACSupport'
			}
		  );
          sinon.assert.calledOnce(endDialogFake);
	});


});
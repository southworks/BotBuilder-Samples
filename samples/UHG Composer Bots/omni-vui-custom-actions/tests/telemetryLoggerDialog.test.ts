import {
  TelemetryLoggerDialog,
  TelemetryPropertiesConverter,
  LogType

} from "../src/telemetryLoggerDialog";
import { DialogContext } from "botbuilder-dialogs";
import { expect } from "chai";
import * as sinon from "sinon";
import "mocha";
import { BotTelemetryClient, NullTelemetryClient } from "botbuilder";
import {
  BoolExpression,
  BoolExpressionConverter,
  EnumExpression,
  EnumExpressionConverter,
  ObjectExpression,
  ObjectExpressionConverter,
  StringExpression,
  StringExpressionConverter,
} from "adaptive-expressions";

describe("Telemetry Logger Dialog", () => {
  let sandbox: sinon.SinonSandbox;
  let telemetryClient: BotTelemetryClient;
  beforeEach(() => {
    sandbox = sinon.createSandbox();
    telemetryClient = new NullTelemetryClient();
  });
  afterEach(() => {
    sandbox.restore();
  });

  context("Encrypt Values", () => {
    it("should send event telemetry in encrypted form", () => {
      const telemetrySpy = sandbox.spy(telemetryClient, "trackEvent");
      const eventName = "testEvent";
      const ekey = "vOVH6sdmpNWjRRIqCc7rdxs01lwHzfr3";
      const env = "PROD"
      const logoption = LogType.encrypted;
      const properties = { "key1": "secret message" }
      const dialog = new TelemetryLoggerDialog(eventName, ekey, env, logoption, properties);


      expect(dialog.id).equals("TelemetryLoggerDialog[=`testEvent`]");
      dialog.telemetryClient = telemetryClient;

      const eventNameConvert = dialog.getConverter("eventName");
      const propertiesConvert = dialog.getConverter("properties");
      const statusConvert = dialog.getConverter("disabled");
      const logTypeConvert = dialog.getConverter("logType");
      const undefConvert = dialog.getConverter("id");
      expect(eventNameConvert).instanceOf(StringExpressionConverter);
     expect(statusConvert).instanceOf(BoolExpressionConverter);
      expect(logTypeConvert).instanceOf(EnumExpressionConverter);
      expect(propertiesConvert).instanceOf(TelemetryPropertiesConverter);
      expect(undefConvert).to.be.undefined;
      const value = new StringExpression("secret message");
      dialog.eventName = new StringExpression("testEvent");
      dialog.properties = { "key1": value };
      const endDialogFake = sandbox.fake();
      const dc = ({
        endDialog: endDialogFake,
      } as unknown) as DialogContext;
      dialog.beginDialog(dc);
      sinon.assert.calledOnce(endDialogFake);

    });
  });
  context("Plain text Values", () => {
    it("should send event telemetry in plain text form", () => {
      const telemetrySpy = sandbox.spy(telemetryClient, "trackEvent");
      const eventName = "testEvent";
      const ekey = "vOVH6sdmpNWjRRIqCc7rdxs01lwHzfr3";
      const env = "dev"
      const logoption = LogType.encrypted;
      const properties = { "key1": "secret message" }
      const dialog = new TelemetryLoggerDialog(eventName, ekey, env, logoption, properties);


      expect(dialog.id).equals("TelemetryLoggerDialog[=`testEvent`]");
      dialog.telemetryClient = telemetryClient;

      const eventNameConvert = dialog.getConverter("eventName");
      const propertiesConvert = dialog.getConverter("properties");
      const statusConvert = dialog.getConverter("disabled");
      const logTypeConvert = dialog.getConverter("logType");
      const undefConvert = dialog.getConverter("id");
      expect(eventNameConvert).instanceOf(StringExpressionConverter);
     expect(statusConvert).instanceOf(BoolExpressionConverter);
      expect(logTypeConvert).instanceOf(EnumExpressionConverter);
      expect(propertiesConvert).instanceOf(TelemetryPropertiesConverter);
      expect(undefConvert).to.be.undefined;
      const value = new StringExpression("secret message");
      dialog.eventName = new StringExpression("testEvent");
      dialog.properties = { "key1": value };
      const endDialogFake = sandbox.fake();
      const dc = ({
        endDialog: endDialogFake,
      } as unknown) as DialogContext;
      dialog.beginDialog(dc);
      sinon.assert.calledOnce(endDialogFake);

    });
  });
  context("Encrypted Option with key prefix #PT#", () => {
    it("should send event telemetry in plain text form", () => {
      const telemetrySpy = sandbox.spy(telemetryClient, "trackEvent");
      const eventName = "testEvent";
      const ekey = "vOVH6sdmpNWjRRIqCc7rdxs01lwHzfr3";
      const env = "PROD"
      const logoption = LogType.encrypted;
      const properties = { "#PT#key2": "secret message" }
      const dialog = new TelemetryLoggerDialog(eventName, ekey, env, logoption, properties);


      expect(dialog.id).equals("TelemetryLoggerDialog[=`testEvent`]");
      dialog.telemetryClient = telemetryClient;

      const eventNameConvert = dialog.getConverter("eventName");
      const propertiesConvert = dialog.getConverter("properties");
      const statusConvert = dialog.getConverter("disabled");
      const logTypeConvert = dialog.getConverter("logType");
      const undefConvert = dialog.getConverter("id");
      expect(eventNameConvert).instanceOf(StringExpressionConverter);
     expect(statusConvert).instanceOf(BoolExpressionConverter);
      expect(logTypeConvert).instanceOf(EnumExpressionConverter);
      expect(propertiesConvert).instanceOf(TelemetryPropertiesConverter);
      expect(undefConvert).to.be.undefined;
      const name = new StringExpression("#PT#key2");
      const value = new StringExpression("secret message2");
      dialog.eventName = new StringExpression("testEventName");
      dialog.properties = { name: value };
      const endDialogFake = sandbox.fake();
      const dc = ({
        endDialog: endDialogFake,
      } as unknown) as DialogContext;
      dialog.beginDialog(dc);
      sinon.assert.calledOnce(endDialogFake);

    });
  });

  context("Encrypted Option with key length less then 32", () => {
    it("should send event telemetry in plain text form", () => {
      const telemetrySpy = sandbox.spy(telemetryClient, "trackEvent");
      const eventName = "testEvent";
      const ekey = "vOVH6sdmpNWjRRIqCc7rdxs01lwHzfr3";
      const env = "PROD"
      const logoption = LogType.plaintext;
      const properties = { "#PT#key2": "secret message" }
      const dialog = new TelemetryLoggerDialog(eventName, ekey, env, logoption, properties);


      expect(dialog.id).equals("TelemetryLoggerDialog[=`testEvent`]");
      dialog.telemetryClient = telemetryClient;

      const eventNameConvert = dialog.getConverter("eventName");
      const propertiesConvert = dialog.getConverter("properties");
      const statusConvert = dialog.getConverter("disabled");
      const logTypeConvert = dialog.getConverter("logType");
      const undefConvert = dialog.getConverter("id");
      expect(eventNameConvert).instanceOf(StringExpressionConverter);
     expect(statusConvert).instanceOf(BoolExpressionConverter);
      expect(logTypeConvert).instanceOf(EnumExpressionConverter);
      expect(propertiesConvert).instanceOf(TelemetryPropertiesConverter);
      expect(undefConvert).to.be.undefined;
      const name = new StringExpression("#PT#key2");
      const value = new StringExpression("secret message2");
      dialog.eventName = new StringExpression("testEventName");
      dialog.properties = { name: value };
      const endDialogFake = sandbox.fake();
      const dc = ({
        endDialog: endDialogFake,
      } as unknown) as DialogContext;
      dialog.beginDialog(dc);
      sinon.assert.calledOnce(endDialogFake);

    });
  });
  context("No Encryption Key", () => {
    it("should send event telemetry in plain text form", () => {
      const telemetrySpy = sandbox.spy(telemetryClient, "trackEvent");
      const eventName = "testEvent";
      const ekey = " ";
      const env = "PROD"
      const logoption = LogType.encrypted;
      const properties = { "key1": "secret message" }
      const dialog = new TelemetryLoggerDialog(eventName, ekey, env, logoption, properties);


      expect(dialog.id).equals("TelemetryLoggerDialog[=`testEvent`]");
      dialog.telemetryClient = telemetryClient;

      const eventNameConvert = dialog.getConverter("eventName");
      const propertiesConvert = dialog.getConverter("properties");
      const statusConvert = dialog.getConverter("disabled");
      const logTypeConvert = dialog.getConverter("logType");
      const undefConvert = dialog.getConverter("id");
      expect(eventNameConvert).instanceOf(StringExpressionConverter);
     expect(statusConvert).instanceOf(BoolExpressionConverter);
      expect(logTypeConvert).instanceOf(EnumExpressionConverter);
      expect(propertiesConvert).instanceOf(TelemetryPropertiesConverter);
      expect(undefConvert).to.be.undefined;
      const value = new StringExpression("secret message");
      dialog.eventName = new StringExpression("testEvent");
      dialog.properties = { "key1": value };
      const endDialogFake = sandbox.fake();
      const dc = ({
        endDialog: endDialogFake,
      } as unknown) as DialogContext;
      dialog.beginDialog(dc);
      sinon.assert.calledOnce(endDialogFake);

    });
  });

});

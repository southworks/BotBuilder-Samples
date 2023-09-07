import {
  FlushTelemetry,
  SendTraceTelemetry,
  SendEventTelemetry,
} from "../src/telemetryDialog";
import { DialogContext } from "botbuilder-dialogs";
import { expect } from "chai";
import * as sinon from "sinon";
import "mocha";
import { BotTelemetryClient, NullTelemetryClient } from "botbuilder";
import {
  ObjectExpression,
  ObjectExpressionConverter,
  StringExpression,
  StringExpressionConverter,
} from "adaptive-expressions";

describe("Telemetry Dialog", () => {
  let sandbox: sinon.SinonSandbox;
  let telemetryClient: BotTelemetryClient;
  beforeEach(() => {
    sandbox = sinon.createSandbox();
    telemetryClient = new NullTelemetryClient();
  });
  afterEach(() => {
    sandbox.restore();
  });

  context("Track Trace", () => {
    it("should send trace telemetry", () => {
      const telemetrySpy = sandbox.spy(telemetryClient, "trackTrace");
      const dialog = new SendTraceTelemetry();
      expect(dialog.id).equals("SendTraceTelemetry");
      dialog.telemetryClient = telemetryClient;

      const messageConvert = dialog.getConverter("message");
      const propertiesConvert = dialog.getConverter("properties");
      const undefConvert = dialog.getConverter("id");
      expect(messageConvert).instanceOf(StringExpressionConverter);
      expect(propertiesConvert).instanceOf(ObjectExpressionConverter);
      expect(undefConvert).to.be.undefined;

      dialog.message = new StringExpression("message");
      dialog.properties = new ObjectExpression({});
      const endDialogFake = sandbox.fake();
      const dc = ({
        endDialog: endDialogFake,
      } as unknown) as DialogContext;
      dialog.beginDialog(dc);
      sinon.assert.calledOnce(endDialogFake);
      sinon.assert.calledOnceWithExactly(telemetrySpy, {
        message: "message",
        properties: {},
      });
    });
  });

  context("Track Event", () => {
    it("should send event telemetry", () => {
      const telemetrySpy = sandbox.spy(telemetryClient, "trackEvent");
      const dialog = new SendEventTelemetry();
      expect(dialog.id).equals("SendEventTelemetry");
      dialog.telemetryClient = telemetryClient;

      const nameConvert = dialog.getConverter("name");
      const propertiesConvert = dialog.getConverter("properties");
      const undefConvert = dialog.getConverter("id");
      expect(nameConvert).instanceOf(StringExpressionConverter);
      expect(propertiesConvert).instanceOf(ObjectExpressionConverter);
      expect(undefConvert).to.be.undefined;

      dialog.name = new StringExpression("name");
      dialog.properties = new ObjectExpression({});
      const endDialogFake = sandbox.fake();
      const dc = ({
        endDialog: endDialogFake,
      } as unknown) as DialogContext;
      dialog.beginDialog(dc);
      sinon.assert.calledOnce(endDialogFake);
      sinon.assert.calledOnceWithExactly(telemetrySpy, {
        name: "name",
        properties: {},
      });
    });
  });

  context("Flush", () => {
    it("should flush telemetry", () => {
      const telemetrySpy = sandbox.spy(telemetryClient, "flush");
      const dialog = new FlushTelemetry();
      expect(dialog.id).equals("FlushTelemetry");
      dialog.telemetryClient = telemetryClient;

      const endDialogFake = sandbox.fake();
      const dc = ({
        endDialog: endDialogFake,
      } as unknown) as DialogContext;
      dialog.beginDialog(dc);
      sinon.assert.calledOnce(endDialogFake);
      sinon.assert.calledOnce(telemetrySpy);
    });
  });
});

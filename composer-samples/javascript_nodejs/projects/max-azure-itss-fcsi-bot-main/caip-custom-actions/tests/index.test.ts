import CustomActionBotComponent from "../src/index";
import * as sinon from "sinon";
import {
  Configuration,
  ServiceCollection,
} from "botbuilder-dialogs-adaptive-runtime-core";
import "mocha";
import { ComponentDeclarativeTypes } from "botbuilder-dialogs-declarative";
import { expect } from "chai";

describe("Custom Action Index", () => {
  let sandbox: sinon.SinonSandbox;
  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });
  afterEach(() => {
    sandbox.restore();
  });

  it("should register custom actions", () => {
    const composeFactoryStub = sandbox.stub();
    const registration = new CustomActionBotComponent();
    const service = {
      composeFactory: composeFactoryStub,
    } as unknown as ServiceCollection;
    registration.configureServices(service, {} as Configuration);
    sinon.assert.calledOnceWithExactly(
      composeFactoryStub,
      "declarativeTypes",
      sinon.match.any
    );

    const typesConcatStub = sandbox.stub();
    const types = {
      concat: typesConcatStub,
    } as unknown as ComponentDeclarativeTypes[];
    const fn = composeFactoryStub.getCall(0).args[1];
    fn(types);
    sinon.assert.calledOnce(typesConcatStub);

    const getTypes = typesConcatStub.getCall(0).args[0];
    const arr = getTypes.getDeclarativeTypes();
    expect(arr.length).equals(14);
  });
});

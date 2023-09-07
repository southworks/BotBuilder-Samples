import { replaceJsonRecursively } from "../src/jsonExtensions";
import { DialogStateManager } from "botbuilder-dialogs";
import { expect } from "chai";

describe("Json Extension", () => {
  it("should return string value", () => {
    const value = "=test";
    const obj = ({ test: "Value" } as unknown) as DialogStateManager;
    const res = replaceJsonRecursively(obj, value);
    expect(res).equals("Value");
  });

  it("should return array value", () => {
    const values = ["=test1", "=test2", "=test3"];
    const obj = ({
      test1: "Value1",
      test2: "Value2",
    } as unknown) as DialogStateManager;
    const expected = ["Value1", "Value2", undefined];
    const res = replaceJsonRecursively(obj, values);
    expect(res).eql(expected);
  });

  it("should return object value", () => {
    const values = { 1: "=test1", 2: "=test2", 3: "=test3" };
    const obj = ({
      test1: "Value1",
      test3: "Value3",
    } as unknown) as DialogStateManager;
    const expected = { 1: "Value1", 2: undefined, 3: "Value3" };
    const res = replaceJsonRecursively(obj, values);
    expect(res).eql(expected);
  });
});

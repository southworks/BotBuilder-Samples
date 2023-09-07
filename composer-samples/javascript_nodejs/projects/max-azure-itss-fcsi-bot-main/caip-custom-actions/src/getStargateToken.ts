// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import {
  Expression,
  StringExpression,
  StringExpressionConverter,
} from "adaptive-expressions";
import {
  Converter,
  ConverterFactory,
  Dialog,
  DialogConfiguration,
  DialogContext,
  DialogTurnResult,
} from "botbuilder-dialogs";
import * as JWT from "jsonwebtoken";

const STARGATE_TOKEN_VALIDITY_SECONDS = 30;
const STARGATE_TOKEN_SIGNING_ALGORITHM = "HS256";
type STRING = string | Expression | StringExpression;

export interface GetStargateTokenConfiguration extends DialogConfiguration {
  key: STRING;
  secret: STRING;
  resultProperty?: STRING;
}

export class GetStargateToken
  extends Dialog
  implements GetStargateTokenConfiguration
{
  public static $kind = "GetStargateToken";

  public key: StringExpression = new StringExpression();
  public secret: StringExpression = new StringExpression();
  public resultProperty?: StringExpression;

  public getConverter(
    property: keyof GetStargateTokenConfiguration
  ): Converter | ConverterFactory {
    switch (property) {
      case "key":
        return new StringExpressionConverter();
      case "secret":
        return new StringExpressionConverter();
      case "resultProperty":
        return new StringExpressionConverter();
      default:
        return super.getConverter(property);
    }
  }

  public beginDialog(dc: DialogContext): Promise<DialogTurnResult> {
    const stargateKey = this.key.getValue(dc.state);
    const stargateSecret = this.secret.getValue(dc.state);

    const signingOptions = {
      algorithm: STARGATE_TOKEN_SIGNING_ALGORITHM,
    };
    const tokenSeconds = STARGATE_TOKEN_VALIDITY_SECONDS;
    const iat = this.currentTime();
    const exp = iat + tokenSeconds;
    const payload = {
      iat: iat,
      exp: exp,
      iss: stargateKey,
    };
    const result = JWT.sign(payload, stargateSecret, { algorithm: "HS256" });
    if (this.resultProperty) {
      dc.state.setValue(this.resultProperty.getValue(dc.state), result);
    }

    return dc.endDialog(result);
  }

  protected onComputeId(): string {
    return "GetStargateToken";
  }

  protected currentTime() {
    return Math.floor(Date.now() / 1000);
  }
}

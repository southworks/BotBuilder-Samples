// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { BotComponent } from "botbuilder";
import { ComponentDeclarativeTypes } from "botbuilder-dialogs-declarative";
import {
  ServiceCollection,
  Configuration,
} from "botbuilder-dialogs-adaptive-runtime-core";

import { CAIPQuestionnaireDialog } from "./CAIPQuestionnaireDialog";
import { CAIPRatingDialog } from "./CAIPRatingDialog";
import { FlushTelemetry } from "./FlushTelemetry";
import { GetStargateToken } from "./GetStargateToken";
import { GetTranscriptDialog } from "./GetTranscriptDialog";
import { MultiplyDialog } from "./MultiplyDialog";
import { SendEventTelemetry } from "./SendEventTelemetry";
import { SendTraceTelemetry } from "./SendTraceTelemetry";
import { StargateProvider } from "./StargateProvider";
import { TypingDelayIndicator } from "./TypingDelayIndicator";

export default class MultiplyDialogBotComponent extends BotComponent {
  configureServices(
    services: ServiceCollection,
    _configuration: Configuration
  ): void {
    services.composeFactory<ComponentDeclarativeTypes[]>(
      "declarativeTypes",
      (declarativeTypes) =>
        declarativeTypes.concat({
          getDeclarativeTypes() {
            return [
              {
                kind: CAIPQuestionnaireDialog.$kind,
                type: CAIPQuestionnaireDialog,
              },
              {
                kind: CAIPRatingDialog.$kind,
                type: CAIPRatingDialog,
              },
              {
                kind: FlushTelemetry.$kind,
                type: FlushTelemetry,
              },
              {
                kind: GetStargateToken.$kind,
                type: GetStargateToken,
              },
              {
                kind: GetTranscriptDialog.$kind,
                type: GetTranscriptDialog,
              },
              {
                kind: MultiplyDialog.$kind,
                type: MultiplyDialog,
              },
              {
                kind: SendEventTelemetry.$kind,
                type: SendEventTelemetry,
              },
              {
                kind: SendTraceTelemetry.$kind,
                type: SendTraceTelemetry,
              },
              {
                kind: StargateProvider.$kind,
                type: StargateProvider,
              },
              {
                kind: TypingDelayIndicator.$kind,
                type: TypingDelayIndicator,
              },
            ];
          },
        })
    );
  }
}

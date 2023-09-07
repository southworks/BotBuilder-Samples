// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { BotComponent } from "botbuilder";
import { MultiplyDialog } from "./multiplyDialog";
import {
  FlushTelemetry,
  SendEventTelemetry,
  SendTraceTelemetry,
} from "./telemetryDialog";
import { TypingDelayDialog } from "./typingDelayDialog";
import {LiveAgentTypingIndicatorDialog} from "./liveAgentTypingIndicator"
import { GetStargateToken } from "./getStargateToken";
import { GetTranscriptDialog } from "./getTranscriptDialog";

import { ComponentDeclarativeTypes } from "botbuilder-dialogs-declarative";

import {
  ServiceCollection,
  Configuration,
} from "botbuilder-dialogs-adaptive-runtime-core";
import { StargateProvider } from "./stargateProvider";
import { CAIPRatingDialog } from './caipRatingDialog';
import { CAIPQuestionnaireDialog } from './caipQuestionnaireDialog';
import { ConversationIdDialog } from "./conversationIdDialog";
import { LivePersonContext } from "./livePersonContext";
import { LivePersonStructureElements } from "./livePersonStructureElements";

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
                kind: MultiplyDialog.$kind,
                type: MultiplyDialog,
              },
              {
                kind: FlushTelemetry.$kind,
                type: FlushTelemetry,
              },
              {
                kind: SendEventTelemetry.$kind,
                type: SendEventTelemetry,
              },
              {
                kind: ConversationIdDialog.$kind,
                type: ConversationIdDialog,
              },
              {
                kind: SendTraceTelemetry.$kind,
                type: SendTraceTelemetry,
              },
              {
                kind: TypingDelayDialog.$kind,
                type: TypingDelayDialog,
              },
              {
                kind: LiveAgentTypingIndicatorDialog.$kind,
                type: LiveAgentTypingIndicatorDialog,
              },
              {
                kind: GetStargateToken.$kind,
                type: GetStargateToken,
              },
              {
                kind: StargateProvider.$kind,
                type: StargateProvider,
              },
              {
                kind: GetTranscriptDialog.$kind,
                type: GetTranscriptDialog,
              },
              {
                kind: CAIPRatingDialog.$kind,
                type: CAIPRatingDialog,
              },
              {
                kind: CAIPQuestionnaireDialog.$kind,
                type: CAIPQuestionnaireDialog,
              },
              {
                kind: LivePersonContext.$kind,
                type: LivePersonContext,
              },
              {
                kind: LivePersonStructureElements.$kind,
                type: LivePersonStructureElements,
              }

            ];
          },
        })
    );
  }
}

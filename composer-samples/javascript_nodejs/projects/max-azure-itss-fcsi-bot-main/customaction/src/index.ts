// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { BotComponent } from "botbuilder";
import { SendAttachment } from "./sendAttachment";
import { TopThreeIntents } from "./topThreeIntents";
import { ShowComments } from "./showComments";
import { ConvertDateCT } from "./convertDateCT";
import { RemoveSpecialCharacters } from "./removeSpecialCharacters";
import { SendEvent } from "./sendEvent";
import { StringIncludes } from "./stringIncludes";
import { ConvertCSTtoUTC } from "./convertCSTtoUTC";
import { GetFuncAndSubfunction } from "./GetFuncAndSubfunction";
// CAIP
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

import { ComponentDeclarativeTypes } from "botbuilder-dialogs-declarative";

import {
	ServiceCollection,
	Configuration,
} from "botbuilder-dialogs-adaptive-runtime-core";

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
								kind: SendAttachment.$kind,
								type: SendAttachment,
							},
							{
								kind: TopThreeIntents.$kind,
								type: TopThreeIntents,
							},
							{
								kind: ShowComments.$kind,
								type: ShowComments,
							},
							{
								kind: ConvertDateCT.$kind,
								type: ConvertDateCT,
							},
							{
								kind: RemoveSpecialCharacters.$kind,
								type: RemoveSpecialCharacters,
							},
							{
								kind: SendEvent.$kind,
								type: SendEvent,
							},
							{
								kind: StringIncludes.$kind,
								type: StringIncludes,
							},
							{
								kind: ConvertCSTtoUTC.$kind,
								type: ConvertCSTtoUTC,
							},
							{
								kind: GetFuncAndSubfunction.$kind,
								type: GetFuncAndSubfunction,
							},
							// CAIP
							
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

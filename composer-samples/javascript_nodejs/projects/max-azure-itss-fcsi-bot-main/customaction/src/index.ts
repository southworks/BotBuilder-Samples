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
							}
						];
					},
				})
		);
	}
}

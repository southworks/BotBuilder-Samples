// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import {
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

export interface ShowCommentsConfiguration extends DialogConfiguration {
	comments: string | StringExpression;
	resultProperty?: string | StringExpression;
}

export class ShowComments extends Dialog implements ShowCommentsConfiguration {
	public static $kind = "ShowComments";

	public comments: StringExpression = new StringExpression();
	public resultProperty?: StringExpression;

	public getConverter(
		property: keyof ShowCommentsConfiguration
	): Converter | ConverterFactory {
		switch (property) {
			case "comments":
				return new StringExpressionConverter();
			case "resultProperty":
				return new StringExpressionConverter();
			default:
				return super.getConverter(property);
		}
	}

	public beginDialog(dc: DialogContext): Promise<DialogTurnResult> {
		const comments = this.comments.getValue(dc.state);

		const arr: Array<any> = comments.split("\n\n");
		const middleComments: Array<any> = [];
		const finalComments: Array<any> = [];

		const regexOne = new RegExp(/\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}:\d{2}/g);
		const regexTwo = new RegExp(/(\(Additional comments\))/g);
		const regexName = new RegExp(
			/(?<=\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}:\d{2} - )(.*)(?= \((Additional comments))/g
		);

		function confirmComment(comment: string) {
			const matchOne = comment.match(regexOne);
			const matchTwo = comment.match(regexTwo);
			if (matchOne !== null && matchTwo !== null) {
				middleComments.push(comment);
			}
		}

		for (let i = 0; i < arr.length; i++) {
			confirmComment(arr[i]);
		}

		for (let j = 0; j < middleComments.length; j++) {
			const date = middleComments[j]
				.split("(Additional comments)")[0]
				.match(regexOne)[0];
			const name = middleComments[j].match(regexName)[0];
			const comment = middleComments[j]
				.split("(Additional comments)")[1]
				.replace(/(\r|\n|\t|\\|"|\\t|\\n)/g, " ");
			const a: Array<any> = [`${date}`, `${name}`, `${comment}`];
			finalComments.push(a);
		}

		const result = finalComments;

		if (this.resultProperty) {
			dc.state.setValue(this.resultProperty.getValue(dc.state), result);
		}

		return dc.endDialog(result);
	}

	protected onComputeId(): string {
		return "ShowComments";
	}
}

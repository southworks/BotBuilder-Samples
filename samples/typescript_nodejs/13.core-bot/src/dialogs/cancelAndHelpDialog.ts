// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { InputHints } from 'botbuilder';
import { ComponentDialog, DialogContext, DialogTurnResult, DialogTurnStatus } from 'botbuilder-dialogs';

/**
 * This base class watches for common phrases like "help" and "cancel" and takes action on them
 * BEFORE they reach the normal bot logic.
 */
export class CancelAndHelpDialog extends ComponentDialog {
    constructor(id: string) {
        super(id);
    }

    public async onContinueDialog(innerDc: DialogContext): Promise<DialogTurnResult> {
        const result = await this.interrupt(innerDc);
        if (result) {
            return result;
        }
        return await super.onContinueDialog(innerDc);
    }

    private async interrupt(innerDc: DialogContext): Promise<DialogTurnResult|undefined> {
        if (innerDc.context.activity.text) {
            const text = innerDc.context.activity.text.toLowerCase();

            switch (text) {
            case 'help':
            case '?':{
                const helpMessageText = 'Show help here';
                await innerDc.context.sendActivity(helpMessageText, helpMessageText, InputHints.ExpectingInput);
                return { status: DialogTurnStatus.waiting };
            }
            case 'cancel':
            case 'quit':{
                const cancelMessageText = 'Cancelling...';
                await innerDc.context.sendActivity(cancelMessageText, cancelMessageText, InputHints.IgnoringInput);
                return await innerDc.cancelAllDialogs();
            }
            }
        }
    }
}

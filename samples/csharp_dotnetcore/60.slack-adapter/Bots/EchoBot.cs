// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

using System.IO;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Bot.Builder;
using Microsoft.Bot.Builder.Adapters.Slack.Model;
using Microsoft.Bot.Schema;
using Newtonsoft.Json;
using SlackAPI;
using Attachment = Microsoft.Bot.Schema.Attachment;
using Microsoft.Bot.Builder.Dialogs;

namespace Microsoft.BotBuilderSamples.Bots
{
    /// <summary>
    /// An EchoBot class that extends from the ActivityHandler.
    /// </summary>
    public class EchoBot<T> : ActivityHandler where T : Bot.Builder.Dialogs.Dialog
    {
        private readonly BotState _userState;
        private readonly BotState _conversationState;
        private readonly Bot.Builder.Dialogs.Dialog _dialog;

        public EchoBot(ConversationState conversationState, UserState userState, T dialog)
        {
            _conversationState = conversationState;
            _userState = userState;
            _dialog = dialog;
        }

        public override async Task OnTurnAsync(ITurnContext turnContext, CancellationToken cancellationToken = default(CancellationToken))
        {
            await base.OnTurnAsync(turnContext, cancellationToken);

            // Save any state changes that might have occurred during the turn.
            await _conversationState.SaveChangesAsync(turnContext, false, cancellationToken);
            await _userState.SaveChangesAsync(turnContext, false, cancellationToken);
        }

        /// <summary>
        /// OnMessageActivityAsync method that returns an async Task.
        /// </summary>
        /// <param name="turnContext">turnContext of ITurnContext{T}, where T is an IActivity.</param>
        /// <param name="cancellationToken">cancellationToken propagates notifications that operations should be canceled.</param>
        /// <returns>A <see cref="Task{TResult}"/> representing the result of the asynchronous operation.</returns>
        protected override async Task OnMessageActivityAsync(ITurnContext<IMessageActivity> turnContext, CancellationToken cancellationToken)
        {
            /*if (turnContext.Activity.Text.Contains("testing"))
            {
                var interactiveMessage = MessageFactory.Attachment(
                        CreateInteractiveMessage(
                            Directory.GetCurrentDirectory() + @"\Resources\blockkit.json"));
                await turnContext.SendActivityAsync(interactiveMessage, cancellationToken);
            }*/

            await _dialog.RunAsync(turnContext, _conversationState.CreateProperty<DialogState>("DialogState"), cancellationToken);
        }

        /// <summary>
        /// OnEventActivityAsync method that returns an async Task.
        /// </summary>
        /// <param name="turnContext">turnContext of ITurnContext{T}, where T is an IActivity.</param>
        /// <param name="cancellationToken">cancellationToken propagates notifications that operations should be canceled.</param>
        /// <returns>A <see cref="Task{TResult}"/> representing the result of the asynchronous operation.</returns>
        protected override async Task OnEventActivityAsync(ITurnContext<IEventActivity> turnContext, CancellationToken cancellationToken)
        {
            if (turnContext.Activity.Name == "Command")
            {
                if (turnContext.Activity.Value.ToString() == "/block")
                {
                    var interactiveMessage = MessageFactory.Attachment(
                        CreateInteractiveMessage(
                            Directory.GetCurrentDirectory() + @"\Resources\InteractiveMessage.json"));
                    await turnContext.SendActivityAsync(interactiveMessage, cancellationToken);
                }
            }

            if (turnContext.Activity.Value is EventType slackEvent)
            {
                if (slackEvent.Type == "message")
                {
                    if (slackEvent.AdditionalProperties.ContainsKey("subtype") &&
                        slackEvent.AdditionalProperties["subtype"].ToString() == "file_share")
                    {
                        await turnContext.SendActivityAsync(MessageFactory.Text("Echo: I received an attachment"), cancellationToken);
                    }

                    if (slackEvent.AdditionalProperties.ContainsKey("subtype") &&
                        slackEvent.AdditionalProperties["subtype"].ToString() == "link_shared")
                    {
                        await turnContext.SendActivityAsync(MessageFactory.Text("Echo: I received a link share"), cancellationToken);
                    }
                }
            }
        }

        private static Attachment CreateInteractiveMessage(string filePath)
        {
            var interactiveMessageJson = System.IO.File.ReadAllText(filePath);
            var adaptiveCardAttachment = JsonConvert.DeserializeObject<Block[]>(interactiveMessageJson);

            var blockList = adaptiveCardAttachment.ToList();

            var attachment = new Attachment
            {
                Content = blockList,
                ContentType = "application/json",
                Name = "blocks",
            };

            return attachment;
        }
    }
}

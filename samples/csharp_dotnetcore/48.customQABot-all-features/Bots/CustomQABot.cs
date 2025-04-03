// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Azure.AI.Language.QuestionAnswering;
using Azure.Identity;
using Azure;
using Microsoft.Bot.Builder;
using Microsoft.Bot.Builder.Dialogs;
using Microsoft.Bot.Schema;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace Microsoft.BotBuilderSamples.Bots
{
    public class CustomQABot<T> : ActivityHandler where T : Dialog
    {
        private readonly BotState _conversationState;
        private readonly Dialog _dialog;
        private readonly BotState _userState;
        private readonly ILogger _logger;
        private readonly string _defaultWelcome = "Hello and Welcome";

        public IConfiguration Configuration { get; private set; }

        public CustomQABot(IConfiguration configuration, ConversationState conversationState, UserState userState, T dialog, ILogger<CustomQABot<T>> logger)
        {
            var welcomeMsg = configuration["DefaultWelcomeMessage"];
            if (!string.IsNullOrWhiteSpace(welcomeMsg))
            {
                _defaultWelcome = welcomeMsg;
            }

            _conversationState = conversationState;
            _userState = userState;
            _dialog = dialog;
            _logger = logger;
            Configuration = configuration;
        }

        public override async Task OnTurnAsync(ITurnContext turnContext, CancellationToken cancellationToken = default)
        {
            await base.OnTurnAsync(turnContext, cancellationToken);

            // Save any state changes that might have occurred during the turn.
            await _conversationState.SaveChangesAsync(turnContext, false, cancellationToken);
            await _userState.SaveChangesAsync(turnContext, false, cancellationToken);
        }

        protected override async Task OnMessageActivityAsync(ITurnContext<IMessageActivity> turnContext, CancellationToken cancellationToken)
        {
            var credential = new ManagedIdentityCredential("250ff0a9-1838-4232-85da-089ab7235706");

            var endpoint = new Uri(Configuration["LanguageEndpointHostName"]);
            var client = new QuestionAnsweringClient(endpoint, credential);
            QuestionAnsweringProject project = new QuestionAnsweringProject("cqa", "production");
            //var ans = client.GetAnswersFromText(new AnswersFromTextOptions("Repair", []));
            Response<AnswersResult> response = client.GetAnswers("Repair", project);
            Console.WriteLine($"Answer: {response.Value.Answers.Count}");
            _logger.LogInformation($"Answer: {response.Value.Answers.Count}");
            foreach (var answer in response.Value.Answers)
            {
                await turnContext.SendActivityAsync(MessageFactory.Text($"Answer: {answer.Answer}"), cancellationToken);
            }

            // Run the Dialog with the new message Activity.
            await _dialog.RunAsync(turnContext, _conversationState.CreateProperty<DialogState>(nameof(DialogState)), cancellationToken);
        }

        protected override async Task OnMembersAddedAsync(IList<ChannelAccount> membersAdded, ITurnContext<IConversationUpdateActivity> turnContext, CancellationToken cancellationToken)
        {
            foreach (var member in membersAdded)
            {
                if (member.Id != turnContext.Activity.Recipient.Id)
                {
                    await turnContext.SendActivityAsync(MessageFactory.Text(_defaultWelcome), cancellationToken);
                }
            }
        }

        private void GetKey(AzureKeyCredential credential)
        {
            credential.Key
        }
    }
}

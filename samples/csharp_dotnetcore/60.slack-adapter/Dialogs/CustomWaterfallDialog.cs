using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Bot.Builder;
using Microsoft.Bot.Builder.Dialogs;
using Attachment = Microsoft.Bot.Schema.Attachment;
using System.IO;
using Newtonsoft.Json;
using SlackAPI;
using Microsoft.Bot.Schema;

namespace Microsoft.BotBuilderSamples.Controllers
{
    public class CustomWaterfallDialog : ComponentDialog
    {
        public CustomWaterfallDialog() : base(nameof(CustomWaterfallDialog))
        {

            AddDialog(new TextPrompt(nameof(TextPrompt)));
            AddDialog(new TextPrompt("BlockKit"));
            AddDialog(new NumberPrompt<int>(nameof(NumberPrompt<int>), AgePromptValidatorAsync));

            AddDialog(new WaterfallDialog(nameof(WaterfallDialog), new WaterfallStep[]
            {
                NameStepAsync,
                BlockKitStepAsync,
                ProcessFeedbackAsync,
                AgeStepAsync,
                FinalStepAsync
            }));

            InitialDialogId = nameof(WaterfallDialog);
        }

        private static async Task<DialogTurnResult> NameStepAsync(WaterfallStepContext stepContext, CancellationToken cancellationToken)
        {
            // Create an object in which to collect the user's information within the dialog.
            stepContext.Values["user-profile"] = new UserProfile();

            var promptOptions = new PromptOptions { Prompt = MessageFactory.Text("Please enter your name.") };

            // Ask the user to enter their name.
            return await stepContext.PromptAsync(nameof(TextPrompt), promptOptions, cancellationToken);
        }

        private static async Task<DialogTurnResult> BlockKitStepAsync(WaterfallStepContext stepContext, CancellationToken cancellationToken)
        {
            /*var promptOptions = new PromptOptions { Prompt = MessageFactory.Text("Please enter your name.") };*/
            var userProfile = (UserProfile)stepContext.Values["user-profile"];
            userProfile.Name = (string)stepContext.Result;

            var attachment = CreateInteractiveMessage(Directory.GetCurrentDirectory() + @"\Resources\greeting.json");

            var promptOptions = new PromptOptions { Prompt = (Activity)MessageFactory.Attachment(attachment) };
            promptOptions.Prompt.Text = "hello";

            /*await turnContext.SendActivityAsync(interactiveMessage, cancellationToken);*/


            // Ask the user to enter their name.
            return await stepContext.PromptAsync("BlockKit", promptOptions, cancellationToken);
        }

        private async Task<DialogTurnResult> ProcessFeedbackAsync(WaterfallStepContext stepContext, CancellationToken cancellationToken)
        {
            var response = stepContext.Context.Activity.Text;
            if (response == "click_approve" || response == "click_deny")
            {
                var userProfile = (UserProfile)stepContext.Values["user-profile"];
                userProfile.Clicked = (string)stepContext.Result;

                await stepContext.Context.SendActivityAsync(MessageFactory.Text($"clicked {response}"), cancellationToken);
                return await stepContext.NextAsync(null, cancellationToken);
            } else
            {
                await stepContext.Context.SendActivityAsync(MessageFactory.Text($"Ending dialog, got {stepContext.Context.Activity.Text}"), cancellationToken);
                return await stepContext.EndDialogAsync(stepContext.Values["user-profile"], cancellationToken);
            }
        }

        private static async Task<DialogTurnResult> AgeStepAsync(WaterfallStepContext stepContext, CancellationToken cancellationToken)
        {
            var promptOptions = new PromptOptions { Prompt = MessageFactory.Text("Please enter your age.") };

            // Ask the user to enter their age.
            return await stepContext.PromptAsync(nameof(NumberPrompt<int>), promptOptions, cancellationToken);
        }

        private async Task<DialogTurnResult> FinalStepAsync(WaterfallStepContext stepContext, CancellationToken cancellationToken)
        {
            // Set the user's company selection to what they entered in the review-selection dialog.
            var userProfile = (UserProfile)stepContext.Values["user-profile"];
            userProfile.Age = (int)stepContext.Result;

            // Thank them for participating.
            await stepContext.Context.SendActivityAsync(
                MessageFactory.Text($"Name: {((UserProfile)stepContext.Values["user-profile"]).Name}. \n Clicked: {((UserProfile)stepContext.Values["user-profile"]).Clicked}. \n Age: {((UserProfile)stepContext.Values["user-profile"]).Age}"),
                cancellationToken);

            // Exit the dialog, returning the collected user information.
            return await stepContext.EndDialogAsync(stepContext.Values["user-profile"], cancellationToken);
        }

        private static Task<bool> AgePromptValidatorAsync(PromptValidatorContext<int> promptContext, CancellationToken cancellationToken)
        {
            // This condition is our validation rule. You can also change the value at this point.
            return Task.FromResult(promptContext.Recognized.Succeeded && promptContext.Recognized.Value > 0 && promptContext.Recognized.Value < 150);
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

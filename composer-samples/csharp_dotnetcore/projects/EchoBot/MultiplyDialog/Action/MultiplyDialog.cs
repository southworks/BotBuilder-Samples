// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

using System;
using System.Runtime.CompilerServices;
using System.Threading;
using System.Threading.Tasks;
using AdaptiveExpressions.Properties;
using Microsoft.Bot.Builder.Azure;
using Microsoft.Bot.Builder.Dialogs;
using Newtonsoft.Json;

namespace Microsoft.Bot.Components.Samples.MultiplyDialog
{
    /// <summary>
    /// Custom command which takes takes 2 data bound arguments (arg1 and arg2) and multiplies them returning that as a databound result.
    /// </summary>
    public class MultiplyDialog : Dialog
    {
        [JsonConstructor]
        public MultiplyDialog([CallerFilePath] string sourceFilePath = "", [CallerLineNumber] int sourceLineNumber = 0)
            : base()
        {
            // enable instances of this command as debug break point
            RegisterSourceLocation(sourceFilePath, sourceLineNumber);
        }

        /// <summary>
        /// Gets the unique name (class identifier) of this trigger.
        /// </summary>
        /// <remarks>
        /// There should be at least a .schema file of the same name.  There can optionally be a
        /// .uischema file of the same name that describes how Composer displays this trigger.
        /// </remarks>
        [JsonProperty("$kind")]
        public const string Kind = "MultiplyDialog";

        /// <summary>
        /// Gets or sets memory path to bind to arg1 (ex: conversation.width).
        /// </summary>
        /// <value>
        /// Memory path to bind to arg1 (ex: conversation.width).
        /// </value>
        [JsonProperty("operation")]
        public StringExpression Operation { get; set; }

        /// <summary>
        /// Gets or sets memory path to bind to arg2 (ex: conversation.height).
        /// </summary>
        /// <value>
        /// Memory path to bind to arg2 (ex: conversation.height).
        /// </value>
        [JsonProperty("containerIdName")]
        public StringExpression ContainerIdName { get; set; }

        /// <summary>
        /// Gets or sets caller's memory path to store the result of this step in (ex: conversation.area).
        /// </summary>
        /// <value>
        /// Caller's memory path to store the result of this step in (ex: conversation.area).
        /// </value>
        [JsonProperty("resultProperty")]
        public StringExpression ResultProperty { get; set; }

        public override Task<DialogTurnResult> BeginDialogAsync(DialogContext dc, object options = null, CancellationToken cancellationToken = default(CancellationToken))
        {
            var operation = Operation.GetValue(dc.State);

            StringExpression cosmosDbEndpointSE = "=settings.CosmosDbEndpoint";
            var cosmosDbEndpoint = cosmosDbEndpointSE.GetValue(dc.State);

            StringExpression databaseIdSE = "=settings.CosmosDbDatabaseId";
            var databaseId = databaseIdSE.GetValue(dc.State);

            StringExpression authKeySE = "=settings.CosmosDbAuthKey";
            var authKey = authKeySE.GetValue(dc.State);

            var containerIdName = ContainerIdName.GetValue(dc.State);

            var cosmosDbStorageOptions = new CosmosDbPartitionedStorageOptions()
            {
                CosmosDbEndpoint = cosmosDbEndpoint,
                AuthKey = authKey,
                DatabaseId = databaseId,
                ContainerId = containerIdName,
                CompatibilityMode = false
            };
            var storage = new CosmosDbPartitionedStorage(cosmosDbStorageOptions);

            return dc.EndDialogAsync(null, cancellationToken: cancellationToken);
        }
    }
}

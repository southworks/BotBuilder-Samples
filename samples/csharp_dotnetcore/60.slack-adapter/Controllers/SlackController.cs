// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

using System.Net;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Bot.Builder;
using Microsoft.Bot.Builder.Adapters.Slack;
using Microsoft.Bot.Builder.Integration.AspNet.Core;

namespace Microsoft.BotBuilderSamples.Controllers
{
    [Route("api/slack")]
    [ApiController]
    public class SlackController : ControllerBase
    {
        private readonly IBotFrameworkHttpAdapter _adapter;
        private readonly IBot _bot;

        public SlackController(SlackAdapter adapter, IBot bot)
        {
            _adapter = adapter;
            _bot = bot;
        }

        [HttpPost]
        [HttpGet]
        public async Task<HttpResponseMessage> PostAsync()
        {
            //if (Request.Headers["X-Slack-Retry-Reason"] == "http_timeout")
            //{
            //    Response.ContentType = "text/plain";
            //    Response.StatusCode = StatusCodes.Status200OK;

            //    var data = Encoding.UTF8.GetBytes("Received");

            //    await Response.Body.WriteAsync(data, 0, data.Length, default);
            //    return;
            //}

            new Task(() =>
            {
                // Delegate the processing of the HTTP POST to the adapter.
                // The adapter will invoke the bot.
                _adapter.ProcessAsync(Request, Response, _bot).ConfigureAwait(true);
            }).Start();

            return new HttpResponseMessage(HttpStatusCode.OK);
        }
    }
}

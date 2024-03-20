// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { BotComponent } from "botbuilder";
import { LoggerDialog } from "./loggerDialog";
import { TelemetryLoggerDialog } from "./telemetryLoggerDialog";
import { ConfigLoaderDialog } from "./configLoaderDialog";
import { HttpRequestDialog } from "./HttpRequestDialog";
import { OmniSensitiveData } from "./omniSensitiveData";
import { OmniTraceActivity } from "./omniTraceActivity";
import { ObjectCacheDialog } from "./ObjectCacheDialog";
import { ComponentDeclarativeTypes } from "botbuilder-dialogs-declarative";
import { RapidMessageDialog } from "./RapidMessageDialog";
import { GetAzureTableDataDialog } from "./getAzureTableData";
import {
  ServiceCollection,
  Configuration,
} from "botbuilder-dialogs-adaptive-runtime-core";

export default class OmniVuiCustomActionsBotComponent extends BotComponent {
  configureServices(services: ServiceCollection, _configuration: Configuration): void {
    services.composeFactory<ComponentDeclarativeTypes[]>("declarativeTypes", (declarativeTypes) =>
      declarativeTypes.concat({
        getDeclarativeTypes() {
          return [
            {
              kind: LoggerDialog.$kind,
              type: LoggerDialog,
            },
            {
              kind: ConfigLoaderDialog.$kind,
              type: ConfigLoaderDialog,
            },
            {
              kind: TelemetryLoggerDialog.$kind,
              type: TelemetryLoggerDialog,
            },
            {
              kind: OmniSensitiveData.$kind,
              type: OmniSensitiveData,
            },
            {
              kind: OmniTraceActivity.$kind,
              type: OmniTraceActivity,
            },
            {
              kind: HttpRequestDialog.$kind,
              type: HttpRequestDialog,
            },
            {
              kind: ObjectCacheDialog.$kind,
              type: ObjectCacheDialog,
            },
            {
              kind: RapidMessageDialog.$kind,
              type: RapidMessageDialog
            },
            {
              kind: GetAzureTableDataDialog.$kind,
              type: GetAzureTableDataDialog,
            }
          ];
        },
      })
    );
  }
}

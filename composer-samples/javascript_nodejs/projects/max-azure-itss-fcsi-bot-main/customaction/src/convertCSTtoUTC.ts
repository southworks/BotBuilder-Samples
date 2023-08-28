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
  
  export interface ConvertCSTtoUTCConfiguration extends DialogConfiguration {
    date: string | StringExpression;
    resultProperty?: string | StringExpression;
  }
  export class ConvertCSTtoUTC
    extends Dialog
    implements ConvertCSTtoUTCConfiguration
  {
    public static $kind = "ConvertCSTtoUTC";
  
    public date: StringExpression = new StringExpression();
    public resultProperty?: StringExpression;
  
    public getConverter(
      property: keyof ConvertCSTtoUTCConfiguration
    ): Converter | ConverterFactory {
      switch (property) {
        case "resultProperty":
          return new StringExpressionConverter();
        default:
          return super.getConverter(property);
      }
    }
  
    public beginDialog(dc: DialogContext): Promise<DialogTurnResult> {
     
        const now = new Date()
        const cstDateTime = now.toLocaleString("en-US", {timeZone: "America/Chicago"});

        const cstSplit = cstDateTime.split(',')
        const dateSplit = cstSplit[0].split('/');
        let monthExt
        if(dateSplit[0].length===1){
            monthExt = "0" + dateSplit[0]
        }
        else{
            monthExt = dateSplit[0]
        }

        let dayExt
        if(dateSplit[1].length===1){
            dayExt = "0" + dateSplit[1]
        }
        else{
            dayExt = dateSplit[1]
        }

        const dateConverted = dateSplit[2]+ "-" + monthExt +"-"+ dayExt +"T"
        const timeSplit = cstSplit[1].trim().split(' ')

        const indTimeSplit = timeSplit[0].split(":")
        let hrs = indTimeSplit[0]
        let hrsInt = parseInt(indTimeSplit[0])

        if (timeSplit[1]==="AM"){
            if(hrsInt===12){
              hrs = "00"
            }
            if(hrsInt<10){
                hrs = "0"+ hrs
            }
        }
        else if(timeSplit[1]==="PM" && hrsInt < 12){
            hrsInt = hrsInt + 12
            hrs = hrsInt.toString()
        }

        const timeString = hrs+":"+indTimeSplit[1] +":"+indTimeSplit[2] 
        const result = dateConverted+timeString  
  
        if (this.resultProperty) {
            dc.state.setValue(this.resultProperty.getValue(dc.state), result);
        }
  
        return dc.endDialog(result);
    }
  
    protected onComputeId(): string {
      return "convertCSTtoUTC";
    }
  }
  
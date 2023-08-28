
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import {
  StringExpression,
  StringExpressionConverter,
  ObjectExpression,
  ObjectExpressionConverter,
} from "adaptive-expressions";

import {
  Converter,
  ConverterFactory,
  Dialog,
  DialogConfiguration,
  DialogContext,
  DialogTurnResult,
} from "botbuilder-dialogs";

export interface GetFuncAndSubfunctionConfiguration extends DialogConfiguration {
  intents: ObjectExpression<object>
  products: ObjectExpression<object>
  blobData: ObjectExpression<object>
  queuesOpen: ObjectExpression<object>
  genesysEntitiesDetected: ObjectExpression<object>
  resultProperty?: string | StringExpression;
}

export class GetFuncAndSubfunction
  extends Dialog
  implements GetFuncAndSubfunctionConfiguration 
  {
      public static $kind = "GetFuncAndSubfunction";

      public intents: ObjectExpression<object> = new ObjectExpression();
      public products: ObjectExpression<object> = new ObjectExpression();
      public blobData: ObjectExpression<object> = new ObjectExpression();
      public queuesOpen: ObjectExpression<object> = new ObjectExpression();
      public genesysEntitiesDetected: ObjectExpression<object> = new ObjectExpression();
      public resultProperty?: StringExpression;

      public getConverter(
          property: keyof GetFuncAndSubfunctionConfiguration
      ): Converter | ConverterFactory {
          switch (property) {
          case "intents":
              return new ObjectExpressionConverter();
          case "products":
            return new ObjectExpressionConverter();
          case "blobData":
              return new ObjectExpressionConverter();
          case "queuesOpen":
              return new ObjectExpressionConverter();
          case "genesysEntitiesDetected":
              return new ObjectExpressionConverter();
          case "resultProperty":
              return new StringExpressionConverter();
          default:
              return super.getConverter(property);
      }
  }    


  private findIssueCategory(intent: string, intentsMapping: Map<string, string[]>, genesysEntitiesDetectedArr:string[],  queuesArr:string[]): any {
    let result = {
      found: false,
      function:'',
      subfunction:''
    }
    for(let entry of intentsMapping.entries()){
      result = this.checkIssueMatchesIntent(intent, entry[1], entry[0], genesysEntitiesDetectedArr, queuesArr)
      if(result.found === true){
        return result;
      }
    }
    return result;
  }

  private checkIssueMatchesIntent(intent:string, intentsArr:string[], issueVal:string, genesysEntitiesDetectedArr:string[],  queuesArr:string[]): any{
    let result = {
      found: false,
      function:'',
      subfunction:''
    }
    if(intentsArr.includes(intent)){
      if(issueVal==="Workstation-MACSupport"){
        const val = issueVal.split('-')
        if(genesysEntitiesDetectedArr.includes(val[1]) && queuesArr.includes(val[1])){ 
          result.function = val[1];
          result.found = true;
          return result
        }
        else if(genesysEntitiesDetectedArr.includes(val[0]) && queuesArr.includes(val[0])){
          result.function = val[0];
          result.found = true;
          return result
        }
      }
      else if(genesysEntitiesDetectedArr.includes(issueVal)){ 
        result.found = true;
        result.function = issueVal;
        return result
      }
    }
    return result
  }

  private findProductCategory(products: string[], prodMapp: any): any{
    const prodMappJson = JSON.parse(JSON.stringify(prodMapp))
    let keyArr = Object.keys(prodMapp);
    let keyArr1 = keyArr.map(v => v.toLowerCase());
    let productArr = products.map(v => v.toLowerCase());
    let valArr = Object.values(prodMapp);
    for(let val of productArr){
      let index = keyArr1.indexOf(val)
      if(index!=-1){
          return valArr[index];
      }
    }
    return prodMappJson["Default"];
  }  

  private topThreeIntents(intentsArray: any[]): any{
    let top3:Array<string>=[];
    for(let i=0; i<3; i++){
      if(Number(intentsArray[i][1])>=0.20){
        top3.push(intentsArray[i][0])
      }        
    }
    return top3
  }

  public beginDialog(dc: DialogContext): Promise<DialogTurnResult> {
    const intents = this.intents.getValue(dc.state);
    const products = this.products.getValue(dc.state);
    const blobData = this.blobData.getValue(dc.state);
    const queuesOpen = this.queuesOpen.getValue(dc.state);
    const genesysEntitiesDetected = this.genesysEntitiesDetected.getValue(dc.state);
    let result = {
      found: false,
      function:'',
      subfunction:''
    }
    const queueArray = Object.values(queuesOpen); 
    if( queueArray.includes("Workstation") || queueArray.includes("MACSupport")){
      queueArray.push("Workstation-MACSupport")
    }
    let prodArray = []; 
    if(products != undefined){
      prodArray = Object.values(products);
    }        
    let genesysEntitiesDetectedArr = []; 
    if(genesysEntitiesDetected != undefined){
      genesysEntitiesDetectedArr = Object.values(genesysEntitiesDetected);
    }  

    const blobDataString = JSON.stringify(blobData)
    const blobDataJson = JSON.parse(blobDataString)
    let intentsMapping = new Map<string, string[]>;
    let prodMapping = new Map<string, Object>;
    for (let val of queueArray) {
       if(blobDataJson[val]!= undefined && blobDataJson[val]!= null){
        intentsMapping.set(val, blobDataJson[val].intents)
        prodMapping.set(val, blobDataJson[val].ProductToSubfunctionMapping)
       }
    }
    
    const intentsArray = Object.values(intents);
    let top3 = this.topThreeIntents(intentsArray)  
    
    let value 
    for(let j=0; j<top3.length; j++){
        value = this.findIssueCategory(top3[j], intentsMapping, genesysEntitiesDetectedArr, queueArray)
        if(value.found == true){
          
          value.subfunction = this.findProductCategory(prodArray, prodMapping.get(value.function))
          result = value;
          break;
        }
    }

    if (this.resultProperty) {
      dc.state.setValue(this.resultProperty.getValue(dc.state), JSON.parse(JSON.stringify(result)));
    }

    return dc.endDialog(result);
  }

  protected onComputeId(): string {
    return "GetFuncAndSubfunction";
  }
   
}

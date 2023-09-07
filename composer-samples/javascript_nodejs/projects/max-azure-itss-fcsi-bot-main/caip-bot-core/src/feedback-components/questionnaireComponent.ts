
export interface QuestionnaireConfig {
    questionnaire : any
    
}

export class CAIPQuestionnaireComponent {

    public static generate(rating: number, questionnaireConfig: QuestionnaireConfig): string {
        const questionnaire = CAIPQuestionnaireComponent.getQuestionnaire(rating, questionnaireConfig);
        const questionnaireJSON = `{"$schema": "http://adaptivecards.io/schemas/adaptive-card.json","id":"caipQuestionnaireComponent","type": "AdaptiveCard","version": "1.3","body": [{"type": "TextBlock","text": "${questionnaire.title}","weight": "Bolder","size": "Medium","wrap": true},{"type": "Input.ChoiceSet","id": "options", "wrap":true, "label" : "Options:","isMultiSelect": true,"isRequired" : true,"errorMessage": "Please select at least one option.","choices": ${JSON.stringify(questionnaire.options)}},{"type": "Input.Text","label": "Additional Comments","isMultiline": true,"id": "comments"}],"actions": [{"type": "Action.Submit","title": "Submit Feedback"}]}`;
        return questionnaireJSON;
    }

    protected static getQuestionnaire(rating: number, questionnaireConfig: QuestionnaireConfig) : any {
        if (!rating || rating < 0 || questionnaireConfig.questionnaire.length === 0){
            return questionnaireConfig.questionnaire[0];
        }
        for ( let i = 0; i <= questionnaireConfig.questionnaire.length; i++) {
            if(rating <= questionnaireConfig.questionnaire[i].range.end && rating >= questionnaireConfig.questionnaire[i].range.start) {  
                return questionnaireConfig.questionnaire[i];
            }
        }
    }
}

export interface CAIPRatingConfig {
    title : string,
    type : string,
    range : {
        start: number,
        end: number
    }
}

export enum CAIPRatingType {
    RATING_NUMBER = 'RATING_NUMBER',
    RATING_STAR = 'RATING_STAR'
}


export class CAIPRatingComponent {

    public static generate(ratingConfig: CAIPRatingConfig): string {
        const { rows, blocks } = CAIPRatingComponent.generateRowsBlocks(ratingConfig);
        const ratingJSON = `{"$schema": "http://adaptivecards.io/schemas/adaptive-card.json","id":"caipRatingComponent", "type": "AdaptiveCard","version": "1.3","body": [{"type": "ColumnSet","columns": [{"type": "Column","width": 2, "items": [{"type": "TextBlock","text": "${ratingConfig.title}","horizontalAlignment":"Center","weight": "Bolder","size": "Medium","wrap": true},${CAIPRatingComponent.generateRatingBlocks(ratingConfig, rows, blocks)},{"type": "ColumnSet","columns": [{"type": "Column","width": 2,"items": [{"type": "TextBlock","horizontalAlignment": "Left","text": "${ratingConfig.range.start} - Not at all likely","wrap": false,"size": "Small"}]},{"type": "Column","width": 2,"items": [{"type": "TextBlock","horizontalAlignment": "Right","text": "${ratingConfig.range.end} - Extremely likely","wrap": false,"size": "Small"}]}]},${CAIPRatingComponent.generateSubmitActions(ratingConfig, blocks)}]}]}]}`;
        return ratingJSON;
    }

    protected static generateRowsBlocks(ratingConfig:CAIPRatingConfig): {rows: any, blocks: any} {
        const maxColumnLen = 6
        let rowsLen = Math.round(ratingConfig.range.end/maxColumnLen);
        rowsLen = (rowsLen <= 0) ? 1 : rowsLen;
        let blocks: any = [];
        const rows:any[] = [];
        for (let r = 0; r < rowsLen; r++) {
            rows[r] = [];
        }
        let rowCount = 0;
        for (let i = ratingConfig.range.start; i <= ratingConfig.range.end; i++) {
            rows[rowCount].push(i);
            if ((i+1) === maxColumnLen && rowsLen > 1) {
                rowCount++;
            }
        }
        blocks = [].concat.apply([], rows);
        return {rows, blocks};
    }

    protected static generateRatingBlocks(ratingConfig : CAIPRatingConfig, rows: any, blocks: any): string {       
        
        const columnSet: any[] = [];
        for (let row = 0; row < rows.length; row++) {
            columnSet.push(`{"type": "ColumnSet","id" : "row${row}", "horizontalAlignment" : "Center", "columns": [${CAIPRatingComponent.generateColumnBlocks(ratingConfig, rows[row], blocks)}]}`);
        }
        return columnSet.toString();
    }

    protected static getBlockURL(ratingType: string, blockType: string, currentColumn: number) {
        let url;
        switch(ratingType) {
            case CAIPRatingType.RATING_NUMBER :
                url = `"https://cdn.ava.optum.com/caip/images/components/nps-rating/number/${blockType}/Button-${currentColumn}.svg"`;
            break;
            case CAIPRatingType.RATING_STAR :
                url = `"https://cdn.ava.optum.com/caip/images/components/nps-rating/star/${blockType}/star-${blockType}.svg"`;
            break;
        }
        return url;
    }

    protected static generateColumnBlocks(ratingConfig: CAIPRatingConfig, row: any, blocks: []): string {
        const columns:any = []
        for (let col = 0; col < row.length; col++) {
            const defaultblockConfig = {
                blockType : 'default',
                currentColumn : row[col],
                isVisible : true,
                imgUrl : CAIPRatingComponent.getBlockURL(ratingConfig.type, 'default', row[col])
            };
            const selectedblockConfig = {
                blockType : 'selected',
                currentColumn : row[col],
                isVisible : false,
                imgUrl : CAIPRatingComponent.getBlockURL(ratingConfig.type, 'selected', row[col])
            };
            columns.push(`{"type": "Column","id" : "column${row[col]}", "width": "30px","items": [${CAIPRatingComponent.generateBlocks(ratingConfig, defaultblockConfig, blocks)},${CAIPRatingComponent.generateBlocks(ratingConfig, selectedblockConfig, blocks)}]}`);
        }
        return columns.toString();
    }

    protected static generateBlocks(ratingConfig: CAIPRatingConfig, blockConfig: any, blocks: []) : string {
        const {blockType, currentColumn, imgUrl, isVisible} = blockConfig;
        const defaultBlock = `{"type": "Image","url": ${imgUrl},"id": "${blockType + currentColumn}","altText" : "Rating ${currentColumn}","isVisible" : ${isVisible},"selectAction": {"type": "Action.ToggleVisibility","targetElements": ${JSON.stringify(CAIPRatingComponent.getTargetElements(ratingConfig, currentColumn, blocks, blockType))}}}`;
        return defaultBlock;
    }

    protected static getTargetElements(ratingConfig: CAIPRatingConfig, currentColumn: number, blocks: [], blockType: string) : [] {
        const targetElements : any = CAIPRatingComponent.generateTargetElements(currentColumn, blocks, blockType);
        for (let i = 0; i < targetElements.length; i++) {
            for (let b = 0; b < blocks.length; b++) {
                const submit = (targetElements[i].elementId === "submit" + blocks[b]) ? targetElements[i] : null;
                CAIPRatingComponent.setSubmitButton(submit, blockType, currentColumn, targetElements[i], blocks[b], ratingConfig);
            }
        }
        return targetElements;
    }

    protected static setSubmitButton(submit: any, blockType: string, currentColumn: number, targetElement: any, block: any, ratingConfig: CAIPRatingConfig) {
        if (submit) {
            if (blockType === 'default' && currentColumn === block) {
                submit.isVisible = true;
            }
            else if (blockType === 'selected') {
                const submitId = (currentColumn <= ratingConfig.range.start) ? currentColumn : currentColumn-1;
                const lowerSubmit = (targetElement.elementId === "submit" + submitId) ? targetElement : null;
                if (lowerSubmit) {
                    lowerSubmit.isVisible = true;
                }
            }
        }
    }

    protected static generateTargetElements(currentColumn: number, blocks: [], blockType: string) : [] {
        const targetElements : any = [];
        for (let i = 0; i < blocks.length; i++) {
            const rSelected: any = {
                elementId: "selected" + blocks[i],
                isVisible: false
            };
            const rDefault: any = {
                elementId: "default" + blocks[i],
                isVisible: false
            };
            const submit: any = {
                elementId: "submit" + blocks[i],
                isVisible: false
            }
            if (blockType === 'default') {
                CAIPRatingComponent.setDefaultBlockVisibility(currentColumn, blocks[i], rSelected, rDefault, submit);
            } else if (blockType === 'selected'){
                CAIPRatingComponent.setSelectedBlockVisibility(currentColumn, blocks[i], rSelected, rDefault, submit);
            }
            targetElements.push(rSelected, rDefault, submit);
        }
        return targetElements;
    }

    protected static setDefaultBlockVisibility(currentColumn: number, block:any, rSelected: any, rDefault: any, submit: any) {
        if(currentColumn >= block) {
            rSelected.isVisible = true;
        } else {
            rDefault.isVisible = true;
        }
        if(currentColumn === block) {
            submit.isVisible = true;
        }
    }

    protected static setSelectedBlockVisibility(currentColumn: number, block:any, rSelected: any, rDefault: any, submit: any) {
        if(currentColumn > block) {
            rSelected.isVisible = true;
        } else {
            rDefault.isVisible = true;
        }
        if(currentColumn === block) {
            rDefault.isVisible = true;
            rSelected.isVisible = false;
        }
    }

    protected static generateSubmitActions(ratingConfig: CAIPRatingConfig, blocks: any) : string {
        const submitActions = [];
        for (let i = 0; i < blocks.length; i++) {
            submitActions.push(`{"type": "ActionSet","id": "submit${blocks[i]}","isVisible": ${(blocks[i] === ratingConfig.range.start)},"actions": [{"type": "Action.Submit","title": "Submit Feedback","data": {"rating": ${blocks[i]}}}]}`);
        }
        return submitActions.toString();

    }
}

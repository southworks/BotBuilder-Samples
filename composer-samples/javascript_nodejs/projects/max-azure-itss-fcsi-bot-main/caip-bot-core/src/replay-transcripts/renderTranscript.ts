
import { Activity } from "botbuilder";
import axios, { AxiosRequestConfig } from "axios";
const qs = require('qs');
export type botCredentials = {
    msAppId: string;
    msAppPassword: string;
};
export class RenderTranscript {

    constructor() {
    }

    filterTypeMessage(activities: Partial<Activity>[]) : Partial<Activity>[] {
        return activities.filter(activity => activity.type === 'message');
    }


    removeExtraFields(activities: Partial<Activity>[]): Partial<Activity>[] {
        const filteredActivities =  activities.map((activity) => {
            if(activity.channelData) {
                delete activity.channelData;
            }
            if(activity.localTimezone) {
                delete activity.localTimezone;
            }
            if(activity.localTimestamp) {
                delete activity.localTimestamp
            }
            if(activity.locale) {
                delete activity.locale;
            }
            if(activity.textFormat) {
                delete activity.textFormat;
            }
            if(activity.replyToId) {
                delete activity.replyToId;
            }
            return activity
        });
        return filteredActivities;
     }
    preProcessActivities(activitiesArray:Partial<Activity>[], conversationId: string): Partial<Activity>[] {
        const messageActivities = this.filterTypeMessage(activitiesArray);
        return this.removeExtraFields(messageActivities);
    }

    public async getAuthToken(botCredentials: botCredentials): Promise<string> {

        const data = qs.stringify({
            'scope': `https://api.botframework.com/.default`,
            'grant_type': 'client_credentials',
            'client_id': `${botCredentials.msAppId}`,
            'client_secret': `${botCredentials.msAppPassword}`
        });
        const response = await axios.post('https://login.microsoftonline.com/botframework.com/oauth2/v2.0/token', data);
        return response.data.access_token;
    }

    async invokeHistoryAPI(
        activities: Partial<Activity>[],
        conversationId: string,
        botCredentials: botCredentials
    ) {
        try {
            const authToken = await this.getAuthToken(botCredentials);
            const filteredActivities = this.preProcessActivities(activities, conversationId);

            const data = JSON.stringify({
                activities: filteredActivities,
            });

            const config: AxiosRequestConfig = {
                method: "post",
                url: `https://directline.botframework.com/v3/conversations/${conversationId}/activities/history`,
                headers: {
                    Authorization: `Bearer ${authToken}`,
                    "Content-Type": "application/json",
                },
                data: data,
            };

            await axios.post(config.url, data, { headers : config.headers});
        } catch (err: any) {
            console.log(err.message);
        }
    }
}

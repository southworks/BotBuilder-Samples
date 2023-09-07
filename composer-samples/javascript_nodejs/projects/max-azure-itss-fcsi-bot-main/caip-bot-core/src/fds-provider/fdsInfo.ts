export interface FdsPostBody {
    spaceId: string;
    file: any;
    fileName: string;
    expiryDate: string;
    documentId?: string;
}

export interface FdsGetBody {
    spaceId: string;
    documentId: string;
    timeToLive: string
}
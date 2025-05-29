
export declare type Step = {
    id: Number;
    name: string;
    content?: any;
    status?: 'not-started' | 'running' | 'completed' | 'failed' | 'cancelled';
}
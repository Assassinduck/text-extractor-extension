export interface CommandOptions {
    filename: string;
    content: string;
}

export interface FileHandlingResult {
    success: boolean;
    message: string;
}
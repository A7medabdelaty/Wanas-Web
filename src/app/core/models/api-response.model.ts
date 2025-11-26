export interface ApiResponse<T> {
    success: boolean;
    errorCode?: string;
    message?: string;
    data: T;
}

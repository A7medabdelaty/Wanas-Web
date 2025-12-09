export interface ApiPagedResponse<T> {
    success: boolean;
    data: T[];
    totalCount: number;
    page: number;
    pageSize: number;
}
